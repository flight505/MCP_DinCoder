import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  detectProjectType, 
  findSpecsDirectory 
} from '../speckit/detector.js';
import { generateTasksFromTemplate } from '../speckit/templates.js';
import { parseTasks } from '../speckit/parser.js';

/**
 * Spec Kit tasks tools - Real Spec Kit Integration
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
    // Check project type
    const detection = await detectProjectType(resolvedPath);
    
    // Find the specs directory
    const specsDir = await findSpecsDirectory(resolvedPath);
    
    // Find the plan.md file - either from provided path or most recent feature
    let actualPlanPath = planPath;
    let featurePath: string | null = null;
    
    if (!actualPlanPath) {
      // Find most recent feature with plan.md
      const entries = await fs.readdir(specsDir);
      const featureDirs = entries
        .filter(entry => /^\d{3}-/.test(entry))
        .sort()
        .reverse();
      
      for (const dir of featureDirs) {
        const testPath = path.join(specsDir, dir, 'plan.md');
        const exists = await fs.access(testPath).then(() => true).catch(() => false);
        if (exists) {
          actualPlanPath = testPath;
          featurePath = path.join(specsDir, dir);
          break;
        }
      }
    } else {
      // Use provided plan path
      actualPlanPath = path.resolve(resolvedPath, planPath);
      featurePath = path.dirname(actualPlanPath);
    }
    
    if (!actualPlanPath) {
      throw new Error('No plan found. Please create a plan first using plan_create.');
    }
    
    // Generate tasks from template
    const tasksContent = await generateTasksFromTemplate(actualPlanPath, scope);
    
    // Write tasks.md
    const tasksPath = path.join(featurePath!, 'tasks.md');
    await fs.writeFile(tasksPath, tasksContent, 'utf-8');
    
    // Parse the generated tasks to extract structured data
    const taskDoc = await parseTasks(tasksPath);
    
    // Also update .dincoder compatibility files
    const dincoderPath = path.join(resolvedPath, '.dincoder');
    const dincoderExists = await fs.access(dincoderPath).then(() => true).catch(() => false);
    
    if (dincoderExists) {
      // Create compatibility tasks.json
      const tasksJson = {
        projectName: path.basename(featurePath!),
        createdAt: new Date().toISOString(),
        specKitPath: tasksPath,
        tasks: taskDoc.tasks.map((task, index) => ({
          id: (index + 1).toString(),
          title: task.id,
          description: task.description,
          status: task.status,
          dependencies: task.dependencies || [],
          storyPoints: 1,
          createdAt: new Date().toISOString(),
          phase: task.phase,
          parallel: task.parallel
        })),
        nextTaskId: taskDoc.tasks.length + 1,
        completedCount: taskDoc.tasks.filter(t => t.status === 'complete').length,
        totalCount: taskDoc.tasks.length
      };
      
      await fs.writeFile(
        path.join(dincoderPath, 'tasks.json'),
        JSON.stringify(tasksJson, null, 2),
        'utf-8'
      );
    }
    
    return {
      success: true,
      tasksPath,
      message: 'Generated implementation tasks',
      details: {
        location: featurePath,
        projectType: detection.type,
        taskCount: taskDoc.tasks.length,
        phases: {
          setup: taskDoc.tasks.filter(t => t.phase === 'setup').length,
          tests: taskDoc.tasks.filter(t => t.phase === 'tests').length,
          implementation: taskDoc.tasks.filter(t => t.phase === 'implementation').length,
          integration: taskDoc.tasks.filter(t => t.phase === 'integration').length,
          polish: taskDoc.tasks.filter(t => t.phase === 'polish').length
        },
        filesCreated: {
          tasks: tasksPath,
          compatibility: dincoderExists ? path.join(dincoderPath, 'tasks.json') : undefined
        },
        nextSteps: [
          'Review tasks.md for accuracy',
          'Begin implementation with setup tasks',
          'Use tasks_tick to mark tasks as complete'
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
    // Find the tasks.md file - either from provided path or most recent feature
    let actualTasksPath = tasksPath;
    
    if (!actualTasksPath) {
      // Find the specs directory
      const specsDir = await findSpecsDirectory(resolvedPath);
      
      // Find most recent feature with tasks.md
      const entries = await fs.readdir(specsDir);
      const featureDirs = entries
        .filter(entry => /^\d{3}-/.test(entry))
        .sort()
        .reverse();
      
      for (const dir of featureDirs) {
        const testPath = path.join(specsDir, dir, 'tasks.md');
        const exists = await fs.access(testPath).then(() => true).catch(() => false);
        if (exists) {
          actualTasksPath = testPath;
          break;
        }
      }
    } else {
      actualTasksPath = path.resolve(resolvedPath, tasksPath);
    }
    
    if (!actualTasksPath) {
      throw new Error('No tasks file found. Please generate tasks first using tasks_generate.');
    }
    
    // Read the tasks.md file
    let tasksContent = await fs.readFile(actualTasksPath, 'utf-8');
    
    // Update task status in markdown
    // Tasks are in format: - [ ] T001 [P] Description
    // Mark as complete: - [x] T001 [P] Description
    const taskPattern = new RegExp(`^(\\s*- \\[)[ ](\\] ${taskId}\\b.*)$`, 'm');
    
    if (taskPattern.test(tasksContent)) {
      tasksContent = tasksContent.replace(taskPattern, '$1x$2');
      
      // Write updated tasks back
      await fs.writeFile(actualTasksPath, tasksContent, 'utf-8');
      
      // Parse updated tasks
      const taskDoc = await parseTasks(actualTasksPath);
      const completedTask = taskDoc.tasks.find(t => t.id === taskId);
      
      // Also update .dincoder compatibility files
      const dincoderPath = path.join(resolvedPath, '.dincoder');
      const tasksJsonPath = path.join(dincoderPath, 'tasks.json');
      const jsonExists = await fs.access(tasksJsonPath).then(() => true).catch(() => false);
      
      if (jsonExists) {
        const content = await fs.readFile(tasksJsonPath, 'utf-8');
        const tasksJson = JSON.parse(content);
        
        // Find and update task
        const task = tasksJson.tasks.find((t: any) => t.title === taskId);
        if (task) {
          task.status = 'completed';
          task.completedAt = new Date().toISOString();
          tasksJson.completedCount = tasksJson.tasks.filter((t: any) => t.status === 'completed').length;
        }
        
        await fs.writeFile(tasksJsonPath, JSON.stringify(tasksJson, null, 2), 'utf-8');
      }
      
      // Count remaining tasks
      const remainingTasks = taskDoc.tasks.filter(t => t.status === 'pending').length;
      const completedTasks = taskDoc.tasks.filter(t => t.status === 'complete').length;
      
      return {
        success: true,
        message: `Marked task ${taskId} as complete`,
        details: {
          taskId,
          description: completedTask?.description || 'Unknown task',
          tasksPath: actualTasksPath,
          progress: {
            completed: completedTasks,
            remaining: remainingTasks,
            total: taskDoc.tasks.length,
            percentage: Math.round((completedTasks / taskDoc.tasks.length) * 100)
          },
          nextTasks: taskDoc.tasks
            .filter(t => t.status === 'pending')
            .slice(0, 3)
            .map(t => `${t.id}: ${t.description}`)
        },
      };
    } else {
      // Task not found or already completed
      const taskDoc = await parseTasks(actualTasksPath);
      const task = taskDoc.tasks.find(t => t.id === taskId);
      
      if (task && task.status === 'complete') {
        return {
          success: false,
          message: `Task ${taskId} is already marked as complete`,
          details: {
            taskId,
            description: task.description
          }
        };
      } else {
        throw new Error(`Task ${taskId} not found in tasks file`);
      }
    }
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