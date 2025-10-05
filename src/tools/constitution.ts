import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  findSpecsDirectory,
  createFeatureDirectory
} from '../speckit/detector.js';
import { generateConstitutionFromTemplate } from '../speckit/constitution-template.js';
import { resolveWorkspacePath } from './workspace.js';

/**
 * Constitution/Principles tool for Spec Kit
 *
 * Enables projects to define principles and constraints that guide
 * all AI-generated artifacts (specs, plans, tasks).
 */

// Schema for constitution_create tool
export const ConstitutionCreateSchema = z.object({
  projectName: z.string().describe('Name of the project'),
  principles: z.array(z.string()).describe('Project principles (e.g., "Prefer functional patterns")'),
  constraints: z.array(z.string()).describe('Technical constraints (e.g., "Max bundle size: 500KB")'),
  preferences: z.object({
    libraries: z.array(z.string()).optional().describe('Preferred libraries (e.g., "React Query over Redux")'),
    patterns: z.array(z.string()).optional().describe('Preferred patterns (e.g., "Repository pattern")'),
    style: z.string().optional().describe('Code style preference (e.g., "Functional > OOP")')
  }).optional().describe('Optional preferences for libraries, patterns, and style'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

/**
 * Create a project constitution defining principles and constraints
 */
export async function constitutionCreate(params: z.infer<typeof ConstitutionCreateSchema>) {
  const { projectName, principles, constraints, preferences, workspacePath } = params;

  // Resolve workspace path with safe fallbacks
  const resolvedPath = resolveWorkspacePath(workspacePath);

  try {
    // Determine specs directory (either .dincoder/ or specs/)
    const specsDir = await findSpecsDirectory(resolvedPath);

    // Create feature directory for this project
    const featurePath = await createFeatureDirectory(specsDir, projectName);

    // Generate constitution.md from template
    const constitutionContent = generateConstitutionFromTemplate({
      projectName,
      principles,
      constraints,
      preferences: preferences || {}
    });

    // Write constitution.md
    const constitutionPath = path.join(featurePath, 'constitution.md');
    await fs.writeFile(constitutionPath, constitutionContent, 'utf-8');

    // Generate summary for user
    const summary = {
      success: true,
      projectName,
      constitutionPath,
      principlesCount: principles.length,
      constraintsCount: constraints.length,
      message: `Created constitution for ${projectName} with ${principles.length} principles and ${constraints.length} constraints`
    };

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(summary, null, 2)
        }
      ]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            success: false,
            error: 'Failed to create constitution',
            details: errorMessage
          }, null, 2)
        }
      ],
      isError: true
    };
  }
}
