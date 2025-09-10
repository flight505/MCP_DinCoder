import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Spec Kit tasks tools
 */

// Tool schemas
export const TasksGenerateSchema = z.object({
  scope: z.string().describe('Scope or context for task generation'),
  planPath: z.string().optional().describe('Path to plan file'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

export const TasksTickSchema = z.object({
  taskId: z.string().describe('Task ID to mark as complete'),
  tasksPath: z.string().optional().describe('Path to tasks file'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

// Task structure
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dependencies: string[];
  storyPoints: number;
  createdAt: string;
  completedAt?: string;
}

/**
 * Generate actionable tasks from plan
 */
export async function tasksGenerate(params: z.infer<typeof TasksGenerateSchema>) {
  const { scope, planPath, workspacePath = process.cwd() } = params;
  
  // Validate workspace path
  const resolvedPath = path.resolve(workspacePath);
  await validateWorkspacePath(resolvedPath);
  
  try {
    // Read plan if provided
    // let planContent = '';
    if (planPath) {
      const resolvedPlanPath = path.resolve(resolvedPath, planPath);
      // planContent = await fs.readFile(resolvedPlanPath, 'utf-8');
      await fs.readFile(resolvedPlanPath, 'utf-8');
    }
    
    // Create tasks directory
    const tasksDir = path.join(resolvedPath, 'specs', 'tasks');
    await fs.mkdir(tasksDir, { recursive: true });
    
    // Generate tasks filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const tasksName = `tasks-${timestamp}.md`;
    const tasksPath = path.join(tasksDir, tasksName);
    
    // Generate sample tasks based on scope
    const tasks: Task[] = [
      {
        id: 'TASK-001',
        title: 'Environment Setup',
        description: 'Set up development environment and install dependencies',
        status: 'pending',
        dependencies: [],
        storyPoints: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'TASK-002',
        title: 'Create Project Structure',
        description: 'Initialize project structure with required directories',
        status: 'pending',
        dependencies: ['TASK-001'],
        storyPoints: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'TASK-003',
        title: 'Implement Core Components',
        description: `Implement core components for: ${scope}`,
        status: 'pending',
        dependencies: ['TASK-002'],
        storyPoints: 3,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'TASK-004',
        title: 'Add Unit Tests',
        description: 'Write unit tests for core components',
        status: 'pending',
        dependencies: ['TASK-003'],
        storyPoints: 2,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'TASK-005',
        title: 'Integration Testing',
        description: 'Perform integration testing',
        status: 'pending',
        dependencies: ['TASK-003', 'TASK-004'],
        storyPoints: 2,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'TASK-006',
        title: 'Documentation',
        description: 'Create documentation for implemented features',
        status: 'pending',
        dependencies: ['TASK-003'],
        storyPoints: 1,
        createdAt: new Date().toISOString(),
      },
    ];
    
    // Create markdown content
    const tasksContent = `# Tasks

## Scope
${scope}

${planPath ? `## Referenced Plan\n${planPath}\n` : ''}

## Task List

${tasks.map(task => `
### ${task.id}: ${task.title}
- **Status**: ${task.status}
- **Story Points**: ${task.storyPoints}
- **Dependencies**: ${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}
- **Description**: ${task.description}
- **Created**: ${task.createdAt}
`).join('')}

## Task Summary
- Total Tasks: ${tasks.length}
- Total Story Points: ${tasks.reduce((sum, t) => sum + t.storyPoints, 0)}
- Pending: ${tasks.filter(t => t.status === 'pending').length}
- In Progress: ${tasks.filter(t => t.status === 'in-progress').length}
- Completed: ${tasks.filter(t => t.status === 'completed').length}

---
Generated: ${new Date().toISOString()}
`;
    
    // Write tasks file
    await fs.writeFile(tasksPath, tasksContent, 'utf-8');
    
    // Also save as JSON for programmatic access
    const tasksJsonPath = path.join(tasksDir, `tasks-${timestamp}.json`);
    await fs.writeFile(tasksJsonPath, JSON.stringify(tasks, null, 2), 'utf-8');
    
    return {
      success: true,
      tasksPath,
      tasksJsonPath,
      message: `Generated ${tasks.length} tasks`,
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        dependencies: t.dependencies,
      })),
      details: {
        totalTasks: tasks.length,
        totalStoryPoints: tasks.reduce((sum, t) => sum + t.storyPoints, 0),
        location: tasksDir,
      },
    };
  } catch (error) {
    throw new Error(`Failed to generate tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Mark a task as complete
 */
export async function tasksTick(params: z.infer<typeof TasksTickSchema>) {
  const { taskId, tasksPath, workspacePath = process.cwd() } = params;
  
  // Validate workspace path
  const resolvedPath = path.resolve(workspacePath);
  await validateWorkspacePath(resolvedPath);
  
  try {
    // Find most recent tasks file if not specified
    let resolvedTasksPath = tasksPath;
    if (!resolvedTasksPath) {
      const tasksDir = path.join(resolvedPath, 'specs', 'tasks');
      const files = await fs.readdir(tasksDir);
      const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();
      
      if (jsonFiles.length === 0) {
        throw new Error('No tasks files found');
      }
      
      resolvedTasksPath = path.join(tasksDir, jsonFiles[0]);
    } else {
      resolvedTasksPath = path.resolve(resolvedPath, tasksPath);
    }
    
    // Read tasks
    const tasksContent = await fs.readFile(resolvedTasksPath, 'utf-8');
    const tasks: Task[] = JSON.parse(tasksContent);
    
    // Find and update task
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    const task = tasks[taskIndex];
    if (task.status === 'completed') {
      return {
        success: true,
        message: `Task ${taskId} is already completed`,
        task: {
          id: task.id,
          title: task.title,
          status: task.status,
        },
      };
    }
    
    // Update task status
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    
    // Save updated tasks
    await fs.writeFile(resolvedTasksPath, JSON.stringify(tasks, null, 2), 'utf-8');
    
    // Update markdown file if it exists
    const mdPath = resolvedTasksPath.replace('.json', '.md');
    try {
      await updateMarkdownTasks(mdPath, tasks);
    } catch {
      // Markdown file might not exist, ignore
    }
    
    return {
      success: true,
      message: `Marked task ${taskId} as completed`,
      task: {
        id: task.id,
        title: task.title,
        status: task.status,
        completedAt: task.completedAt,
      },
      progress: {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        remaining: tasks.filter(t => t.status !== 'completed').length,
      },
    };
  } catch (error) {
    throw new Error(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update markdown file with task status
 */
async function updateMarkdownTasks(mdPath: string, tasks: Task[]): Promise<void> {
  let content = await fs.readFile(mdPath, 'utf-8');
  
  // Update status lines
  for (const task of tasks) {
    const statusRegex = new RegExp(`(${task.id}[^\\n]*\\n- \\*\\*Status\\*\\*: )\\w+`, 'g');
    content = content.replace(statusRegex, `$1${task.status}`);
    
    if (task.completedAt) {
      const taskSection = new RegExp(`(${task.id}[^\\n]*\\n(?:.*\\n){4})`, 'g');
      content = content.replace(taskSection, (match) => {
        if (!match.includes('Completed:')) {
          return match + `- **Completed**: ${task.completedAt}\n`;
        }
        return match;
      });
    }
  }
  
  // Update summary
  const summarySection = content.match(/## Task Summary[\s\S]*?(?=\n##|\n---|$)/);
  if (summarySection) {
    const newSummary = `## Task Summary
- Total Tasks: ${tasks.length}
- Total Story Points: ${tasks.reduce((sum, t) => sum + t.storyPoints, 0)}
- Pending: ${tasks.filter(t => t.status === 'pending').length}
- In Progress: ${tasks.filter(t => t.status === 'in-progress').length}
- Completed: ${tasks.filter(t => t.status === 'completed').length}`;
    
    content = content.replace(/## Task Summary[\s\S]*?(?=\n##|\n---|$)/, newSummary);
  }
  
  await fs.writeFile(mdPath, content, 'utf-8');
}

/**
 * Validate workspace path for security
 */
async function validateWorkspacePath(workspacePath: string): Promise<void> {
  // Check if path exists
  try {
    const stat = await fs.stat(workspacePath);
    if (!stat.isDirectory()) {
      throw new Error('Workspace path is not a directory');
    }
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error('Workspace path does not exist');
    }
    throw error;
  }
  
  // Prevent access to system directories
  const restrictedPaths = ['/etc', '/usr', '/bin', '/sbin', '/var', '/tmp'];
  const normalizedPath = path.normalize(workspacePath).toLowerCase();
  
  for (const restricted of restrictedPaths) {
    if (normalizedPath.startsWith(restricted)) {
      throw new Error(`Access to system directory ${restricted} is not allowed`);
    }
  }
}