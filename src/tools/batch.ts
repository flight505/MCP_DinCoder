/**
 * Batch Task Operations Tool
 *
 * Mark multiple tasks as complete at once.
 * Supports array format, range format, and mixed format.
 */

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { parseTasksFile, type Task } from '../speckit/taskParser.js';

// Zod schema for tasks_tick_range tool
export const TasksTickRangeSchema = z.object({
  workspacePath: z.string().optional().describe('Path to workspace directory containing .dincoder folder'),
  tasksPath: z.string().optional().describe('Direct path to tasks.md file (overrides workspacePath)'),
  taskIds: z.union([
    z.array(z.string()),
    z.string(),
  ]).describe('Task IDs to complete. Supports array ["T001", "T003"], range "T001-T005", or mixed ["T001-T005", "T010"]'),
  notes: z.string().optional().describe('Optional completion notes'),
  strict: z.boolean().default(false).describe('If true, fail all if any task is invalid. If false, skip invalid tasks and continue.'),
});

export type TasksTickRangeParams = z.infer<typeof TasksTickRangeSchema>;

interface CompletionReport {
  completed: string[];
  failed: { id: string; reason: string }[];
  skipped: { id: string; reason: string }[];
}

/**
 * Mark multiple tasks as complete
 */
export async function tasksTickRange(params: TasksTickRangeParams): Promise<string> {
  // Resolve tasks.md path
  const tasksPath = params.tasksPath || path.join(
    params.workspacePath || process.cwd(),
    '.dincoder',
    'tasks.md'
  );

  if (!fs.existsSync(tasksPath)) {
    throw new Error(`Tasks file not found: ${tasksPath}`);
  }

  // Parse task IDs
  const taskIds = parseTaskIds(params.taskIds);

  // Validate task IDs before making any changes
  const tasks = parseTasksFile(tasksPath);
  const validation = validateTaskIds(taskIds, tasks, params.strict);

  if (params.strict && validation.failed.length > 0) {
    throw new Error(
      `Strict mode: Cannot complete tasks due to validation errors:\n` +
      validation.failed.map(f => `- ${f.id}: ${f.reason}`).join('\n')
    );
  }

  // Read tasks.md content
  const content = fs.readFileSync(tasksPath, 'utf-8');
  const lines = content.split('\n');

  const report: CompletionReport = {
    completed: [],
    failed: [],
    skipped: [],
  };

  // Mark tasks as complete
  for (const taskId of taskIds) {
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      report.failed.push({ id: taskId, reason: 'Task not found' });
      continue;
    }

    if (task.status === 'completed') {
      report.skipped.push({ id: taskId, reason: 'Already completed' });
      continue;
    }

    // Update the line (convert [ ] or [~] to [x])
    const lineIndex = task.line - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      const updatedLine = line.replace(/\[([ ~])\]/, '[x]');
      lines[lineIndex] = updatedLine;
      report.completed.push(taskId);
    } else {
      report.failed.push({ id: taskId, reason: 'Invalid line number' });
    }
  }

  // Write back to file if any tasks were completed
  if (report.completed.length > 0) {
    const updatedContent = lines.join('\n');
    fs.writeFileSync(tasksPath, updatedContent, 'utf-8');
  }

  // Add to report's failed list
  report.failed.push(...validation.failed);

  // Format report
  return formatCompletionReport(report, params, tasksPath);
}

/**
 * Parse task IDs from various formats
 */
function parseTaskIds(input: string | string[]): string[] {
  const taskIds: string[] = [];

  const inputs = Array.isArray(input) ? input : [input];

  for (const item of inputs) {
    // Check if it's a range format (T001-T005)
    const rangeMatch = item.match(/^([A-Z]\d+)-([A-Z]\d+)$/i);

    if (rangeMatch) {
      const [, start, end] = rangeMatch;
      const startNum = parseInt(start.substring(1), 10);
      const endNum = parseInt(end.substring(1), 10);
      const prefix = start.charAt(0);

      if (startNum <= endNum) {
        for (let i = startNum; i <= endNum; i++) {
          taskIds.push(`${prefix}${String(i).padStart(3, '0')}`);
        }
      } else {
        throw new Error(`Invalid range: ${item} (start > end)`);
      }
    } else if (/^[A-Z]\d+$/i.test(item)) {
      // Single task ID
      taskIds.push(item.toUpperCase());
    } else {
      throw new Error(`Invalid task ID format: ${item}`);
    }
  }

  return [...new Set(taskIds)]; // Remove duplicates
}

/**
 * Validate task IDs
 */
function validateTaskIds(
  taskIds: string[],
  tasks: Task[],
  strict: boolean
): { failed: { id: string; reason: string }[] } {
  const failed: { id: string; reason: string }[] = [];
  const taskMap = new Map(tasks.map(t => [t.id, t]));

  for (const taskId of taskIds) {
    const task = taskMap.get(taskId);

    if (!task) {
      failed.push({ id: taskId, reason: 'Task not found in tasks.md' });
    } else if (task.status === 'completed' && strict) {
      failed.push({ id: taskId, reason: 'Already completed (strict mode)' });
    }
  }

  return { failed };
}

/**
 * Format completion report
 */
function formatCompletionReport(
  report: CompletionReport,
  params: TasksTickRangeParams,
  tasksPath: string
): string {
  let output = '# Batch Task Completion Report\n\n';

  const total = report.completed.length + report.failed.length + report.skipped.length;

  output += `**Summary:**\n`;
  output += `- Total tasks processed: ${total}\n`;
  output += `- ✅ Completed: ${report.completed.length}\n`;
  output += `- ⏭️ Skipped: ${report.skipped.length}\n`;
  output += `- ❌ Failed: ${report.failed.length}\n`;
  output += `- Mode: ${params.strict ? 'strict (all-or-nothing)' : 'lenient (skip invalid)'}\n`;
  output += `\n`;

  if (params.notes) {
    output += `**Notes:** ${params.notes}\n\n`;
  }

  output += `**Updated file:** ${tasksPath}\n\n`;

  output += '---\n\n';

  if (report.completed.length > 0) {
    output += `## ✅ Completed (${report.completed.length})\n\n`;
    for (const taskId of report.completed) {
      output += `- ${taskId}\n`;
    }
    output += '\n';
  }

  if (report.skipped.length > 0) {
    output += `## ⏭️ Skipped (${report.skipped.length})\n\n`;
    for (const { id, reason } of report.skipped) {
      output += `- ${id}: *${reason}*\n`;
    }
    output += '\n';
  }

  if (report.failed.length > 0) {
    output += `## ❌ Failed (${report.failed.length})\n\n`;
    for (const { id, reason } of report.failed) {
      output += `- ${id}: *${reason}*\n`;
    }
    output += '\n';
  }

  // Calculate completion percentage
  const tasksFile = parseTasksFile(tasksPath);
  const completedCount = tasksFile.filter(t => t.status === 'completed').length;
  const percentage = Math.round((completedCount / tasksFile.length) * 100);

  output += `**Overall Progress:** ${completedCount}/${tasksFile.length} tasks complete (${percentage}%)\n`;

  return output;
}
