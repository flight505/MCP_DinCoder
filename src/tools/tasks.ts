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
    // Check if .dincoder directory exists
    const dincoderPath = path.join(resolvedPath, '.dincoder');
    const dincoderExists = await fs.access(dincoderPath).then(() => true).catch(() => false);
    
    if (!dincoderExists) {
      throw new Error('Project not initialized. Please run specify_start first.');
    }
    
    // Read existing plan.json if no planPath provided
    let plan: any = null;
    if (!planPath) {
      const defaultPlanPath = path.join(dincoderPath, 'plan.json');
      const planExists = await fs.access(defaultPlanPath).then(() => true).catch(() => false);
      if (planExists) {
        const planContent = await fs.readFile(defaultPlanPath, 'utf-8');
        plan = JSON.parse(planContent);
      }
    } else {
      const resolvedPlanPath = path.resolve(resolvedPath, planPath);
      const planContent = await fs.readFile(resolvedPlanPath, 'utf-8');
      plan = JSON.parse(planContent);
    }
    
    // Read existing tasks.json
    const tasksPath = path.join(dincoderPath, 'tasks.json');
    const tasksExists = await fs.access(tasksPath).then(() => true).catch(() => false);
    
    let tasksData: any = {};
    if (tasksExists) {
      const tasksContent = await fs.readFile(tasksPath, 'utf-8');
      tasksData = JSON.parse(tasksContent);
    } else {
      tasksData = {
        projectName: plan?.projectName || 'Unnamed Project',
        createdAt: new Date().toISOString(),
        tasks: [],
        nextTaskId: 1,
        completedCount: 0,
        totalCount: 0
      };
    }
    
    // Generate new tasks based on scope and plan
    const newTasks: Task[] = [];
    const baseId = tasksData.nextTaskId || 1;
    
    // Parse scope for task generation hints
    const scopeLines = scope.split('\n').filter(line => line.trim());
    
    // Look for specific task mentions
    const taskPatterns = /\b(implement|create|build|design|test|document|deploy|configure|setup|integrate)\b/gi;
    const taskActions: string[] = [];
    scopeLines.forEach(line => {
      const matches = line.match(taskPatterns);
      if (matches) {
        taskActions.push(...matches.map(m => m.toLowerCase()));
      }
    });
    
    // Generate tasks based on scope and plan
    if (taskActions.includes('setup') || taskActions.includes('configure') || !taskActions.length) {
      newTasks.push({
        id: `TASK-${String(baseId + newTasks.length).padStart(3, '0')}`,
        title: 'Environment Setup',
        description: `Set up development environment for: ${scope}`,
        status: 'pending',
        dependencies: [],
        storyPoints: 1,
        createdAt: new Date().toISOString(),
      });
    }
    
    if (taskActions.includes('design') || plan?.architecture) {
      newTasks.push({
        id: `TASK-${String(baseId + newTasks.length).padStart(3, '0')}`,
        title: 'Design Architecture',
        description: `Design system architecture based on: ${scope}`,
        status: 'pending',
        dependencies: newTasks.length > 0 ? [newTasks[0].id] : [],
        storyPoints: 2,
        createdAt: new Date().toISOString(),
      });
    }
    
    if (taskActions.includes('implement') || taskActions.includes('create') || taskActions.includes('build')) {
      newTasks.push({
        id: `TASK-${String(baseId + newTasks.length).padStart(3, '0')}`,
        title: 'Core Implementation',
        description: `Implement core functionality: ${scope}`,
        status: 'pending',
        dependencies: newTasks.length > 0 ? [newTasks[newTasks.length - 1].id] : [],
        storyPoints: 3,
        createdAt: new Date().toISOString(),
      });
    }
    
    if (taskActions.includes('test') || plan?.performanceTargets) {
      newTasks.push({
        id: `TASK-${String(baseId + newTasks.length).padStart(3, '0')}`,
        title: 'Testing',
        description: `Write and execute tests for: ${scope}`,
        status: 'pending',
        dependencies: newTasks.filter(t => t.title.includes('Implementation')).map(t => t.id),
        storyPoints: 2,
        createdAt: new Date().toISOString(),
      });
    }
    
    if (taskActions.includes('document')) {
      newTasks.push({
        id: `TASK-${String(baseId + newTasks.length).padStart(3, '0')}`,
        title: 'Documentation',
        description: `Create documentation for: ${scope}`,
        status: 'pending',
        dependencies: newTasks.filter(t => t.title.includes('Implementation')).map(t => t.id),
        storyPoints: 1,
        createdAt: new Date().toISOString(),
      });
    }
    
    if (taskActions.includes('deploy')) {
      newTasks.push({
        id: `TASK-${String(baseId + newTasks.length).padStart(3, '0')}`,
        title: 'Deployment',
        description: `Deploy to production: ${scope}`,
        status: 'pending',
        dependencies: newTasks.filter(t => t.title.includes('Testing')).map(t => t.id),
        storyPoints: 2,
        createdAt: new Date().toISOString(),
      });
    }
    
    // Add generic tasks if no specific actions found and few tasks generated
    if (newTasks.length < 3) {
      newTasks.push(
        {
          id: `TASK-${String(baseId + newTasks.length).padStart(3, '0')}`,
          title: 'Analysis & Planning',
          description: `Analyze requirements and plan implementation for: ${scope}`,
          status: 'pending',
          dependencies: [],
          storyPoints: 2,
          createdAt: new Date().toISOString(),
        },
        {
          id: `TASK-${String(baseId + newTasks.length).padStart(3, '0')}`,
          title: 'Implementation',
          description: `Implement features for: ${scope}`,
          status: 'pending',
          dependencies: [`TASK-${String(baseId + newTasks.length - 1).padStart(3, '0')}`],
          storyPoints: 3,
          createdAt: new Date().toISOString(),
        },
        {
          id: `TASK-${String(baseId + newTasks.length).padStart(3, '0')}`,
          title: 'Review & Testing',
          description: `Review and test implementation for: ${scope}`,
          status: 'pending',
          dependencies: [`TASK-${String(baseId + newTasks.length).padStart(3, '0')}`],
          storyPoints: 2,
          createdAt: new Date().toISOString(),
        }
      );
    }
    
    // Update tasks data
    tasksData.tasks = [...(tasksData.tasks || []), ...newTasks];
    tasksData.nextTaskId = baseId + newTasks.length;
    tasksData.totalCount = tasksData.tasks.length;
    tasksData.updatedAt = new Date().toISOString();
    
    // Add plan reference if available
    if (plan) {
      tasksData.basedOnPlan = {
        constraints: plan.constraints,
        technologies: plan.architecture?.technologies,
        phases: plan.implementation?.phases
      };
    }
    
    // Write updated tasks
    await fs.writeFile(tasksPath, JSON.stringify(tasksData, null, 2), 'utf-8');
    
    return {
      success: true,
      tasksPath,
      message: `Generated ${newTasks.length} new tasks`,
      tasks: newTasks.map(t => ({
        id: t.id,
        title: t.title,
        dependencies: t.dependencies,
        storyPoints: t.storyPoints
      })),
      details: {
        newTasks: newTasks.length,
        totalTasks: tasksData.tasks.length,
        totalStoryPoints: tasksData.tasks.reduce((sum: number, t: Task) => sum + t.storyPoints, 0),
        location: dincoderPath,
        nextSteps: [
          'Use tasks_tick to mark tasks as complete',
          'Use artifacts_read to view all tasks',
          'Edit tasks.json directly for fine-tuning'
        ]
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
    // Use .dincoder/tasks.json as default
    const dincoderPath = path.join(resolvedPath, '.dincoder');
    const defaultTasksPath = path.join(dincoderPath, 'tasks.json');
    
    let resolvedTasksPath = tasksPath;
    if (!resolvedTasksPath) {
      const tasksExists = await fs.access(defaultTasksPath).then(() => true).catch(() => false);
      if (!tasksExists) {
        throw new Error('No tasks file found. Please run tasks_generate first.');
      }
      resolvedTasksPath = defaultTasksPath;
    } else {
      resolvedTasksPath = path.resolve(resolvedPath, tasksPath);
    }
    
    // Read tasks
    const tasksContent = await fs.readFile(resolvedTasksPath, 'utf-8');
    const tasksData = JSON.parse(tasksContent);
    const tasks: Task[] = tasksData.tasks || [];
    
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
          completedAt: task.completedAt
        },
      };
    }
    
    // Check dependencies
    const incompleteDeps = task.dependencies.filter(depId => {
      const dep = tasks.find(t => t.id === depId);
      return dep && dep.status !== 'completed';
    });
    
    if (incompleteDeps.length > 0) {
      return {
        success: false,
        message: `Cannot complete task ${taskId}. Dependencies not completed: ${incompleteDeps.join(', ')}`,
        task: {
          id: task.id,
          title: task.title,
          status: task.status,
          blockedBy: incompleteDeps
        },
      };
    }
    
    // Update task status
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    
    // Update counts
    tasksData.completedCount = tasks.filter(t => t.status === 'completed').length;
    tasksData.updatedAt = new Date().toISOString();
    
    // Save updated tasks
    await fs.writeFile(resolvedTasksPath, JSON.stringify(tasksData, null, 2), 'utf-8');
    
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
        completed: tasksData.completedCount,
        remaining: tasks.length - tasksData.completedCount,
        percentComplete: Math.round((tasksData.completedCount / tasks.length) * 100)
      },
      nextTasks: tasks
        .filter(t => t.status === 'pending' && 
          t.dependencies.every(depId => {
            const dep = tasks.find(td => td.id === depId);
            return !dep || dep.status === 'completed';
          }))
        .map(t => ({ id: t.id, title: t.title }))
        .slice(0, 3)
    };
  } catch (error) {
    throw new Error(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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