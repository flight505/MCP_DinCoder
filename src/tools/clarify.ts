import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { findSpecsDirectory } from '../speckit/detector.js';
import { resolveWorkspacePath } from './workspace.js';

/**
 * Clarification Tracking Tool
 *
 * Implements GitHub Spec Kit's /clarify command for tracking and resolving
 * ambiguities in specifications.
 */

// Schema for clarify_add tool
export const ClarifyAddSchema = z.object({
  question: z.string().describe('The clarification question to ask'),
  context: z.string().optional().describe('Context or section where clarification is needed'),
  options: z.array(z.string()).optional().describe('Possible options or approaches to consider'),
  specPath: z.string().optional().describe('Path to specific spec file (optional)'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

// Schema for clarify_resolve tool
export const ClarifyResolveSchema = z.object({
  clarificationId: z.string().describe('ID of the clarification to resolve (e.g., CLARIFY-001)'),
  resolution: z.string().describe('The answer/resolution to the clarification'),
  rationale: z.string().optional().describe('Reasoning behind the resolution'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

// Schema for clarify_list tool (helper)
export const ClarifyListSchema = z.object({
  status: z.enum(['pending', 'resolved', 'all']).optional().describe('Filter by status'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

// Clarification data structure
interface Clarification {
  id: string;
  question: string;
  context?: string;
  options?: string[];
  status: 'pending' | 'resolved';
  resolution?: string;
  rationale?: string;
  createdAt: string;
  resolvedAt?: string;
  specPath?: string;
}

interface ClarificationsData {
  clarifications: Clarification[];
  nextId: number;
}

/**
 * Get path to clarifications.json file
 */
async function getClarificationsPath(workspacePath: string): Promise<string> {
  const specsDir = await findSpecsDirectory(workspacePath);

  // Find the most recent feature directory
  const entries = await fs.readdir(specsDir);
  const featureDirs = entries
    .filter(entry => /^\d{3}-/.test(entry))
    .sort()
    .reverse();

  if (featureDirs.length === 0) {
    throw new Error('No feature directory found. Run specify_start or specify_describe first.');
  }

  const featurePath = path.join(specsDir, featureDirs[0]);
  return path.join(featurePath, 'clarifications.json');
}

/**
 * Load clarifications from JSON file
 */
async function loadClarifications(clarificationsPath: string): Promise<ClarificationsData> {
  try {
    const content = await fs.readFile(clarificationsPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    // File doesn't exist yet, return empty structure
    return {
      clarifications: [],
      nextId: 1,
    };
  }
}

/**
 * Save clarifications to JSON file
 */
async function saveClarifications(
  clarificationsPath: string,
  data: ClarificationsData
): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(clarificationsPath);
  await fs.mkdir(dir, { recursive: true });

  await fs.writeFile(
    clarificationsPath,
    JSON.stringify(data, null, 2),
    'utf-8'
  );
}

/**
 * Add a new clarification question
 */
export async function clarifyAdd(params: z.infer<typeof ClarifyAddSchema>) {
  const { question, context, options, specPath, workspacePath } = params;

  const resolvedPath = resolveWorkspacePath(workspacePath);

  try {
    // Get clarifications file path
    const clarificationsPath = await getClarificationsPath(resolvedPath);

    // Load existing clarifications
    const data = await loadClarifications(clarificationsPath);

    // Generate unique ID
    const id = `CLARIFY-${String(data.nextId).padStart(3, '0')}`;

    // Create new clarification
    const clarification: Clarification = {
      id,
      question,
      context,
      options,
      status: 'pending',
      createdAt: new Date().toISOString(),
      specPath,
    };

    // Add to list
    data.clarifications.push(clarification);
    data.nextId += 1;

    // Save to file
    await saveClarifications(clarificationsPath, data);

    // Optionally update spec.md with marker
    if (specPath && context) {
      try {
        const fullSpecPath = path.isAbsolute(specPath)
          ? specPath
          : path.join(resolvedPath, specPath);

        let specContent = await fs.readFile(fullSpecPath, 'utf-8');

        // Add clarification marker in spec
        const marker = `\n\n[NEEDS CLARIFICATION: ${id}]\n**Question:** ${question}\n${options ? `**Options:**\n${options.map(o => `- ${o}`).join('\n')}\n` : ''}`;

        // Insert after context section if found
        if (context && specContent.includes(context)) {
          const contextIndex = specContent.indexOf(context);
          const insertPoint = contextIndex + context.length;
          specContent =
            specContent.substring(0, insertPoint) +
            marker +
            specContent.substring(insertPoint);

          await fs.writeFile(fullSpecPath, specContent, 'utf-8');
        }
      } catch {
        // Spec update is optional, don't fail if it doesn't work
      }
    }

    // Log to research.md
    const specsDir = await findSpecsDirectory(resolvedPath);
    const entries = await fs.readdir(specsDir);
    const featureDirs = entries
      .filter(entry => /^\d{3}-/.test(entry))
      .sort()
      .reverse();

    if (featureDirs.length > 0) {
      const researchPath = path.join(specsDir, featureDirs[0], 'research.md');
      const researchEntry = `\n\n---\n\n## Clarification ${id} - Added\n\n**Date:** ${new Date().toISOString()}\n**Question:** ${question}\n${context ? `**Context:** ${context}\n` : ''}${options ? `**Options:**\n${options.map(o => `- ${o}`).join('\n')}\n` : ''}\n**Status:** Pending resolution\n`;

      await fs.appendFile(researchPath, researchEntry, 'utf-8');
    }

    const result = {
      success: true,
      clarificationId: id,
      question,
      status: 'pending',
      message: `Created clarification ${id}`,
      nextSteps: [
        `Review the clarification question`,
        `Use clarify_resolve to provide an answer`,
        `Check clarifications.json for all pending items`,
      ],
    };

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to add clarification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Resolve an existing clarification
 */
export async function clarifyResolve(params: z.infer<typeof ClarifyResolveSchema>) {
  const { clarificationId, resolution, rationale, workspacePath } = params;

  const resolvedPath = resolveWorkspacePath(workspacePath);

  try {
    // Get clarifications file path
    const clarificationsPath = await getClarificationsPath(resolvedPath);

    // Load existing clarifications
    const data = await loadClarifications(clarificationsPath);

    // Find the clarification
    const clarification = data.clarifications.find(c => c.id === clarificationId);

    if (!clarification) {
      throw new Error(`Clarification ${clarificationId} not found`);
    }

    if (clarification.status === 'resolved') {
      throw new Error(`Clarification ${clarificationId} is already resolved`);
    }

    // Update clarification
    clarification.status = 'resolved';
    clarification.resolution = resolution;
    clarification.rationale = rationale;
    clarification.resolvedAt = new Date().toISOString();

    // Save to file
    await saveClarifications(clarificationsPath, data);

    // Update spec.md with resolution
    if (clarification.specPath) {
      try {
        const fullSpecPath = path.isAbsolute(clarification.specPath)
          ? clarification.specPath
          : path.join(resolvedPath, clarification.specPath);

        let specContent = await fs.readFile(fullSpecPath, 'utf-8');

        // Find and replace clarification marker
        const markerPattern = new RegExp(
          `\\[NEEDS CLARIFICATION: ${clarificationId}\\][\\s\\S]*?(?=\\n\\n|$)`,
          'g'
        );

        const resolutionText = `\n\n[CLARIFICATION RESOLVED: ${clarificationId}]\n**Resolution:** ${resolution}\n${rationale ? `**Rationale:** ${rationale}\n` : ''}**Resolved:** ${new Date().toISOString().split('T')[0]}\n`;

        specContent = specContent.replace(markerPattern, resolutionText);

        await fs.writeFile(fullSpecPath, specContent, 'utf-8');
      } catch {
        // Spec update is optional
      }
    }

    // Log to research.md
    const specsDir = await findSpecsDirectory(resolvedPath);
    const entries = await fs.readdir(specsDir);
    const featureDirs = entries
      .filter(entry => /^\d{3}-/.test(entry))
      .sort()
      .reverse();

    if (featureDirs.length > 0) {
      const researchPath = path.join(specsDir, featureDirs[0], 'research.md');
      const researchEntry = `\n\n---\n\n## Clarification ${clarificationId} - Resolved\n\n**Date:** ${new Date().toISOString()}\n**Question:** ${clarification.question}\n**Resolution:** ${resolution}\n${rationale ? `**Rationale:** ${rationale}\n` : ''}\n**Status:** Resolved\n`;

      await fs.appendFile(researchPath, researchEntry, 'utf-8');
    }

    // Count remaining pending clarifications
    const pendingCount = data.clarifications.filter(c => c.status === 'pending').length;

    const result = {
      success: true,
      clarificationId,
      resolution,
      status: 'resolved',
      pendingCount,
      message: `Resolved clarification ${clarificationId}. ${pendingCount} pending clarification(s) remaining.`,
      nextSteps:
        pendingCount > 0
          ? [
              `Review remaining ${pendingCount} pending clarification(s)`,
              `Use clarify_list to see all clarifications`,
            ]
          : [
              `All clarifications resolved!`,
              `Use plan_create to proceed with technical planning`,
            ],
    };

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to resolve clarification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List all clarifications (helper function)
 */
export async function clarifyList(params: z.infer<typeof ClarifyListSchema>) {
  const { status = 'all', workspacePath } = params;

  const resolvedPath = resolveWorkspacePath(workspacePath);

  try {
    // Get clarifications file path
    const clarificationsPath = await getClarificationsPath(resolvedPath);

    // Load existing clarifications
    const data = await loadClarifications(clarificationsPath);

    // Filter by status
    let filtered = data.clarifications;
    if (status !== 'all') {
      filtered = data.clarifications.filter(c => c.status === status);
    }

    // Count by status
    const pendingCount = data.clarifications.filter(c => c.status === 'pending').length;
    const resolvedCount = data.clarifications.filter(c => c.status === 'resolved').length;

    const result = {
      success: true,
      clarifications: filtered,
      summary: {
        total: data.clarifications.length,
        pending: pendingCount,
        resolved: resolvedCount,
      },
      message: `Found ${filtered.length} clarification(s) with status: ${status}`,
    };

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(`Failed to list clarifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
