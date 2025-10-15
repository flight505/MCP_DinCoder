/**
 * Task Statistics Tool
 *
 * Generate comprehensive statistics and progress metrics from tasks.md.
 * Provides insights on completion, velocity, blockers, and phase/type distribution.
 */

import * as path from 'path';
import { z } from 'zod';
import {
  parseTasksFile,
  buildDependencyGraph,
  type Task,
} from '../speckit/taskParser.js';

// Zod schema for tasks_stats tool
export const TasksStatsSchema = z.object({
  workspacePath: z.string().optional().describe('Path to workspace directory containing .dincoder folder'),
  tasksPath: z.string().optional().describe('Direct path to tasks.md file (overrides workspacePath)'),
  groupBy: z.enum(['status', 'phase', 'type', 'priority', 'all']).default('all').describe('Group statistics by dimension'),
  includeCharts: z.boolean().default(true).describe('Include ASCII progress charts'),
  showBlockers: z.boolean().default(true).describe('Show blocker analysis'),
  showVelocity: z.boolean().default(false).describe('Show velocity metrics (requires task completion timestamps)'),
});

export type TasksStatsParams = z.infer<typeof TasksStatsSchema>;

interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  completionPercentage: number;
}

interface PhaseStats {
  [phase: string]: TaskStats;
}

interface TypeStats {
  [type: string]: TaskStats;
}

interface PriorityStats {
  high: number;
  medium: number;
  low: number;
  unspecified: number;
}

interface BlockerInfo {
  blockedTasks: number;
  unblockedTasks: number;
  blockersList: Array<{
    taskId: string;
    description: string;
    blockedBy: string[];
  }>;
}

/**
 * Generate task statistics and progress metrics
 */
export async function tasksStats(params: TasksStatsParams): Promise<string> {
  // Resolve tasks.md path
  const tasksPath = params.tasksPath || path.join(
    params.workspacePath || process.cwd(),
    '.dincoder',
    'tasks.md'
  );

  // Parse tasks
  const tasks = parseTasksFile(tasksPath);

  if (tasks.length === 0) {
    return '# Task Statistics\n\nNo tasks found in tasks.md';
  }

  // Build dependency graph for blocker analysis
  const graph = buildDependencyGraph(tasks);

  // Generate statistics
  let output = '# Task Statistics\n\n';

  // Overall stats
  const overallStats = calculateOverallStats(tasks);
  output += formatOverallStats(overallStats);

  if (params.includeCharts) {
    output += '\n' + generateProgressChart(overallStats);
  }

  // Group-specific stats
  if (params.groupBy === 'all' || params.groupBy === 'phase') {
    const phaseStats = calculatePhaseStats(tasks);
    output += '\n## Statistics by Phase\n\n';
    output += formatPhaseStats(phaseStats);
  }

  if (params.groupBy === 'all' || params.groupBy === 'type') {
    const typeStats = calculateTypeStats(tasks);
    output += '\n## Statistics by Type\n\n';
    output += formatTypeStats(typeStats);
  }

  if (params.groupBy === 'all' || params.groupBy === 'priority') {
    const priorityStats = calculatePriorityStats(tasks);
    output += '\n## Priority Distribution\n\n';
    output += formatPriorityStats(priorityStats);
  }

  // Blocker analysis
  if (params.showBlockers) {
    const blockerInfo = analyzeBlockers(tasks, graph);
    output += '\n## Blocker Analysis\n\n';
    output += formatBlockerInfo(blockerInfo);
  }

  return output;
}

/**
 * Calculate overall task statistics
 */
function calculateOverallStats(tasks: Task[]): TaskStats {
  const stats: TaskStats = {
    total: tasks.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    completionPercentage: 0,
  };

  for (const task of tasks) {
    switch (task.status) {
      case 'pending':
        stats.pending++;
        break;
      case 'in_progress':
        stats.inProgress++;
        break;
      case 'completed':
        stats.completed++;
        break;
    }
  }

  stats.completionPercentage = Math.round((stats.completed / stats.total) * 100);

  return stats;
}

/**
 * Calculate statistics grouped by phase
 */
function calculatePhaseStats(tasks: Task[]): PhaseStats {
  const phaseStats: PhaseStats = {};

  for (const task of tasks) {
    const phase = task.metadata.phase || 'unspecified';

    if (!phaseStats[phase]) {
      phaseStats[phase] = {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        completionPercentage: 0,
      };
    }

    phaseStats[phase].total++;

    switch (task.status) {
      case 'pending':
        phaseStats[phase].pending++;
        break;
      case 'in_progress':
        phaseStats[phase].inProgress++;
        break;
      case 'completed':
        phaseStats[phase].completed++;
        break;
    }
  }

  // Calculate completion percentages
  for (const phase in phaseStats) {
    const stats = phaseStats[phase];
    stats.completionPercentage = Math.round((stats.completed / stats.total) * 100);
  }

  return phaseStats;
}

/**
 * Calculate statistics grouped by type
 */
function calculateTypeStats(tasks: Task[]): TypeStats {
  const typeStats: TypeStats = {};

  for (const task of tasks) {
    const type = task.metadata.type || 'unspecified';

    if (!typeStats[type]) {
      typeStats[type] = {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        completionPercentage: 0,
      };
    }

    typeStats[type].total++;

    switch (task.status) {
      case 'pending':
        typeStats[type].pending++;
        break;
      case 'in_progress':
        typeStats[type].inProgress++;
        break;
      case 'completed':
        typeStats[type].completed++;
        break;
    }
  }

  // Calculate completion percentages
  for (const type in typeStats) {
    const stats = typeStats[type];
    stats.completionPercentage = Math.round((stats.completed / stats.total) * 100);
  }

  return typeStats;
}

