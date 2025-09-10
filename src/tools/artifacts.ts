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
    const specsDir = path.join(resolvedPath, 'specs');
    const artifacts: any = {};
    
    // Read spec files
    if (artifactType === 'spec' || artifactType === 'all') {
      const specFiles = await findLatestArtifact(specsDir, 'spec-*.md');
      if (specFiles.length > 0) {
        const specContent = await fs.readFile(specFiles[0], 'utf-8');
        artifacts.spec = parseSpecContent(specContent);
      }
    }
    
    // Read plan files
    if (artifactType === 'plan' || artifactType === 'all') {
      const plansDir = path.join(specsDir, 'plans');
      const planFiles = await findLatestArtifact(plansDir, 'plan-*.md');
      if (planFiles.length > 0) {
        const planContent = await fs.readFile(planFiles[0], 'utf-8');
        artifacts.plan = parsePlanContent(planContent);
      }
      
      // Also include data model and contracts if available
      const dataModelFiles = await findLatestArtifact(plansDir, 'data-model-*.ts');
      if (dataModelFiles.length > 0) {
        artifacts.dataModel = await fs.readFile(dataModelFiles[0], 'utf-8');
      }
      
      const contractsFiles = await findLatestArtifact(plansDir, 'contracts-*.ts');
      if (contractsFiles.length > 0) {
        artifacts.contracts = await fs.readFile(contractsFiles[0], 'utf-8');
      }
    }
    
    // Read tasks files  
    if (artifactType === 'tasks' || artifactType === 'all') {
      const tasksDir = path.join(specsDir, 'tasks');
      const tasksFiles = await findLatestArtifact(tasksDir, 'tasks-*.json');
      if (tasksFiles.length > 0) {
        const tasksContent = await fs.readFile(tasksFiles[0], 'utf-8');
        artifacts.tasks = JSON.parse(tasksContent);
      }
    }
    
    return {
      success: true,
      message: `Retrieved ${artifactType} artifacts`,
      artifacts,
      details: {
        artifactType,
        location: specsDir,
      },
    };
  } catch (error) {
    throw new Error(`Failed to read artifacts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Find the latest artifact matching a pattern
 */
async function findLatestArtifact(dir: string, pattern: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dir);
    const matchingFiles = files
      .filter(f => {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(f);
      })
      .sort()
      .reverse();
    
    return matchingFiles.map(f => path.join(dir, f));
  } catch {
    return [];
  }
}

/**
 * Parse spec markdown content into structured format
 */
function parseSpecContent(content: string): any {
  const sections: any = {};
  const lines = content.split('\n');
  let currentSection = '';
  let sectionContent: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection] = sectionContent.join('\n').trim();
      }
      currentSection = line.substring(3).toLowerCase().replace(/\s+/g, '_');
      sectionContent = [];
    } else {
      sectionContent.push(line);
    }
  }
  
  if (currentSection && sectionContent.length > 0) {
    sections[currentSection] = sectionContent.join('\n').trim();
  }
  
  return sections;
}

/**
 * Parse plan markdown content into structured format
 */
function parsePlanContent(content: string): any {
  // Similar to parseSpecContent
  return parseSpecContent(content);
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