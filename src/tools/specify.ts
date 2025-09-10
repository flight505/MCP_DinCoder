import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Spec Kit specify tools
 */

// Tool schemas
export const SpecifyStartSchema = z.object({
  projectName: z.string().describe('Name of the project to initialize'),
  agent: z.enum(['claude', 'copilot', 'gemini']).describe('AI agent to use'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

export const SpecifyDescribeSchema = z.object({
  description: z.string().describe('Project specification description'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

/**
 * Initialize a new spec-driven project
 */
export async function specifyStart(params: z.infer<typeof SpecifyStartSchema>) {
  const { projectName, agent, workspacePath = process.cwd() } = params;
  
  // Validate workspace path
  const resolvedPath = path.resolve(workspacePath);
  await validateWorkspacePath(resolvedPath);
  
  try {
    // Run specify init command
    const command = `uvx specify init ${projectName} --ai ${agent}`;
    const { stdout, stderr } = await execAsync(command, {
      cwd: resolvedPath,
      timeout: 30000, // 30 seconds timeout
    });
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(`Specify init error: ${stderr}`);
    }
    
    // Check for created directories
    const projectPath = path.join(resolvedPath, projectName);
    const scriptsPath = path.join(projectPath, 'scripts');
    const templatesPath = path.join(projectPath, 'templates');
    
    const [scriptsExists, templatesExists] = await Promise.all([
      fs.access(scriptsPath).then(() => true).catch(() => false),
      fs.access(templatesPath).then(() => true).catch(() => false),
    ]);
    
    return {
      success: true,
      projectPath,
      message: `Initialized spec-driven project: ${projectName}`,
      details: {
        agent,
        scriptsCreated: scriptsExists,
        templatesCreated: templatesExists,
        output: stdout.trim(),
      },
    };
  } catch (error) {
    throw new Error(`Failed to initialize project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create project specification
 */
export async function specifyDescribe(params: z.infer<typeof SpecifyDescribeSchema>) {
  const { description, workspacePath = process.cwd() } = params;
  
  // Validate workspace path
  const resolvedPath = path.resolve(workspacePath);
  await validateWorkspacePath(resolvedPath);
  
  try {
    // Create specs directory if it doesn't exist
    const specsDir = path.join(resolvedPath, 'specs');
    await fs.mkdir(specsDir, { recursive: true });
    
    // Generate spec filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const specName = `spec-${timestamp}.md`;
    const specPath = path.join(specsDir, specName);
    
    // Create spec content
    const specContent = `# Specification

## Description
${description}

## User Journeys
<!-- Define user journeys here -->

## Acceptance Scenarios
<!-- Define acceptance criteria -->

## Edge Cases
<!-- List edge cases to consider -->

## Needs Clarification
<!-- Questions that need answers -->

---
Generated: ${new Date().toISOString()}
`;
    
    // Write spec file
    await fs.writeFile(specPath, specContent, 'utf-8');
    
    return {
      success: true,
      specPath,
      message: 'Created specification document',
      details: {
        filename: specName,
        location: specsDir,
      },
    };
  } catch (error) {
    throw new Error(`Failed to create specification: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  
  // Check for .git directory to ensure it's a project
  const gitPath = path.join(workspacePath, '.git');
  const hasGit = await fs.access(gitPath).then(() => true).catch(() => false);
  
  if (!hasGit) {
    console.error('Warning: No .git directory found in workspace');
  }
}