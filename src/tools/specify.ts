import { z } from 'zod';
import * as fs from 'fs/promises';

/**
 * Spec Kit specify tools - Real Spec Kit Integration
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
    // Check project type and prerequisites
    const detection = await detectProjectType(resolvedPath);
    const prerequisites = await checkSpecKitPrerequisites();
    
    // Determine specs directory
    const specsDir = await findSpecsDirectory(resolvedPath);
    
    // Create feature directory
    const featurePath = await createFeatureDirectory(specsDir, projectName);
    
    // Generate initial spec from template
    const specContent = await generateSpecFromTemplate(
      `Initialize ${projectName} project with ${agent} agent`,
      projectName
    );
    
    // Write spec.md
    const specPath = path.join(featurePath, 'spec.md');
    await fs.writeFile(specPath, specContent, 'utf-8');
    
    // Create contracts directory
    const contractsPath = path.join(featurePath, 'contracts');
    await fs.mkdir(contractsPath, { recursive: true });
    
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
    
    const researchPath = path.join(featurePath, 'research.md');
    await fs.writeFile(researchPath, researchContent, 'utf-8');
    
    // Also maintain .dincoder compatibility for now
    const dincoderPath = path.join(resolvedPath, '.dincoder');
    await fs.mkdir(dincoderPath, { recursive: true });
    
    // Create compatibility JSON files in .dincoder
    const specJson = {
      projectName,
      agent,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      description: '',
      specKitPath: specPath,
      goals: [],
      requirements: {
        functional: [],
        nonFunctional: [],
        technical: []
      }
    };
    
    await fs.writeFile(
      path.join(dincoderPath, 'spec.json'),
      JSON.stringify(specJson, null, 2),
      'utf-8'
    );
    
    return {
      success: true,
      projectPath: featurePath,
      message: `Initialized Spec Kit project: ${projectName}`,
      details: {
        agent,
        projectType: detection.type,
        specKitAvailable: prerequisites.python && prerequisites.uv,
        filesCreated: {
          spec: specPath,
          research: researchPath,
          contracts: contractsPath,
          compatibility: path.join(dincoderPath, 'spec.json')
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
    // Check project type
    const detection = await detectProjectType(resolvedPath);
    
    // Find the specs directory
    const specsDir = await findSpecsDirectory(resolvedPath);
    
    // Find the most recent feature directory
    let featurePath: string | null = null;
    let specPath: string | null = null;
    
    try {
      const entries = await fs.readdir(specsDir);
      const featureDirs = entries
        .filter(entry => /^\d{3}-/.test(entry))
        .sort()
        .reverse();
      
      if (featureDirs.length > 0) {
        featurePath = path.join(specsDir, featureDirs[0]);
        specPath = path.join(featurePath, 'spec.md');
        
        // Check if spec.md exists
        const specExists = await fs.access(specPath).then(() => true).catch(() => false);
        if (!specExists) {
          specPath = null;
        }
      }
    } catch {
      // specs directory doesn't exist yet
    }
    
    if (!specPath) {
      // No existing spec, create a new feature
      const projectName = description.split(' ')[0] || 'unnamed-feature';
      featurePath = await createFeatureDirectory(specsDir, projectName);
      
      // Generate spec from template with description
      const specContent = await generateSpecFromTemplate(description, projectName);
      specPath = path.join(featurePath, 'spec.md');
      await fs.writeFile(specPath, specContent, 'utf-8');
    } else {
      // Update existing spec with new description
      let specContent = await fs.readFile(specPath, 'utf-8');
      
      // Update the user description in the spec
      const inputPattern = /\*\*Input\*\*: User description: "[^"]*"/;
      if (inputPattern.test(specContent)) {
        specContent = specContent.replace(
          inputPattern,
          `**Input**: User description: "${description}"`
        );
      } else {
        // Add user description if not present
        const insertPoint = specContent.indexOf('## User Scenarios');
        if (insertPoint > -1) {
          const before = specContent.substring(0, insertPoint);
          const after = specContent.substring(insertPoint);
          specContent = `${before}\n**Input**: User description: "${description}"\n\n${after}`;
        }
      }
      
      // Mark as updated
      const datePattern = /\*\*Created\*\*: [^\n]+/;
      const today = new Date().toISOString().split('T')[0];
      if (datePattern.test(specContent)) {
        specContent = specContent.replace(datePattern, `**Created**: ${today} | **Updated**: ${new Date().toISOString()}`);
      }
      
      await fs.writeFile(specPath, specContent, 'utf-8');
    }
    
    // Also update .dincoder compatibility files
    const dincoderPath = path.join(resolvedPath, '.dincoder');
    const dincoderExists = await fs.access(dincoderPath).then(() => true).catch(() => false);
    
    if (dincoderExists) {
      const specJsonPath = path.join(dincoderPath, 'spec.json');
      const specJsonExists = await fs.access(specJsonPath).then(() => true).catch(() => false);
      
      let specJson: any = {};
      if (specJsonExists) {
        const content = await fs.readFile(specJsonPath, 'utf-8');
        specJson = JSON.parse(content);
      }
      
      // Update with new description
      specJson.description = description;
      specJson.updatedAt = new Date().toISOString();
      specJson.specKitPath = specPath;
      
      // Parse description for patterns
      const lines = description.split('\n').filter(line => line.trim());
      
      // Extract goals
      const goals = lines.filter(line => 
        line.match(/^(-\s*)?(goal|objective|aim)s?:?\s*/i)
      ).map(line => line.replace(/^(-\s*)?(goal|objective|aim)s?:?\s*/i, '').trim());
      
      if (goals.length > 0) {
        specJson.goals = [...(specJson.goals || []), ...goals];
      }
      
      // Extract requirements
      const requirements = lines.filter(line => 
        line.match(/\b(must|should|require[ds]?|need[s]?)\b/i)
      ).map(line => line.trim());
      
      if (requirements.length > 0) {
        specJson.requirements = specJson.requirements || {};
        specJson.requirements.functional = [...(specJson.requirements.functional || []), ...requirements];
      }
      
      await fs.writeFile(specJsonPath, JSON.stringify(specJson, null, 2), 'utf-8');
    }
    
    return {
      success: true,
      specPath,
      message: 'Updated project specification',
      details: {
        location: featurePath,
        projectType: detection.type,
        updatedFields: {
          description: true,
          specKitFormat: true
        },
        nextSteps: [
          'Review and edit spec.md directly for fine-tuning',
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