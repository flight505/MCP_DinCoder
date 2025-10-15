import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Prerequisites Check Tool
 *
 * Implements GitHub Spec Kit's `specify check` command for verifying
 * environment has required tools and dependencies before project setup.
 */

// Schema for prereqs_check tool
export const PrereqsCheckSchema = z.object({
  checkFor: z.object({
    node: z.string().optional().describe('Required Node.js version (e.g., ">=20")'),
    npm: z.boolean().optional().describe('Check if npm is available'),
    git: z.boolean().optional().describe('Check if git is available'),
    customCommands: z.array(z.string()).optional().describe('Custom commands to check (e.g., ["docker", "kubectl"])')
  }).optional().describe('What to check for (default: node, npm, git)'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

interface PrereqResult {
  name: string;
  required: boolean;
  available: boolean;
  version?: string;
  message: string;
  suggestion?: string;
}

/**
 * Check if a command is available
 */
async function checkCommandAvailable(command: string): Promise<{ available: boolean; version?: string }> {
  try {
    const versionCommands: Record<string, string> = {
      'node': 'node --version',
      'npm': 'npm --version',
      'git': 'git --version',
      'docker': 'docker --version',
      'kubectl': 'kubectl version --client --short',
      'python': 'python --version',
      'python3': 'python3 --version',
    };

    const versionCmd = versionCommands[command] || `${command} --version`;
    const { stdout } = await execAsync(versionCmd);

    // Extract version number from output
    const versionMatch = stdout.match(/\d+\.\d+\.\d+/);
    const version = versionMatch ? versionMatch[0] : stdout.trim();

    return { available: true, version };
  } catch {
    return { available: false };
  }
}

/**
 * Parse version requirement string (e.g., ">=20", "^18.0.0")
 */
function parseVersionRequirement(requirement: string): { operator: string; version: string } {
  const match = requirement.match(/^([><=^~]+)?(.+)$/);
  if (!match) {
    return { operator: '>=', version: requirement };
  }
  return {
    operator: match[1] || '>=',
    version: match[2].trim()
  };
}

/**
 * Compare semantic versions
 */
function compareVersions(version: string, requirement: string): boolean {
  const { operator, version: requiredVersion } = parseVersionRequirement(requirement);

  // Simple version comparison (major.minor.patch)
  const parseVersion = (v: string) => {
    const parts = v.replace(/^v/, '').split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    };
  };

  const current = parseVersion(version);
  const required = parseVersion(requiredVersion);

  const currentValue = current.major * 10000 + current.minor * 100 + current.patch;
  const requiredValue = required.major * 10000 + required.minor * 100 + required.patch;

  switch (operator) {
    case '>=':
      return currentValue >= requiredValue;
    case '>':
      return currentValue > requiredValue;
    case '<=':
      return currentValue <= requiredValue;
    case '<':
      return currentValue < requiredValue;
    case '=':
    case '==':
      return currentValue === requiredValue;
    case '^': // Compatible with (same major version)
      return current.major === required.major && currentValue >= requiredValue;
    case '~': // Approximately equivalent (same major.minor)
      return current.major === required.major &&
             current.minor === required.minor &&
             currentValue >= requiredValue;
    default:
      return currentValue >= requiredValue;
  }
}

/**
 * Check Node.js version
 */
async function checkNodeVersion(requirement?: string): Promise<PrereqResult> {
  const { available, version } = await checkCommandAvailable('node');

  if (!available) {
    return {
      name: 'Node.js',
      required: true,
      available: false,
      message: 'Node.js is not installed',
      suggestion: 'Install Node.js from https://nodejs.org/ (LTS version recommended)'
    };
  }

  if (!requirement) {
    return {
      name: 'Node.js',
      required: true,
      available: true,
      version,
      message: `Node.js ${version} is installed`
    };
  }

  const meetsRequirement = version ? compareVersions(version, requirement) : false;

  if (!meetsRequirement) {
    return {
      name: 'Node.js',
      required: true,
      available: true,
      version,
      message: `Node.js ${version} does not meet requirement ${requirement}`,
      suggestion: `Upgrade to Node.js ${requirement} from https://nodejs.org/`
    };
  }

  return {
    name: 'Node.js',
    required: true,
    available: true,
    version,
    message: `Node.js ${version} meets requirement ${requirement}`
  };
}

/**
 * Check prerequisites
 */
export async function prereqsCheck(params: z.infer<typeof PrereqsCheckSchema>) {
  const { checkFor = {} } = params;

  const results: PrereqResult[] = [];
  const errors: string[] = [];

  try {
    // Check Node.js
    if (checkFor.node !== undefined) {
      const nodeResult = await checkNodeVersion(checkFor.node || undefined);
      results.push(nodeResult);
      if (!nodeResult.available || (checkFor.node && nodeResult.version && !compareVersions(nodeResult.version, checkFor.node))) {
        errors.push(nodeResult.message);
      }
    } else {
      // Default: check Node.js is available
      const nodeResult = await checkNodeVersion();
      results.push(nodeResult);
      if (!nodeResult.available) {
        errors.push(nodeResult.message);
      }
    }

    // Check npm
    if (checkFor.npm !== false) {
      const { available, version } = await checkCommandAvailable('npm');
      const npmResult: PrereqResult = {
        name: 'npm',
        required: checkFor.npm === true,
        available,
        version,
        message: available ? `npm ${version} is installed` : 'npm is not installed',
        suggestion: available ? undefined : 'npm comes with Node.js. Reinstall Node.js from https://nodejs.org/'
      };
      results.push(npmResult);
      if (!available && checkFor.npm === true) {
        errors.push(npmResult.message);
      }
    }

    // Check git
    if (checkFor.git !== false) {
      const { available, version } = await checkCommandAvailable('git');
      const gitResult: PrereqResult = {
        name: 'git',
        required: checkFor.git === true,
        available,
        version,
        message: available ? `git ${version} is installed` : 'git is not installed',
        suggestion: available ? undefined : 'Install git from https://git-scm.com/'
      };
      results.push(gitResult);
      if (!available && checkFor.git === true) {
        errors.push(gitResult.message);
      }
    }

    // Check custom commands
    if (checkFor.customCommands && checkFor.customCommands.length > 0) {
      for (const command of checkFor.customCommands) {
        const { available, version } = await checkCommandAvailable(command);
        const customResult: PrereqResult = {
          name: command,
          required: true,
          available,
          version,
          message: available ? `${command} ${version || ''} is installed`.trim() : `${command} is not installed`,
          suggestion: available ? undefined : `Install ${command} (check project documentation for instructions)`
        };
        results.push(customResult);
        if (!available) {
          errors.push(customResult.message);
        }
      }
    }

    const allPassed = errors.length === 0;
    const requiredCount = results.filter(r => r.required).length;
    const passedCount = results.filter(r => r.required && r.available).length;

    const result = {
      success: true,
      allPassed,
      summary: {
        total: results.length,
        required: requiredCount,
        passed: passedCount,
        failed: requiredCount - passedCount
      },
      results,
      errors,
      message: allPassed
        ? `All ${requiredCount} required prerequisites are met!`
        : `${requiredCount - passedCount} of ${requiredCount} required prerequisites are missing`,
      nextSteps: allPassed
        ? [
            'Environment is ready!',
            'Use specify_start to initialize your project',
            'Use constitution_create to define project principles'
          ]
        : results
            .filter(r => !r.available && r.suggestion)
            .map(r => r.suggestion!)
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
    throw new Error(`Failed to check prerequisites: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
