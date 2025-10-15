/**
 * Task Parser Module
 *
 * Parses tasks.md files into structured task objects.
 * Supports both legacy format (no metadata) and new format (with metadata).
 *
 * Metadata format: (phase: setup, type: backend, depends: T001, priority: high)
 */

import * as fs from 'fs';

export interface TaskMetadata {
  phase?: string;
  type?: string;
  depends?: string[];
  priority?: 'high' | 'medium' | 'low';
  effort?: number;
  tags?: string[];
}

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  metadata: TaskMetadata;
  line: number;
}

export interface DependencyGraph {
  nodes: Map<string, Task>;
  edges: Map<string, string[]>; // taskId -> [dependencyIds]
}

/**
 * Parse tasks.md file into structured task objects
 */
export function parseTasksFile(filePath: string): Task[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Tasks file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return parseTasksContent(content);
}

/**
 * Parse tasks.md content into structured task objects
 */
export function parseTasksContent(content: string): Task[] {
  const tasks: Task[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const task = parseTaskLine(line, i + 1);
    if (task) {
      tasks.push(task);
    }
  }

  return tasks;
}

/**
 * Parse a single task line
 * Supports formats:
 * - [ ] T001: Description
 * - [x] T002: Description
 * - [~] T003: Description (in progress)
 * - [ ] T004: Description (phase: setup, type: backend, depends: T001)
 */
export function parseTaskLine(line: string, lineNumber: number): Task | null {
  // Match checkbox patterns: [ ], [x], [~], etc.
  const taskRegex = /^[\s-]*\[([x~\s])\]\s+([A-Z]\d+):\s+(.+)$/i;
  const match = line.match(taskRegex);

  if (!match) {
    return null;
  }

  const [, statusChar, id, rest] = match;

  // Determine status from checkbox character
  let status: Task['status'];
  if (statusChar === 'x' || statusChar === 'X') {
    status = 'completed';
  } else if (statusChar === '~') {
    status = 'in_progress';
  } else {
    status = 'pending';
  }

  // Extract description and metadata
  const { description, metadata } = extractMetadata(rest);

  return {
    id,
    description,
    status,
    metadata,
    line: lineNumber,
  };
}

/**
 * Extract metadata from task description
 * Format: Description (phase: setup, type: backend, depends: T001, T002)
 */
export function extractMetadata(text: string): { description: string; metadata: TaskMetadata } {
  const metadataRegex = /^(.+?)\s*\(([^)]+)\)\s*$/;
  const match = text.match(metadataRegex);

  if (!match) {
    // No metadata found
    return { description: text.trim(), metadata: {} };
  }

  const [, description, metadataStr] = match;
  const metadata: TaskMetadata = {};

  // Parse metadata key-value pairs
  const pairs = metadataStr.split(',').map(s => s.trim());

  for (const pair of pairs) {
    const [key, value] = pair.split(':').map(s => s.trim());

    switch (key.toLowerCase()) {
      case 'phase':
        metadata.phase = value;
        break;

      case 'type':
        metadata.type = value;
        break;

      case 'depends':
        // Support multiple dependencies: "T001, T002" or "T001"
        metadata.depends = value.split(/[\s,]+/).filter(Boolean);
        break;

      case 'priority':
        if (value === 'high' || value === 'medium' || value === 'low') {
          metadata.priority = value;
        }
        break;

      case 'effort': {
        const effort = parseInt(value, 10);
        if (!isNaN(effort)) {
          metadata.effort = effort;
        }
        break;
      }

      case 'tags':
        metadata.tags = value.split(/[\s,]+/).filter(Boolean);
        break;
    }
  }

  return { description: description.trim(), metadata };
}

/**
 * Build dependency graph from tasks
 */
export function buildDependencyGraph(tasks: Task[]): DependencyGraph {
  const nodes = new Map<string, Task>();
  const edges = new Map<string, string[]>();

  // Build nodes map
  for (const task of tasks) {
    nodes.set(task.id, task);
  }

  // Build edges map (dependencies)
  for (const task of tasks) {
    if (task.metadata.depends && task.metadata.depends.length > 0) {
      edges.set(task.id, task.metadata.depends);
    } else {
      edges.set(task.id, []);
    }
  }

  return { nodes, edges };
}

/**
 * Detect circular dependencies in the dependency graph
 * Returns array of task IDs involved in circular dependencies
 */
export function detectCircularDependencies(graph: DependencyGraph): string[] {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const circularTasks: string[] = [];

  function dfs(taskId: string): boolean {
    visited.add(taskId);
    recursionStack.add(taskId);

    const dependencies = graph.edges.get(taskId) || [];

    for (const depId of dependencies) {
      if (!visited.has(depId)) {
        if (dfs(depId)) {
          circularTasks.push(taskId);
          return true;
        }
      } else if (recursionStack.has(depId)) {
        // Found circular dependency
        circularTasks.push(taskId);
        return true;
      }
    }

    recursionStack.delete(taskId);
    return false;
  }

  // Check all nodes
  for (const taskId of graph.nodes.keys()) {
    if (!visited.has(taskId)) {
      dfs(taskId);
    }
  }

  return [...new Set(circularTasks)];
}

/**
 * Get tasks that have no dependencies (can be started immediately)
 */
export function getUnblockedTasks(tasks: Task[]): Task[] {
  const graph = buildDependencyGraph(tasks);
  const completedTaskIds = new Set(
    tasks.filter(t => t.status === 'completed').map(t => t.id)
  );

  return tasks.filter(task => {
    if (task.status === 'completed') {
      return false; // Already completed
    }

    const dependencies = graph.edges.get(task.id) || [];

    // All dependencies must be completed
    return dependencies.every(depId => completedTaskIds.has(depId));
  });
}

/**
 * Topological sort of tasks based on dependencies
 * Returns tasks in execution order (dependencies first)
 */
export function topologicalSort(tasks: Task[]): Task[] {
  const graph = buildDependencyGraph(tasks);
  const sorted: Task[] = [];
  const visited = new Set<string>();

  function visit(taskId: string) {
    if (visited.has(taskId)) {
      return;
    }

    visited.add(taskId);

    const dependencies = graph.edges.get(taskId) || [];
    for (const depId of dependencies) {
      if (graph.nodes.has(depId)) {
        visit(depId);
      }
    }

    const task = graph.nodes.get(taskId);
    if (task) {
      sorted.push(task);
    }
  }

  for (const task of tasks) {
    visit(task.id);
  }

  return sorted;
}
