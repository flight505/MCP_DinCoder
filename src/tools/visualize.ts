/**
 * Task Visualization Tool
 *
 * Generate visual dependency graphs from tasks.md files.
 * Supports Mermaid, Graphviz DOT, and ASCII tree formats.
 */

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import {
  parseTasksFile,
  buildDependencyGraph,
  detectCircularDependencies,
  type Task,
  type DependencyGraph,
} from '../speckit/taskParser.js';

// Zod schema for tasks_visualize tool
export const TasksVisualizeSchema = z.object({
  workspacePath: z.string().optional().describe('Path to workspace directory containing .dincoder folder'),
  tasksPath: z.string().optional().describe('Direct path to tasks.md file (overrides workspacePath)'),
  format: z.enum(['mermaid', 'graphviz', 'ascii']).default('mermaid').describe('Output format'),
  includeCompleted: z.boolean().default(false).describe('Include completed tasks in visualization'),
  groupByPhase: z.boolean().default(false).describe('Group tasks by phase using subgraphs'),
  highlightCriticalPath: z.boolean().default(false).describe('Highlight the critical path'),
});

export type TasksVisualizeParams = z.infer<typeof TasksVisualizeSchema>;

/**
 * Generate task dependency visualization
 */
export async function tasksVisualize(params: TasksVisualizeParams): Promise<string> {
  // Resolve tasks.md path
  const tasksPath = params.tasksPath || path.join(
    params.workspacePath || process.cwd(),
    '.dincoder',
    'tasks.md'
  );

  if (!fs.existsSync(tasksPath)) {
    throw new Error(`Tasks file not found: ${tasksPath}`);
  }

  // Parse tasks
  let tasks = parseTasksFile(tasksPath);

  // Filter out completed tasks if requested
  if (!params.includeCompleted) {
    tasks = tasks.filter(t => t.status !== 'completed');
  }

  // Check for circular dependencies
  const graph = buildDependencyGraph(tasks);
  const circularTasks = detectCircularDependencies(graph);

  if (circularTasks.length > 0) {
    throw new Error(
      `Circular dependencies detected in tasks: ${circularTasks.join(', ')}\n` +
      `Please resolve these before visualizing the dependency graph.`
    );
  }

  // Generate visualization based on format
  switch (params.format) {
    case 'mermaid':
      return generateMermaidDiagram(tasks, graph, params);
    case 'graphviz':
      return generateGraphvizDot(tasks, graph, params);
    case 'ascii':
      return generateAsciiTree(tasks, graph, params);
    default:
      throw new Error(`Unsupported format: ${params.format}`);
  }
}

/**
 * Generate Mermaid flowchart diagram
 */
function generateMermaidDiagram(
  tasks: Task[],
  graph: DependencyGraph,
  params: TasksVisualizeParams
): string {
  let diagram = '```mermaid\nflowchart LR\n';

  // Define style classes
  diagram += '  classDef pending fill:#e0e0e0,stroke:#666,stroke-width:2px\n';
  diagram += '  classDef inProgress fill:#fff59d,stroke:#f57f17,stroke-width:3px\n';
  diagram += '  classDef completed fill:#c8e6c9,stroke:#388e3c,stroke-width:2px\n\n';

  if (params.groupByPhase) {
    // Group by phase
    const phases = new Map<string, Task[]>();

    for (const task of tasks) {
      const phase = task.metadata.phase || 'default';
      if (!phases.has(phase)) {
        phases.set(phase, []);
      }
      phases.get(phase)!.push(task);
    }

    // Generate subgraphs
    for (const [phase, phaseTasks] of phases.entries()) {
      diagram += `  subgraph ${phase}\n`;
      for (const task of phaseTasks) {
        diagram += generateMermaidNode(task, '    ');
      }
      diagram += `  end\n\n`;
    }
  } else {
    // No grouping
    for (const task of tasks) {
      diagram += generateMermaidNode(task, '  ');
    }
    diagram += '\n';
  }

  // Add edges (dependencies)
  for (const task of tasks) {
    const dependencies = graph.edges.get(task.id) || [];
    for (const depId of dependencies) {
      if (graph.nodes.has(depId)) {
        diagram += `  ${depId} --> ${task.id}\n`;
      }
    }
  }

  diagram += '```';
  return diagram;
}

