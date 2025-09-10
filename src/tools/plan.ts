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
    // Read spec if provided
    let specContent = '';
    if (specPath) {
      const resolvedSpecPath = path.resolve(resolvedPath, specPath);
      specContent = await fs.readFile(resolvedSpecPath, 'utf-8');
    }
    
    // Create plans directory
    const plansDir = path.join(resolvedPath, 'specs', 'plans');
    await fs.mkdir(plansDir, { recursive: true });
    
    // Generate plan filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const planName = `plan-${timestamp}.md`;
    const planPath = path.join(plansDir, planName);
    
    // Create plan content
    const planContent = `# Technical Plan

## Constraints
${constraintsText}

## Architecture
<!-- Define system architecture -->

### Components
<!-- List major components -->

### Data Model
<!-- Define data structures and schemas -->

### API Contracts
<!-- Define interfaces and contracts -->

## Implementation Approach
<!-- Describe implementation strategy -->

### Technology Stack
- Language: TypeScript
- Framework: Express
- Protocol: MCP Streamable HTTP

### Security Considerations
- Origin validation
- Session management
- Authentication

### Performance Requirements
<!-- Define performance targets -->

## Dependencies
<!-- List external dependencies -->

## Risks and Mitigations
<!-- Identify risks and mitigation strategies -->

${specContent ? `## Referenced Specification\n${specContent}` : ''}

---
Generated: ${new Date().toISOString()}
`;
    
    // Write plan file
    await fs.writeFile(planPath, planContent, 'utf-8');
    
    // Create data model file
    const dataModelPath = path.join(plansDir, `data-model-${timestamp}.ts`);
    const dataModelContent = `/**
 * Data Model for ${planName}
 * Generated: ${new Date().toISOString()}
 */

import { z } from 'zod';

// TODO: Define Zod schemas based on plan requirements

export const ExampleSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Example = z.infer<typeof ExampleSchema>;
`;
    
    await fs.writeFile(dataModelPath, dataModelContent, 'utf-8');
    
    // Create contracts file
    const contractsPath = path.join(plansDir, `contracts-${timestamp}.ts`);
    const contractsContent = `/**
 * API Contracts for ${planName}
 * Generated: ${new Date().toISOString()}
 */

// TODO: Define interface contracts

export interface ServiceContract {
  initialize(): Promise<void>;
  execute(params: unknown): Promise<unknown>;
  shutdown(): Promise<void>;
}

export interface ToolContract {
  name: string;
  description: string;
  schema: unknown;
  handler: (params: unknown) => Promise<unknown>;
}
`;
    
    await fs.writeFile(contractsPath, contractsContent, 'utf-8');
    
    return {
      success: true,
      files: {
        plan: planPath,
        dataModel: dataModelPath,
        contracts: contractsPath,
      },
      message: 'Created technical plan with data model and contracts',
      details: {
        planName,
        location: plansDir,
      },
    };
  } catch (error) {
    throw new Error(`Failed to create plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
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