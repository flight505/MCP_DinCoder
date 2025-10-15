import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { findSpecsDirectory } from '../speckit/detector.js';
import { resolveWorkspacePath } from './workspace.js';
import { parseSpecSections, setSectionContent } from '../speckit/parser.js';

/**
 * Spec Refinement Tool
 *
 * Enables iterative improvement of specifications without losing history.
 * Updates are tracked in git and logged in research.md.
 */

// Schema for spec_refine tool
export const SpecRefineSchema = z.object({
  section: z.enum(['goals', 'requirements', 'acceptance', 'edge-cases', 'full'])
    .describe('Section to refine (goals | requirements | acceptance | edge-cases | full)'),
  changes: z.string().describe('Markdown describing the refinements to make'),
  reason: z.string().describe('Why this refinement is needed'),
  specPath: z.string().optional().describe('Path to specific spec file (auto-detect if not provided)'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

/**
 * Find the most recent spec file in the workspace
 */
async function findSpecFile(workspacePath: string, specPath?: string): Promise<string> {
  if (specPath) {
    const absolutePath = path.isAbsolute(specPath)
      ? specPath
      : path.join(workspacePath, specPath);

    // Verify file exists
    try {
      await fs.access(absolutePath);
      return absolutePath;
    } catch {
      throw new Error(`Spec file not found: ${specPath}`);
    }
  }

  // Auto-detect: find most recent feature directory
  const specsDir = await findSpecsDirectory(workspacePath);
  const entries = await fs.readdir(specsDir);
  const featureDirs = entries
    .filter(entry => /^\d{3}-/.test(entry))
    .sort()
    .reverse();

  if (featureDirs.length === 0) {
    throw new Error('No feature directory found. Run specify_start or specify_describe first.');
  }

  const specFilePath = path.join(specsDir, featureDirs[0], 'spec.md');

  try {
    await fs.access(specFilePath);
    return specFilePath;
  } catch {
    throw new Error(`No spec.md found in ${featureDirs[0]}`);
  }
}

/**
 * Get the research.md file path
 */
async function getResearchPath(specFilePath: string): Promise<string> {
  const featureDir = path.dirname(specFilePath);
  return path.join(featureDir, 'research.md');
}

/**
 * Map section names to markdown headers
 */
function getSectionHeader(section: string): string {
  const sectionMap: Record<string, string> = {
    'goals': 'Goals',
    'requirements': 'Requirements',
    'acceptance': 'Acceptance Criteria',
    'edge-cases': 'Edge Cases',
  };
  return sectionMap[section] || section;
}

/**
 * Refine a specification by updating a specific section
 */
export async function specRefine(params: z.infer<typeof SpecRefineSchema>) {
  const { section, changes, reason, specPath, workspacePath } = params;

  const resolvedPath = resolveWorkspacePath(workspacePath);

  try {
    // Find spec file
    const specFilePath = await findSpecFile(resolvedPath, specPath);

    // Load current spec content
    const specContent = await fs.readFile(specFilePath, 'utf-8');

    let updatedContent: string;

    if (section === 'full') {
      // Full spec update: replace entire content
      updatedContent = changes;
    } else {
      // Section update: parse and replace specific section
      const sectionHeader = getSectionHeader(section);

      // Check if section exists
      const sections = parseSpecSections(specContent);
      const sectionExists = sections.some(
        s => s.name.toLowerCase() === sectionHeader.toLowerCase()
      );

      if (!sectionExists) {
        throw new Error(
          `Section "${sectionHeader}" not found in spec. Available sections: ${sections.map(s => s.name).join(', ')}`
        );
      }

      // Update the section
      updatedContent = setSectionContent(specContent, sectionHeader, changes);
    }

    // Validate structure (ensure headers are intact)
    const updatedSections = parseSpecSections(updatedContent);
    if (updatedSections.length === 0) {
      throw new Error('Updated spec has no sections. Update rejected to preserve structure.');
    }

    // Write updated spec
    await fs.writeFile(specFilePath, updatedContent, 'utf-8');

    // Log refinement to research.md
    const researchPath = await getResearchPath(specFilePath);
    const timestamp = new Date().toISOString();
    const researchEntry = `\n\n---\n\n## Spec Refinement - ${timestamp.split('T')[0]}\n\n**Date:** ${timestamp}\n**Section:** ${section}\n**Reason:** ${reason}\n\n**Changes:**\n${changes.split('\n').map(line => `> ${line}`).join('\n')}\n`;

    await fs.appendFile(researchPath, researchEntry, 'utf-8');

    const result = {
      success: true,
      specFile: path.basename(path.dirname(specFilePath)),
      section,
      timestamp,
      message: `Successfully refined ${section === 'full' ? 'entire spec' : section + ' section'}`,
      changesLogged: true,
      nextSteps: [
        'Review the updated spec.md',
        'Use spec_validate to check quality',
        'Use artifacts_analyze to verify consistency',
        section === 'full' ? 'Consider updating plan.md if requirements changed' : 'Update plan if needed'
      ]
    };

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    throw new Error(`Failed to refine specification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