/**
 * Generate Mermaid node definition
 */
function generateMermaidNode(task: Task, indent: string): string {
  const escapedDesc = task.description.replace(/"/g, '#quot;').replace(/\[/g, '#91;').replace(/\]/g, '#93;');
  const label = `${task.id}: ${escapedDesc.substring(0, 40)}${escapedDesc.length > 40 ? '...' : ''}`;

  let styleClass = '';
  switch (task.status) {
    case 'pending':
      styleClass = ':::pending';
      break;
    case 'in_progress':
      styleClass = ':::inProgress';
      break;
    case 'completed':
      styleClass = ':::completed';
      break;
  }

  return `${indent}${task.id}["${label}"]${styleClass}\n`;
}

/**
 * Generate Graphviz DOT format
 */
function generateGraphvizDot(
  tasks: Task[],
  graph: DependencyGraph,
  _params: TasksVisualizeParams
): string {
  let dot = 'digraph TaskDependencies {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  // Define nodes with colors
  for (const task of tasks) {
    let color = '#e0e0e0'; // pending (gray)
    if (task.status === 'in_progress') {
      color = '#fff59d'; // yellow
    } else if (task.status === 'completed') {
      color = '#c8e6c9'; // green
    }

    const escapedDesc = task.description.replace(/"/g, '\\"');
    const label = `${task.id}: ${escapedDesc.substring(0, 40)}${escapedDesc.length > 40 ? '...' : ''}`;

    dot += `  ${task.id} [label="${label}", fillcolor="${color}", style=filled];\n`;
  }

  dot += '\n';

  // Add edges
  for (const task of tasks) {
    const dependencies = graph.edges.get(task.id) || [];
    for (const depId of dependencies) {
      if (graph.nodes.has(depId)) {
        dot += `  ${depId} -> ${task.id};\n`;
      }
    }
  }

  dot += '}\n';
  return dot;
}

/**
 * Generate ASCII tree format
 */
function generateAsciiTree(
  tasks: Task[],
  graph: DependencyGraph,
  _params: TasksVisualizeParams
): string {
  const visited = new Set<string>();
  let output = 'Task Dependency Tree:\n\n';

  // Find root tasks (no dependencies)
  const rootTasks = tasks.filter(task => {
    const deps = graph.edges.get(task.id) || [];
    return deps.length === 0;
  });

  function printTask(taskId: string, depth: number, isLast: boolean, prefix: string) {
    if (visited.has(taskId)) {
      return; // Already printed
    }
    visited.add(taskId);

    const task = graph.nodes.get(taskId);
    if (!task) {
      return;
    }

    const connector = isLast ? '└── ' : '├── ';
    const statusIcon = task.status === 'completed' ? '✓' : task.status === 'in_progress' ? '~' : '○';
    const label = `${statusIcon} ${task.id}: ${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}`;

    output += `${prefix}${connector}${label}\n`;

    // Find dependents (tasks that depend on this task)
    const dependents = tasks.filter(t => {
      const deps = graph.edges.get(t.id) || [];
      return deps.includes(taskId);
    });

    const newPrefix = prefix + (isLast ? '    ' : '│   ');

    dependents.forEach((dependent, index) => {
      const isLastChild = index === dependents.length - 1;
      printTask(dependent.id, depth + 1, isLastChild, newPrefix);
    });
  }

  // Print from root tasks
  rootTasks.forEach((task, index) => {
    const isLast = index === rootTasks.length - 1;
    printTask(task.id, 0, isLast, '');
  });

  // Print any orphaned tasks (tasks with broken dependencies)
  const orphaned = tasks.filter(t => !visited.has(t.id));
  if (orphaned.length > 0) {
    output += '\nOrphaned tasks (broken dependencies):\n';
    orphaned.forEach(task => {
      const statusIcon = task.status === 'completed' ? '✓' : task.status === 'in_progress' ? '~' : '○';
      output += `  ${statusIcon} ${task.id}: ${task.description}\n`;
    });
  }

  return output;
}
