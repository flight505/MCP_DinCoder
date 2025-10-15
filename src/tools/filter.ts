/**
 * Task Filtering Tool
 *
 * Smart filtering and querying for tasks.md files.
 * Helps AI find relevant tasks quickly in large backlogs.
 */

import * as path from 'path';
import { z } from 'zod';
import {
  parseTasksFile,
  buildDependencyGraph,
  topologicalSort,
  type Task,
} from '../speckit/taskParser.js';

// Zod schema for tasks_filter tool
export const TasksFilterSchema = z.object({
  workspacePath: z.string().optional().describe('Path to workspace directory containing .dincoder folder'),
  tasksPath: z.string().optional().describe('Direct path to tasks.md file (overrides workspacePath)'),
  status: z.enum(['pending', 'in_progress', 'completed', 'all']).default('all').describe('Filter by task status'),
  phase: z.string().optional().describe('Filter by phase (e.g., "setup", "core", "polish")'),
  type: z.string().optional().describe('Filter by type (e.g., "frontend", "backend", "test", "docs")'),
  blocker: z.enum(['blocked', 'unblocked', 'all']).default('all').describe('Filter by blocker status'),
  tags: z.array(z.string()).optional().describe('Filter by tags (AND logic - task must have all tags)'),
  priority: z.enum(['high', 'medium', 'low', 'all']).default('all').describe('Filter by priority'),
  preset: z.enum(['next', 'frontend', 'backend', 'ready', 'cleanup', 'none']).default('none').describe('Use a smart preset filter'),
  sortBy: z.enum(['id', 'priority', 'dependencies', 'phase']).default('id').describe('Sort results by field'),
  limit: z.number().optional().describe('Limit number of results'),
});

export type TasksFilterParams = z.infer<typeof TasksFilterSchema>;

/**
 * Smart preset configurations
 */
const PRESETS: Record<string, Partial<TasksFilterParams>> = {
  next: {
    status: 'pending',
    blocker: 'unblocked',
    sortBy: 'priority',
  },
  frontend: {
    type: 'frontend',
    blocker: 'unblocked',
    status: 'pending',
  },
  backend: {
    type: 'backend',
    blocker: 'unblocked',
    status: 'pending',
  },
  ready: {
    status: 'pending',
    blocker: 'unblocked',
    priority: 'high',
  },
  cleanup: {
    phase: 'polish',
    priority: 'low',
  },
};

/**
 * Filter tasks based on criteria
 */
export async function tasksFilter(params: TasksFilterParams): Promise<string> {
  // Apply preset if specified
  let effectiveParams = { ...params };
  if (params.preset !== 'none' && PRESETS[params.preset]) {
    effectiveParams = { ...effectiveParams, ...PRESETS[params.preset] };
  }

  // Resolve tasks.md path
  const tasksPath = effectiveParams.tasksPath || path.join(
    effectiveParams.workspacePath || process.cwd(),
    '.dincoder',
    'tasks.md'
  );

  // Parse tasks
  const allTasks = parseTasksFile(tasksPath);
  const graph = buildDependencyGraph(allTasks);

  // Apply filters
  let filtered = allTasks;

  // Filter by status
  if (effectiveParams.status !== 'all') {
    filtered = filtered.filter(t => t.status === effectiveParams.status);
  }

  // Filter by phase
  if (effectiveParams.phase) {
    filtered = filtered.filter(t => t.metadata.phase === effectiveParams.phase);
  }

  // Filter by type
  if (effectiveParams.type) {
    filtered = filtered.filter(t => t.metadata.type === effectiveParams.type);
  }

  // Filter by priority
  if (effectiveParams.priority !== 'all') {
    filtered = filtered.filter(t => t.metadata.priority === effectiveParams.priority);
  }

  // Filter by tags (AND logic)
  if (effectiveParams.tags && effectiveParams.tags.length > 0) {
    filtered = filtered.filter(t => {
      const taskTags = t.metadata.tags || [];
      return effectiveParams.tags!.every(tag => taskTags.includes(tag));
    });
  }

  // Filter by blocker status
  if (effectiveParams.blocker !== 'all') {
    const completedTaskIds = new Set(
      allTasks.filter(t => t.status === 'completed').map(t => t.id)
    );

    filtered = filtered.filter(t => {
      const dependencies = graph.edges.get(t.id) || [];
      const isBlocked = dependencies.some(depId => !completedTaskIds.has(depId));

      return effectiveParams.blocker === 'blocked' ? isBlocked : !isBlocked;
    });
  }

  // Sort results
  filtered = sortTasks(filtered, effectiveParams.sortBy, graph, allTasks);

  // Apply limit
  if (effectiveParams.limit && effectiveParams.limit > 0) {
    filtered = filtered.slice(0, effectiveParams.limit);
  }

  // Format results
  return formatFilterResults(filtered, allTasks, effectiveParams);
}

