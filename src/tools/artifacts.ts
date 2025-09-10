import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Artifacts management tools
 */

// Tool schemas
export const ArtifactsReadSchema = z.object({
  artifactType: z.enum(['spec', 'plan', 'tasks', 'all']).describe('Type of artifact to read'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

/**
 * Read and return normalized JSON for spec/plan/tasks artifacts
 */
export async function artifactsRead(params: z.infer<typeof ArtifactsReadSchema>) {
  const { artifactType, workspacePath = process.cwd() } = params;
  
  // Validate workspace path
  const resolvedPath = path.resolve(workspacePath);
  await validateWorkspacePath(resolvedPath);
  
  try {
    const dincoderPath = path.join(resolvedPath, '.dincoder');
    const dincoderExists = await fs.access(dincoderPath).then(() => true).catch(() => false);
    
    if (!dincoderExists) {
      return {
        success: false,
        message: 'Project not initialized. Please run specify_start first.',
        artifacts: {},
        details: {
          artifactType,
          location: dincoderPath,
          error: 'Directory .dincoder not found'
        },
      };
    }
    
    const artifacts: any = {};
    
    // Read spec.json
    if (artifactType === 'spec' || artifactType === 'all') {
      const specPath = path.join(dincoderPath, 'spec.json');
      const specExists = await fs.access(specPath).then(() => true).catch(() => false);
      
      if (specExists) {
        const specContent = await fs.readFile(specPath, 'utf-8');
        artifacts.spec = JSON.parse(specContent);
      }
    }
    
    // Read plan.json
    if (artifactType === 'plan' || artifactType === 'all') {
      const planPath = path.join(dincoderPath, 'plan.json');
      const planExists = await fs.access(planPath).then(() => true).catch(() => false);
      
      if (planExists) {
        const planContent = await fs.readFile(planPath, 'utf-8');
        artifacts.plan = JSON.parse(planContent);
      }
    }
    
    // Read tasks.json
    if (artifactType === 'tasks' || artifactType === 'all') {
      const tasksPath = path.join(dincoderPath, 'tasks.json');
      const tasksExists = await fs.access(tasksPath).then(() => true).catch(() => false);
      
      if (tasksExists) {
        const tasksContent = await fs.readFile(tasksPath, 'utf-8');
        artifacts.tasks = JSON.parse(tasksContent);
      }
    }
    
    // Check if research.md exists (not part of artifacts but good to know)
    const researchPath = path.join(dincoderPath, 'research.md');
    const researchExists = await fs.access(researchPath).then(() => true).catch(() => false);
    
    return {
      success: true,
      message: `Retrieved ${artifactType} artifacts`,
      artifacts,
      details: {
        artifactType,
        location: dincoderPath,
        filesFound: {
          spec: !!artifacts.spec,
          plan: !!artifacts.plan,
          tasks: !!artifacts.tasks,
          research: researchExists
        }
      },
    };
  } catch (error) {
    throw new Error(`Failed to read artifacts: ${error instanceof Error ? error.message : 'Unknown error'}`);
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