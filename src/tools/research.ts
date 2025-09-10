import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Research documentation tools
 */

// Tool schemas
export const ResearchAppendSchema = z.object({
  topic: z.string().describe('Research topic or decision area'),
  content: z.string().describe('Research content or decision rationale'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

/**
 * Append to the research document for decisions taken
 */
export async function researchAppend(params: z.infer<typeof ResearchAppendSchema>) {
  const { topic, content, workspacePath = process.cwd() } = params;
  
  // Validate workspace path
  const resolvedPath = path.resolve(workspacePath);
  await validateWorkspacePath(resolvedPath);
  
  try {
    // Create research directory if it doesn't exist
    const researchDir = path.join(resolvedPath, 'docs', 'research');
    await fs.mkdir(researchDir, { recursive: true });
    
    // Use a consistent research document
    const researchPath = path.join(researchDir, 'decisions.md');
    
    // Check if file exists
    let existingContent = '';
    try {
      existingContent = await fs.readFile(researchPath, 'utf-8');
    } catch {
      // File doesn't exist, create header
      existingContent = `# Research & Decisions

This document captures key research findings and technical decisions made during development.

---

`;
    }
    
    // Append new research entry
    const timestamp = new Date().toISOString();
    const entry = `
## ${topic}

**Date**: ${timestamp}

${content}

---
`;
    
    const updatedContent = existingContent + entry;
    await fs.writeFile(researchPath, updatedContent, 'utf-8');
    
    return {
      success: true,
      message: `Appended research for topic: ${topic}`,
      details: {
        topic,
        timestamp,
        location: researchPath,
        entryLength: content.length,
      },
    };
  } catch (error) {
    throw new Error(`Failed to append research: ${error instanceof Error ? error.message : 'Unknown error'}`);
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