/**
 * Sort tasks based on criteria
 */
function sortTasks(
  tasks: Task[],
  sortBy: string,
  graph: ReturnType<typeof buildDependencyGraph>,
  allTasks: Task[]
): Task[] {
  switch (sortBy) {
    case 'priority': {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return [...tasks].sort((a, b) => {
        const aPriority = a.metadata.priority || 'medium';
        const bPriority = b.metadata.priority || 'medium';
        return priorityOrder[aPriority] - priorityOrder[bPriority];
      });
    }

    case 'dependencies': {
      // Topological sort (dependencies first)
      const sorted = topologicalSort(allTasks);
      const taskIds = new Set(tasks.map(t => t.id));
      return sorted.filter(t => taskIds.has(t.id));
    }

    case 'phase': {
      const phaseOrder = ['setup', 'core', 'polish', 'other'];
      return [...tasks].sort((a, b) => {
        const aPhase = a.metadata.phase || 'other';
        const bPhase = b.metadata.phase || 'other';
        const aIndex = phaseOrder.indexOf(aPhase) !== -1 ? phaseOrder.indexOf(aPhase) : 3;
        const bIndex = phaseOrder.indexOf(bPhase) !== -1 ? phaseOrder.indexOf(bPhase) : 3;
        return aIndex - bIndex;
      });
    }

    case 'id':
    default:
      return [...tasks].sort((a, b) => a.id.localeCompare(b.id));
  }
}

/**
 * Format filter results as markdown
 */
function formatFilterResults(
  filtered: Task[],
  allTasks: Task[],
  params: TasksFilterParams
): string {
  let output = '# Task Filter Results\n\n';

  // Summary header
  output += `**Filter Criteria:**\n`;
  if (params.preset !== 'none') {
    output += `- Preset: ${params.preset}\n`;
  }
  if (params.status !== 'all') {
    output += `- Status: ${params.status}\n`;
  }
  if (params.phase) {
    output += `- Phase: ${params.phase}\n`;
  }
  if (params.type) {
    output += `- Type: ${params.type}\n`;
  }
  if (params.priority !== 'all') {
    output += `- Priority: ${params.priority}\n`;
  }
  if (params.blocker !== 'all') {
    output += `- Blocker: ${params.blocker}\n`;
  }
  if (params.tags && params.tags.length > 0) {
    output += `- Tags: ${params.tags.join(', ')}\n`;
  }
  if (params.sortBy) {
    output += `- Sort: ${params.sortBy}\n`;
  }

  output += `\n**Results:** ${filtered.length} task${filtered.length !== 1 ? 's' : ''} found (out of ${allTasks.length} total)\n\n`;

  if (filtered.length === 0) {
    output += '*No tasks match the filter criteria.*\n';
    return output;
  }

  output += '---\n\n';

  // Task list
  for (const task of filtered) {
    const checkbox = task.status === 'completed' ? '[x]' : task.status === 'in_progress' ? '[~]' : '[ ]';

    output += `${checkbox} **${task.id}**: ${task.description}\n`;

    // Add metadata if available
    const metadata: string[] = [];
    if (task.metadata.phase) {
      metadata.push(`phase: ${task.metadata.phase}`);
    }
    if (task.metadata.type) {
      metadata.push(`type: ${task.metadata.type}`);
    }
    if (task.metadata.priority) {
      metadata.push(`priority: ${task.metadata.priority}`);
    }
    if (task.metadata.effort) {
      metadata.push(`effort: ${task.metadata.effort}`);
    }
    if (task.metadata.depends && task.metadata.depends.length > 0) {
      metadata.push(`depends: ${task.metadata.depends.join(', ')}`);
    }
    if (task.metadata.tags && task.metadata.tags.length > 0) {
      metadata.push(`tags: ${task.metadata.tags.join(', ')}`);
    }

    if (metadata.length > 0) {
      output += `  *${metadata.join(' | ')}*\n`;
    }

    output += '\n';
  }

  return output;
}
