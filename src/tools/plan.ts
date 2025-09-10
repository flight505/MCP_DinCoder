import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Spec Kit plan tools
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
    // Check if .dincoder directory exists
    const dincoderPath = path.join(resolvedPath, '.dincoder');
    const dincoderExists = await fs.access(dincoderPath).then(() => true).catch(() => false);
    
    if (!dincoderExists) {
      throw new Error('Project not initialized. Please run specify_start first.');
    }
    
    // Read existing spec.json if no specPath provided
    let spec: any = null;
    if (!specPath) {
      const defaultSpecPath = path.join(dincoderPath, 'spec.json');
      const specExists = await fs.access(defaultSpecPath).then(() => true).catch(() => false);
      if (specExists) {
        const specContent = await fs.readFile(defaultSpecPath, 'utf-8');
        spec = JSON.parse(specContent);
      }
    } else {
      const resolvedSpecPath = path.resolve(resolvedPath, specPath);
      const specContent = await fs.readFile(resolvedSpecPath, 'utf-8');
      spec = JSON.parse(specContent);
    }
    
    // Read existing plan.json
    const planPath = path.join(dincoderPath, 'plan.json');
    const planExists = await fs.access(planPath).then(() => true).catch(() => false);
    
    let plan: any = {};
    if (planExists) {
      const planContent = await fs.readFile(planPath, 'utf-8');
      plan = JSON.parse(planContent);
    }
    
    // Update plan with new constraints and spec info
    plan.updatedAt = new Date().toISOString();
    plan.constraints = constraintsText;
    
    // Parse constraints for common patterns
    const lines = constraintsText.split('\n').filter(line => line.trim());
    
    // Look for technology mentions
    const techPatterns = /\b(react|vue|angular|typescript|javascript|python|java|go|rust|node|express|fastapi|django|spring)\b/gi;
    const technologies = new Set<string>();
    lines.forEach(line => {
      const matches = line.match(techPatterns);
      if (matches) {
        matches.forEach(tech => technologies.add(tech.toLowerCase()));
      }
    });
    
    if (technologies.size > 0) {
      plan.architecture = plan.architecture || {};
      plan.architecture.technologies = Array.from(technologies);
    }
    
    // Look for architectural patterns
    const archPatterns = /\b(microservice|monolith|serverless|rest|graphql|websocket|event-driven|mvc|mvvm|clean architecture)\b/gi;
    const patterns = new Set<string>();
    lines.forEach(line => {
      const matches = line.match(archPatterns);
      if (matches) {
        matches.forEach(pattern => patterns.add(pattern.toLowerCase()));
      }
    });
    
    if (patterns.size > 0) {
      plan.architecture = plan.architecture || {};
      plan.architecture.patterns = Array.from(patterns);
    }
    
    // Add spec information if available
    if (spec) {
      plan.basedOnSpec = {
        projectName: spec.projectName,
        description: spec.description,
        goals: spec.goals,
        requirements: spec.requirements
      };
    }
    
    // Look for phases/milestones
    const phaseLines = lines.filter(line => 
      line.match(/\b(phase|milestone|step|stage)\s*\d+/i)
    );
    
    if (phaseLines.length > 0) {
      plan.implementation = plan.implementation || {};
      plan.implementation.phases = phaseLines.map((line, index) => ({
        id: `phase-${index + 1}`,
        description: line.trim(),
        status: 'pending'
      }));
    }
    
    // Look for security considerations
    const securityLines = lines.filter(line => 
      line.match(/\b(security|auth|encrypt|ssl|tls|oauth|jwt|cors|xss|csrf|sql injection)\b/i)
    );
    
    if (securityLines.length > 0) {
      plan.securityConsiderations = securityLines.map(line => line.trim());
    }
    
    // Look for performance requirements
    const perfLines = lines.filter(line => 
      line.match(/\b(performance|latency|throughput|response time|load|concurrent|cache)\b/i)
    );
    
    if (perfLines.length > 0) {
      plan.performanceTargets = perfLines.map(line => line.trim());
    }
    
    // Write updated plan
    await fs.writeFile(planPath, JSON.stringify(plan, null, 2), 'utf-8');
    
    return {
      success: true,
      planPath,
      message: 'Updated technical plan',
      details: {
        location: dincoderPath,
        updatedFields: {
          constraints: true,
          technologies: technologies.size > 0,
          patterns: patterns.size > 0,
          phases: phaseLines.length > 0,
          security: securityLines.length > 0,
          performance: perfLines.length > 0
        },
        nextSteps: [
          'Review and edit plan.json directly for fine-tuning',
          'Use tasks_generate to create actionable tasks',
          'Use artifacts_read to view current plan'
        ]
      },
    };
  } catch (error) {
    throw new Error(`Failed to create/update plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
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