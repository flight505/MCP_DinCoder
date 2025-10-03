/**
 * Workspace path utilities
 */

import * as path from 'path';
import * as fs from 'fs';

/**
 * Resolve workspace path with safe fallbacks
 *
 * Handles edge cases where:
 * - workspacePath is undefined
 * - workspacePath is empty string
 * - workspacePath is whitespace only
 * - workspacePath resolves to root '/'
 *
 * @param workspacePath Optional workspace path from user
 * @returns Resolved absolute workspace path
 */
export function resolveWorkspacePath(workspacePath?: string): string {
  // Handle undefined, empty, or whitespace-only paths
  if (!workspacePath || workspacePath.trim() === '') {
    return process.cwd();
  }

  // Resolve to absolute path
  const resolved = path.resolve(workspacePath);

  // Prevent using root directory
  if (resolved === '/' || resolved === path.parse(resolved).root) {
    console.warn(`Warning: Workspace path resolved to root (${resolved}), using current directory instead`);
    return process.cwd();
  }

  return resolved;
}

/**
 * Find project root by looking for .dincoder directory
 *
 * Searches upward from current directory to find the project root.
 * Useful when a tool is called from a subdirectory.
 *
 * @param startPath Starting path for search
 * @returns Project root path or startPath if not found
 */
export function findProjectRoot(startPath?: string): string {
  let currentDir = startPath || process.cwd();

  while (currentDir !== path.parse(currentDir).root) {
    const dincoderPath = path.join(currentDir, '.dincoder');
    const specsPath = path.join(currentDir, 'specs');

    try {
      if (fs.existsSync(dincoderPath) || fs.existsSync(specsPath)) {
        return currentDir;
      }
    } catch {
      // Continue searching
    }

    currentDir = path.dirname(currentDir);
  }

  // Not found, return original path
  return startPath || process.cwd();
}
