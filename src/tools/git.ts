import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Git workflow tools
 */

// Tool schemas
export const GitCreateBranchSchema = z.object({
  branchName: z.string().describe('Name of the branch to create'),
  fromBranch: z.string().optional().describe('Base branch to create from (default: current branch)'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

/**
 * Create a working branch for a feature
 */
export async function gitCreateBranch(params: z.infer<typeof GitCreateBranchSchema>) {
  const { branchName, fromBranch, workspacePath = process.cwd() } = params;
  
  // Validate workspace path
  const resolvedPath = path.resolve(workspacePath);
  await validateWorkspacePath(resolvedPath);
  
  try {
    // Validate branch name (basic validation)
    if (!/^[a-zA-Z0-9/_-]+$/.test(branchName)) {
      throw new Error('Invalid branch name. Use only alphanumeric characters, hyphens, underscores, and slashes.');
    }
    
    // Check if git repo exists
    try {
      await execAsync('git rev-parse --git-dir', { cwd: resolvedPath });
    } catch {
      return {
        success: false,
        message: 'Not a git repository',
        suggestion: 'Initialize a git repository first with: git init',
        details: {
          workspacePath: resolvedPath,
          nextSteps: [
            'Run: git init',
            'Configure git user: git config user.email "you@example.com"',
            'Configure git name: git config user.name "Your Name"',
            'Make initial commit: git add . && git commit -m "Initial commit"'
          ]
        }
      };
    }
    
    // Get current branch
    const { stdout: currentBranch } = await execAsync('git branch --show-current', {
      cwd: resolvedPath,
    });
    
    // Check for uncommitted changes
    const { stdout: statusOutput } = await execAsync('git status --porcelain', {
      cwd: resolvedPath,
    });
    
    if (statusOutput.trim()) {
      const files = statusOutput.trim().split('\n');
      const modifiedCount = files.filter(f => f.startsWith(' M')).length;
      const untrackedCount = files.filter(f => f.startsWith('??')).length;
      const stagedCount = files.filter(f => f.match(/^[AM]/)).length;
      
      return {
        success: false,
        message: 'Cannot create branch: uncommitted changes detected',
        details: {
          uncommittedFiles: files.length,
          modified: modifiedCount,
          untracked: untrackedCount,
          staged: stagedCount,
          files: files.slice(0, 5).map(f => f.substring(3)), // Show first 5 files
          nextSteps: [
            'Option 1: Commit changes: git add . && git commit -m "Your message"',
            'Option 2: Stash changes: git stash',
            'Option 3: Discard changes: git reset --hard (WARNING: loses changes)'
          ]
        },
      };
    }
    
    // Create the branch
    let command: string;
    if (fromBranch) {
      // First ensure we have the base branch
      try {
        await execAsync(`git checkout ${fromBranch}`, { cwd: resolvedPath });
      } catch {
        throw new Error(`Base branch '${fromBranch}' not found`);
      }
      command = `git checkout -b ${branchName}`;
    } else {
      command = `git checkout -b ${branchName}`;
    }
    
    const { stdout } = await execAsync(command, {
      cwd: resolvedPath,
      timeout: 10000,
    });
    
    // Verify branch was created
    const { stdout: newBranch } = await execAsync('git branch --show-current', {
      cwd: resolvedPath,
    });
    
    if (newBranch.trim() !== branchName) {
      throw new Error('Branch creation verification failed');
    }
    
    return {
      success: true,
      message: `Created and switched to branch: ${branchName}`,
      details: {
        branchName,
        previousBranch: currentBranch.trim(),
        fromBranch: fromBranch || currentBranch.trim(),
        output: stdout.trim(),
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Try to provide helpful error messages
    if (errorMessage.includes('already exists')) {
      return {
        success: false,
        message: `Branch '${branchName}' already exists`,
        suggestion: 'Use a different branch name or switch to existing branch',
      };
    }
    
    throw new Error(`Failed to create branch: ${errorMessage}`);
  }
}

/**
 * Validate workspace path for security
 */
async function validateWorkspacePath(workspacePath: string): Promise<void> {
  // Prevent access to system directories
  const restrictedPaths = ['/etc', '/usr', '/bin', '/sbin', '/var', '/tmp'];
  const normalizedPath = path.normalize(workspacePath).toLowerCase();
  
  for (const restricted of restrictedPaths) {
    if (normalizedPath.startsWith(restricted)) {
      throw new Error(`Access to system directory ${restricted} is not allowed`);
    }
  }
}