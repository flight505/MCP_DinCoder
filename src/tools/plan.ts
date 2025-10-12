import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import { 
  detectProjectType, 
  findSpecsDirectory 
} from '../speckit/detector.js';
import { generatePlanFromTemplate } from '../speckit/templates.js';

/**
 * Spec Kit plan tools - Real Spec Kit Integration
 */

// Tool schema
export const PlanCreateSchema = z.object({
  constraintsText: z.string().describe('Technical constraints and requirements'),
  specPath: z.string().optional().describe('Path to specification file'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

/**
 * Generate technical plan from specification
 */
export async function planCreate(params: z.infer<typeof PlanCreateSchema>) {
  const { constraintsText, specPath, workspacePath = process.cwd() } = params;
  
  // Validate workspace path
  const resolvedPath = path.resolve(workspacePath);
  await validateWorkspacePath(resolvedPath);
  
  try {
    // Check project type
    const detection = await detectProjectType(resolvedPath);
    
    // Find the specs directory
    const specsDir = await findSpecsDirectory(resolvedPath);
    
    // Find the spec.md file - either from provided path or most recent feature
    let actualSpecPath = specPath;
    let featurePath: string | null = null;
    
    if (!actualSpecPath) {
      // Find most recent feature with spec.md
      const entries = await fs.readdir(specsDir);
      const featureDirs = entries
        .filter(entry => /^\d{3}-/.test(entry))
        .sort()
        .reverse();
      
      for (const dir of featureDirs) {
        const testPath = path.join(specsDir, dir, 'spec.md');
        const exists = await fs.access(testPath).then(() => true).catch(() => false);
        if (exists) {
          actualSpecPath = testPath;
          featurePath = path.join(specsDir, dir);
          break;
        }
      }
    } else if (specPath) {
      // Use provided spec path
      actualSpecPath = path.resolve(resolvedPath, specPath);
      featurePath = path.dirname(actualSpecPath);
    }
    
    if (!actualSpecPath || !featurePath) {
      throw new Error('No specification found. Please create a specification first using specify_describe.');
    }

    // Generate plan from template
    const { plan, research, dataModel } = await generatePlanFromTemplate(
      actualSpecPath,
      constraintsText
    );
    
    // Write plan.md
    const planPath = path.join(featurePath, 'plan.md');
    await fs.writeFile(planPath, plan, 'utf-8');

    // Write research.md (append if exists)
    const researchPath = path.join(featurePath, 'research.md');
    const existingResearch = await fs.readFile(researchPath, 'utf-8').catch(() => '');
    const updatedResearch = existingResearch + '\n\n' + research;
    await fs.writeFile(researchPath, updatedResearch, 'utf-8');

    // Write data-model.md
    const dataModelPath = path.join(featurePath, 'data-model.md');
    await fs.writeFile(dataModelPath, dataModel, 'utf-8');
    
    // Also update .dincoder compatibility files
    const dincoderPath = path.join(resolvedPath, '.dincoder');
    const dincoderExists = await fs.access(dincoderPath).then(() => true).catch(() => false);
    
    if (dincoderExists) {
      // Create compatibility plan.json
      const planJson = {
        projectName: path.basename(featurePath),
        createdAt: new Date().toISOString(),
        specKitPath: planPath,
        architecture: {
          overview: 'See plan.md',
          components: [] as string[],
          dataFlow: [] as string[],
          technologies: [] as string[]
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
      
      // Parse technical context from constraints
      const techStack = [];
      if (constraintsText.toLowerCase().includes('typescript')) {techStack.push('TypeScript');}
      if (constraintsText.toLowerCase().includes('react')) {techStack.push('React');}
      if (constraintsText.toLowerCase().includes('node')) {techStack.push('Node.js');}
      if (constraintsText.toLowerCase().includes('python')) {techStack.push('Python');}
      
      planJson.architecture.technologies = techStack;
      
      await fs.writeFile(
        path.join(dincoderPath, 'plan.json'),
        JSON.stringify(planJson, null, 2),
        'utf-8'
      );
    }
    
    return {
      success: true,
      planPath,
      message: 'Generated technical implementation plan',
      details: {
        location: featurePath,
        projectType: detection.type,
        filesCreated: {
          plan: planPath,
          research: researchPath,
          dataModel: dataModelPath,
          compatibility: dincoderExists ? path.join(dincoderPath, 'plan.json') : undefined
        },
        nextSteps: [
          'Review and refine plan.md',
          'Define contracts in contracts/ directory',
          'Use tasks_generate to create implementation tasks'
        ]
      },
    };
  } catch (error) {
    throw new Error(`Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  
  // Prevent access to system directories (but allow temp dirs like /var/folders on macOS)
  const restrictedPaths = ['/etc', '/usr', '/bin', '/sbin'];
  const normalizedPath = path.normalize(workspacePath).toLowerCase();

  // Check for exact matches or subdirectories (but not /var/folders or Node tmpdir)
  const tmpDir = tmpdir().toLowerCase();
  for (const restricted of restrictedPaths) {
    if (normalizedPath === restricted ||
        (normalizedPath.startsWith(restricted + '/') && !normalizedPath.startsWith(tmpDir))) {
      throw new Error(`Access to system directory ${restricted} is not allowed`);
    }
  }
}