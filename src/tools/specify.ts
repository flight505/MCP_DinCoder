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
    // Create .dincoder directory
    const dincoderPath = path.join(resolvedPath, '.dincoder');
    await fs.mkdir(dincoderPath, { recursive: true });
    
    // Create initial spec.json template
    const specTemplate = {
      projectName,
      agent,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      description: '',
      goals: [],
      requirements: {
        functional: [],
        nonFunctional: [],
        technical: []
      },
      userJourneys: [],
      acceptanceCriteria: [],
      constraints: [],
      assumptions: [],
      risks: [],
      outOfScope: []
    };
    
    const specPath = path.join(dincoderPath, 'spec.json');
    await fs.writeFile(specPath, JSON.stringify(specTemplate, null, 2), 'utf-8');
    
    // Create empty plan.json template
    const planTemplate = {
      projectName,
      createdAt: new Date().toISOString(),
      architecture: {
        overview: '',
        components: [],
        dataFlow: [],
        technologies: []
      },
      implementation: {
        phases: [],
        milestones: [],
        dependencies: []
      },
      dataModel: {},
      apiContracts: {},
      securityConsiderations: [],
      performanceTargets: []
    };
    
    const planPath = path.join(dincoderPath, 'plan.json');
    await fs.writeFile(planPath, JSON.stringify(planTemplate, null, 2), 'utf-8');
    
    // Create empty tasks.json template
    const tasksTemplate = {
      projectName,
      createdAt: new Date().toISOString(),
      tasks: [],
      nextTaskId: 1,
      completedCount: 0,
      totalCount: 0
    };
    
    const tasksPath = path.join(dincoderPath, 'tasks.json');
    await fs.writeFile(tasksPath, JSON.stringify(tasksTemplate, null, 2), 'utf-8');
    
    // Create initial research.md
    const researchContent = `# Research Documentation

## Project: ${projectName}

**Created:** ${new Date().toISOString()}
**AI Agent:** ${agent}

---

## Technical Decisions

_Document architectural decisions, trade-offs, and research findings here._

## References

_Add links to relevant documentation, articles, and resources._

`;
    
    const researchPath = path.join(dincoderPath, 'research.md');
    await fs.writeFile(researchPath, researchContent, 'utf-8');
    
    return {
      success: true,
      projectPath: dincoderPath,
      message: `Initialized DinCoder project: ${projectName}`,
      details: {
        agent,
        filesCreated: {
          spec: specPath,
          plan: planPath,
          tasks: tasksPath,
          research: researchPath
        },
        nextSteps: [
          'Use specify_describe to add project details',
          'Use plan_create to generate technical plan',
          'Use tasks_generate to create actionable tasks'
        ]
      },
    };
  } catch (error) {
    throw new Error(`Failed to initialize project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create or update project specification
 */
export async function specifyDescribe(params: z.infer<typeof SpecifyDescribeSchema>) {
  const { description, workspacePath = process.cwd() } = params;
  
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
    
    // Read existing spec.json
    const specPath = path.join(dincoderPath, 'spec.json');
    const specExists = await fs.access(specPath).then(() => true).catch(() => false);
    
    let spec: any = {};
    if (specExists) {
      const specContent = await fs.readFile(specPath, 'utf-8');
      spec = JSON.parse(specContent);
    }
    
    // Update spec with new description
    spec.description = description;
    spec.updatedAt = new Date().toISOString();
    
    // Parse description for common patterns
    const lines = description.split('\n').filter(line => line.trim());
    
    // Look for goals (lines starting with "Goal:" or "- Goal")
    const goals = lines.filter(line => 
      line.match(/^(-\s*)?(goal|objective|aim)s?:?\s*/i)
    ).map(line => line.replace(/^(-\s*)?(goal|objective|aim)s?:?\s*/i, '').trim());
    
    if (goals.length > 0) {
      spec.goals = [...(spec.goals || []), ...goals];
    }
    
    // Look for requirements (lines with "must", "should", "required")
    const requirements = lines.filter(line => 
      line.match(/\b(must|should|require[ds]?|need[s]?)\b/i)
    ).map(line => line.trim());
    
    if (requirements.length > 0) {
      spec.requirements = spec.requirements || {};
      spec.requirements.functional = [...(spec.requirements.functional || []), ...requirements];
    }
    
    // Look for constraints (lines with "constraint", "limitation", "restriction")
    const constraints = lines.filter(line => 
      line.match(/\b(constraint|limitation|restriction|cannot|must not)\b/i)
    ).map(line => line.trim());
    
    if (constraints.length > 0) {
      spec.constraints = [...(spec.constraints || []), ...constraints];
    }
    
    // Write updated spec
    await fs.writeFile(specPath, JSON.stringify(spec, null, 2), 'utf-8');
    
    return {
      success: true,
      specPath,
      message: 'Updated project specification',
      details: {
        location: dincoderPath,
        updatedFields: {
          description: true,
          goals: goals.length > 0,
          requirements: requirements.length > 0,
          constraints: constraints.length > 0
        },
        nextSteps: [
          'Review and edit spec.json directly for fine-tuning',
          'Use plan_create to generate technical plan',
          'Use artifacts_read to view current specification'
        ]
      },
    };
  } catch (error) {
    throw new Error(`Failed to update specification: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  
  // Note: Removed git check as it's too restrictive for new projects
}