/**
 * Calculate priority distribution
 */
function calculatePriorityStats(tasks: Task[]): PriorityStats {
  const stats: PriorityStats = {
    high: 0,
    medium: 0,
    low: 0,
    unspecified: 0,
  };

  for (const task of tasks) {
    const priority = task.metadata.priority || 'unspecified';

    if (priority === 'high') {
      stats.high++;
    } else if (priority === 'medium') {
      stats.medium++;
    } else if (priority === 'low') {
      stats.low++;
    } else {
      stats.unspecified++;
    }
  }

  return stats;
}

/**
 * Analyze task blockers and dependencies
 */
function analyzeBlockers(tasks: Task[], graph: ReturnType<typeof buildDependencyGraph>): BlockerInfo {
  const completedTaskIds = new Set(
    tasks.filter(t => t.status === 'completed').map(t => t.id)
  );

  const blockersList: BlockerInfo['blockersList'] = [];
  let unblockedCount = 0;

  for (const task of tasks) {
    if (task.status === 'completed') {
      continue; // Skip completed tasks
    }

    const dependencies = graph.edges.get(task.id) || [];

    if (dependencies.length === 0) {
      unblockedCount++;
      continue;
    }

    const uncompletedDeps = dependencies.filter(depId => !completedTaskIds.has(depId));

    if (uncompletedDeps.length === 0) {
      unblockedCount++;
    } else {
      blockersList.push({
        taskId: task.id,
        description: task.description,
        blockedBy: uncompletedDeps,
      });
    }
  }

  return {
    blockedTasks: blockersList.length,
    unblockedTasks: unblockedCount,
    blockersList,
  };
}

/**
 * Format overall statistics
 */
function formatOverallStats(stats: TaskStats): string {
  let output = '## Overall Progress\n\n';

  output += `**Total Tasks:** ${stats.total}\n`;
  output += `**Completed:** ${stats.completed} (${stats.completionPercentage}%)\n`;
  output += `**In Progress:** ${stats.inProgress}\n`;
  output += `**Pending:** ${stats.pending}\n\n`;

  return output;
}

/**
 * Generate ASCII progress chart
 */
function generateProgressChart(stats: TaskStats): string {
  const barWidth = 50;
  const completedBar = Math.round((stats.completed / stats.total) * barWidth);
  const inProgressBar = Math.round((stats.inProgress / stats.total) * barWidth);
  const pendingBar = barWidth - completedBar - inProgressBar;

  let output = '### Progress Chart\n\n';
  output += '```\n';
  output += '│' + '█'.repeat(completedBar) + '▓'.repeat(inProgressBar) + '░'.repeat(pendingBar) + '│ ' + stats.completionPercentage + '%\n';
  output += '```\n\n';
  output += '**Legend:** █ Completed | ▓ In Progress | ░ Pending\n';

  return output;
}

/**
 * Format phase statistics
 */
function formatPhaseStats(phaseStats: PhaseStats): string {
  let output = '';

  const phases = Object.keys(phaseStats).sort();

  for (const phase of phases) {
    const stats = phaseStats[phase];
    output += `### ${phase}\n\n`;
    output += `- **Total:** ${stats.total}\n`;
    output += `- **Completed:** ${stats.completed} (${stats.completionPercentage}%)\n`;
    output += `- **In Progress:** ${stats.inProgress}\n`;
    output += `- **Pending:** ${stats.pending}\n\n`;
  }

  return output;
}

/**
 * Format type statistics
 */
function formatTypeStats(typeStats: TypeStats): string {
  let output = '';

  const types = Object.keys(typeStats).sort();

  for (const type of types) {
    const stats = typeStats[type];
    output += `### ${type}\n\n`;
    output += `- **Total:** ${stats.total}\n`;
    output += `- **Completed:** ${stats.completed} (${stats.completionPercentage}%)\n`;
    output += `- **In Progress:** ${stats.inProgress}\n`;
    output += `- **Pending:** ${stats.pending}\n\n`;
  }

  return output;
}

/**
 * Format priority statistics
 */
function formatPriorityStats(stats: PriorityStats): string {
  let output = '';

  const total = stats.high + stats.medium + stats.low + stats.unspecified;

  output += `- **High Priority:** ${stats.high} (${Math.round((stats.high / total) * 100)}%)\n`;
  output += `- **Medium Priority:** ${stats.medium} (${Math.round((stats.medium / total) * 100)}%)\n`;
  output += `- **Low Priority:** ${stats.low} (${Math.round((stats.low / total) * 100)}%)\n`;
  output += `- **Unspecified:** ${stats.unspecified} (${Math.round((stats.unspecified / total) * 100)}%)\n\n`;

  return output;
}

/**
 * Format blocker information
 */
function formatBlockerInfo(info: BlockerInfo): string {
  let output = '';

  output += `**Unblocked Tasks:** ${info.unblockedTasks} (ready to start)\n`;
  output += `**Blocked Tasks:** ${info.blockedTasks}\n\n`;

  if (info.blockersList.length > 0) {
    output += '### Blocked Tasks\n\n';

    for (const blocked of info.blockersList) {
      output += `- **${blocked.taskId}**: ${blocked.description}\n`;
      output += `  - Blocked by: ${blocked.blockedBy.join(', ')}\n\n`;
    }
  } else {
    output += '*No blocked tasks! All pending tasks are ready to start.*\n';
  }

  return output;
}
