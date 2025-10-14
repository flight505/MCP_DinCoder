import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

/**
 * Quality assurance tools
 */

/**
 * Check if package.json exists in the workspace
 */
async function hasPackageJson(workspacePath: string): Promise<boolean> {
  try {
    await fs.access(path.join(workspacePath, 'package.json'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a standard "no package.json" response
 */
function createNoPackageJsonResponse(toolName: string) {
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({
        success: false,
        skipped: true,
        message: `${toolName} requires a package.json file`,
        reason: 'No package.json found in workspace',
        suggestion: 'This tool is designed for Node.js/npm projects. Initialize a project with "npm init" first.',
        nextSteps: [
          'Run "npm init" to create a package.json',
          'Add necessary dependencies and scripts',
          `Then retry ${toolName}`,
        ],
      }, null, 2)
    }]
  };
}

/**
 * Truncate large text to prevent context overflow
 */
function truncateOutput(text: string, maxLength: number = 2000): string {
  if (text.length <= maxLength) {
    return text;
  }
  const truncated = text.substring(0, maxLength);
  const lines = truncated.split('\n').length;
  return truncated + `\n\n... (truncated ${text.length - maxLength} characters, ${lines}+ lines)`;
}

// Tool schemas
export const QualityFormatSchema = z.object({
  workspacePath: z.string().optional().describe('Workspace directory path'),
  fix: z.boolean().optional().describe('Apply fixes automatically'),
});

export const QualityLintSchema = z.object({
  workspacePath: z.string().optional().describe('Workspace directory path'),
  fix: z.boolean().optional().describe('Apply fixes automatically'),
});

export const QualityTestSchema = z.object({
  workspacePath: z.string().optional().describe('Workspace directory path'),
  coverage: z.boolean().optional().describe('Include coverage report'),
});

export const QualitySecurityAuditSchema = z.object({
  workspacePath: z.string().optional().describe('Workspace directory path'),
  fix: z.boolean().optional().describe('Apply fixes automatically'),
});

export const QualityDepsUpdateSchema = z.object({
  workspacePath: z.string().optional().describe('Workspace directory path'),
  check: z.boolean().optional().describe('Only check for updates without installing'),
});

export const QualityLicenseCheckSchema = z.object({
  workspacePath: z.string().optional().describe('Workspace directory path'),
  allowedLicenses: z.array(z.string()).optional().describe('List of allowed license types'),
});

/**
 * Run code formatter (Prettier)
 */
export async function qualityFormat(params: z.infer<typeof QualityFormatSchema>) {
  const { workspacePath = process.cwd(), fix = false } = params;

  const resolvedPath = path.resolve(workspacePath);

  // Check if package.json exists (needed for npm run format)
  if (fix && !(await hasPackageJson(resolvedPath))) {
    return createNoPackageJsonResponse('quality_format');
  }

  try {
    const prettierTargets = [
      '"src/**/*.{ts,tsx,js,jsx,cjs,mjs,json}"',
      '"tests/**/*.{ts,tsx,js,jsx,cjs,mjs,json}"',
      '"scripts/**/*.{ts,tsx,js,jsx,cjs,mjs}"',
      '"docs/**/*.{md,mdx}"',
      '"templates/**/*.{md,mdx,json}"',
      '"examples/**/*.{ts,tsx,js,jsx,md}"',
      '"*.{js,ts,tsx,cjs,mjs,json,md,mdx,yaml,yml}"',
    ];

    const command = fix
      ? 'npm run format'
      : `npx prettier --check --no-error-on-unmatched-pattern ${prettierTargets.join(' ')}`;

    const { stdout, stderr } = await execAsync(command, {
      cwd: resolvedPath,
      timeout: 30000,
    });

    if (stderr && !stderr.includes('warning') && !stderr.includes('npm warn')) {
      throw new Error(`Format error: ${stderr}`);
    }

    const output = stdout.trim();
    const hasIssues = output.includes('Code style issues found');

    const result = {
      success: true,
      message: fix ? 'Code formatted successfully' : 'Format check completed',
      details: {
        hasIssues,
        output: truncateOutput(output, 1000),
        command,
      },
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const result = {
      success: false,
      message: 'Format check failed',
      error: truncateOutput(errorMessage, 500),
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
}

/**
 * Run linter (ESLint)
 */
export async function qualityLint(params: z.infer<typeof QualityLintSchema>) {
  const { workspacePath = process.cwd(), fix = false } = params;

  const resolvedPath = path.resolve(workspacePath);

  // Check if package.json exists
  if (!(await hasPackageJson(resolvedPath))) {
    return createNoPackageJsonResponse('quality_lint');
  }

  try {
    const command = fix
      ? 'npx eslint . --fix'
      : 'npm run lint';

    const { stdout } = await execAsync(command, {
      cwd: resolvedPath,
      timeout: 30000,
    });

    const output = stdout.trim();
    const problems = parseEslintOutput(output);

    const result = {
      success: true,
      message: fix ? 'Linting completed with fixes' : 'Linting completed',
      problems: problems.slice(0, 50), // Limit to 50 problems to prevent overflow
      details: {
        totalProblems: problems.length,
        errors: problems.filter(p => p.severity === 'error').length,
        warnings: problems.filter(p => p.severity === 'warning').length,
        command,
        truncated: problems.length > 50,
      },
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // ESLint exits with non-zero code when there are problems
    if (errorMessage.includes('exit code 1')) {
      const output = (error as any).stdout || '';
      const problems = parseEslintOutput(output);

      const result = {
        success: false,
        message: 'Linting found issues',
        problems: problems.slice(0, 50),
        details: {
          totalProblems: problems.length,
          errors: problems.filter(p => p.severity === 'error').length,
          warnings: problems.filter(p => p.severity === 'warning').length,
          truncated: problems.length > 50,
        },
      };

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2)
        }]
      };
    }

    const result = {
      success: false,
      message: 'Linting failed',
      error: truncateOutput(errorMessage, 500),
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
}

/**
 * Run tests with optional coverage
 */
export async function qualityTest(params: z.infer<typeof QualityTestSchema>) {
  const { workspacePath = process.cwd(), coverage = false } = params;

  const resolvedPath = path.resolve(workspacePath);

  // Check if package.json exists
  if (!(await hasPackageJson(resolvedPath))) {
    return createNoPackageJsonResponse('quality_test');
  }

  try {
    const command = coverage
      ? 'npm run test:coverage'
      : 'npm test';

    const { stdout } = await execAsync(command, {
      cwd: resolvedPath,
      timeout: 60000, // 60 seconds for tests
      env: { ...process.env, CI: 'true' },
    });

    const output = stdout.trim();
    const testResults = parseTestOutput(output);

    const result = {
      success: true,
      message: 'Tests completed',
      results: testResults,
      details: {
        command,
        coverage: coverage && output.includes('Coverage'),
        output: truncateOutput(output, 1000),
      },
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const output = (error as any).stdout || '';
    const testResults = parseTestOutput(output);

    const result = {
      success: false,
      message: 'Tests failed',
      results: testResults,
      error: truncateOutput(errorMessage, 500),
      output: truncateOutput(output, 1000),
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
}

/**
 * Run security audit
 */
export async function qualitySecurityAudit(params: z.infer<typeof QualitySecurityAuditSchema>) {
  const { workspacePath = process.cwd(), fix = false } = params;

  const resolvedPath = path.resolve(workspacePath);

  // Check if package.json exists
  if (!(await hasPackageJson(resolvedPath))) {
    return createNoPackageJsonResponse('quality_security_audit');
  }

  try {
    const command = fix
      ? 'npm audit fix'
      : 'npm audit --json';

    const { stdout } = await execAsync(command, {
      cwd: resolvedPath,
      timeout: 60000,
    });

    if (!fix) {
      const auditData = JSON.parse(stdout);
      const vulnerabilities = auditData.metadata?.vulnerabilities || {};

      const result = {
        success: true,
        message: 'Security audit completed',
        vulnerabilities: {
          total: vulnerabilities.total || 0,
          low: vulnerabilities.low || 0,
          moderate: vulnerabilities.moderate || 0,
          high: vulnerabilities.high || 0,
          critical: vulnerabilities.critical || 0,
        },
        details: {
          dependencies: auditData.metadata?.dependencies || 0,
          devDependencies: auditData.metadata?.devDependencies || 0,
        },
      };

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2)
        }]
      };
    }

    const result = {
      success: true,
      message: 'Security vulnerabilities fixed',
      details: {
        output: truncateOutput(stdout, 1000),
      },
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // npm audit returns non-zero exit code when vulnerabilities are found
    if (errorMessage.includes('exit code')) {
      const output = (error as any).stdout || '';
      try {
        const auditData = JSON.parse(output);
        const vulnerabilities = auditData.metadata?.vulnerabilities || {};

        const result = {
          success: false,
          message: 'Security vulnerabilities found',
          vulnerabilities: {
            total: vulnerabilities.total || 0,
            low: vulnerabilities.low || 0,
            moderate: vulnerabilities.moderate || 0,
            high: vulnerabilities.high || 0,
            critical: vulnerabilities.critical || 0,
          },
        };

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch {
        // Failed to parse JSON
      }
    }

    const result = {
      success: false,
      message: 'Security audit failed',
      error: truncateOutput(errorMessage, 500),
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
}

/**
 * Parse ESLint output
 */
function parseEslintOutput(output: string): Array<{
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  message: string;
}> {
  const problems: Array<{
    file: string;
    line: number;
    column: number;
    severity: 'error' | 'warning';
    message: string;
  }> = [];
  
  // Simple parsing - would need enhancement for production
  const lines = output.split('\n');
  let currentFile = '';
  
  for (const line of lines) {
    if (line.includes(':') && (line.includes('error') || line.includes('warning'))) {
      const match = line.match(/(\d+):(\d+)\s+(error|warning)\s+(.+)/);
      if (match) {
        problems.push({
          file: currentFile,
          line: parseInt(match[1], 10),
          column: parseInt(match[2], 10),
          severity: match[3] as 'error' | 'warning',
          message: match[4],
        });
      }
    } else if (line.endsWith('.ts') || line.endsWith('.js')) {
      currentFile = line.trim();
    }
  }
  
  return problems;
}

/**
 * Parse test output
 */
function parseTestOutput(output: string): {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration?: string;
} {
  // Parse vitest output format
  // const totalMatch = output.match(/Tests\s+(\d+)\s+failed/);
  const passedMatch = output.match(/(\d+)\s+passed/);
  const failedMatch = output.match(/(\d+)\s+failed/);
  const durationMatch = output.match(/Duration\s+([\d.]+\w+)/);
  
  const failed = failedMatch ? parseInt(failedMatch[1], 10) : 0;
  const passed = passedMatch ? parseInt(passedMatch[1], 10) : 0;
  
  return {
    total: failed + passed,
    passed,
    failed,
    skipped: 0,
    duration: durationMatch ? durationMatch[1] : undefined,
  };
}

/**
 * Check for dependency updates
 */
export async function qualityDepsUpdate(params: z.infer<typeof QualityDepsUpdateSchema>) {
  const { workspacePath = process.cwd(), check = true } = params;

  const resolvedPath = path.resolve(workspacePath);

  // Check if package.json exists
  if (!(await hasPackageJson(resolvedPath))) {
    return createNoPackageJsonResponse('quality_deps_update');
  }

  try {
    const command = check
      ? 'npm outdated --json'
      : 'npm update --dry-run';

    const { stdout } = await execAsync(command, {
      cwd: resolvedPath,
      timeout: 60000,
    });

    if (check) {
      try {
        const outdatedData = JSON.parse(stdout || '{}');
        const outdatedPackages = Object.entries(outdatedData).map(([name, info]: [string, any]) => ({
          package: name,
          current: info.current,
          wanted: info.wanted,
          latest: info.latest,
          type: info.type,
        }));

        const result = {
          success: true,
          message: 'Dependency update check completed',
          outdated: outdatedPackages,
          details: {
            totalOutdated: outdatedPackages.length,
            major: outdatedPackages.filter(p => p.current !== p.latest).length,
            minor: outdatedPackages.filter(p => p.current === p.wanted).length,
          },
        };

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch {
        // npm outdated returns empty when all packages are up to date
        const result = {
          success: true,
          message: 'All dependencies are up to date',
          outdated: [],
          details: {
            totalOutdated: 0,
            major: 0,
            minor: 0,
          },
        };

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    }

    const result = {
      success: true,
      message: 'Dependency update dry-run completed',
      details: {
        output: truncateOutput(stdout, 1000),
      },
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // npm outdated returns non-zero exit code when packages are outdated
    if (errorMessage.includes('exit code')) {
      const output = (error as any).stdout || '';
      try {
        const outdatedData = JSON.parse(output || '{}');
        const outdatedPackages = Object.entries(outdatedData).map(([name, info]: [string, any]) => ({
          package: name,
          current: info.current,
          wanted: info.wanted,
          latest: info.latest,
          type: info.type,
        }));

        const result = {
          success: true,
          message: 'Found outdated dependencies',
          outdated: outdatedPackages,
          details: {
            totalOutdated: outdatedPackages.length,
          },
        };

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch {
        // Failed to parse
      }
    }

    const result = {
      success: false,
      message: 'Dependency update check failed',
      error: truncateOutput(errorMessage, 500),
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
}

/**
 * Check licenses of dependencies
 */
export async function qualityLicenseCheck(params: z.infer<typeof QualityLicenseCheckSchema>) {
  const { workspacePath = process.cwd(), allowedLicenses = ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'BSD-2-Clause', 'ISC'] } = params;

  const resolvedPath = path.resolve(workspacePath);

  // Check if package.json exists
  if (!(await hasPackageJson(resolvedPath))) {
    return createNoPackageJsonResponse('quality_license_check');
  }

  try {
    // Use npm ls to get dependency tree with license info
    const { stdout } = await execAsync('npm ls --json --depth=0', {
      cwd: resolvedPath,
      timeout: 30000,
    });

    const packageData = JSON.parse(stdout);
    const dependencies = packageData.dependencies || {};

    const licenses: Array<{
      package: string;
      license: string;
      allowed: boolean;
    }> = [];

    const problematicLicenses: Array<{
      package: string;
      license: string;
    }> = [];

    // Check each dependency
    for (const [pkgName] of Object.entries(dependencies)) {
      // Try to get license from package.json
      try {
        const pkgJsonPath = path.join(resolvedPath, 'node_modules', pkgName, 'package.json');
        const { stdout: pkgJson } = await execAsync(`cat "${pkgJsonPath}"`, {
          cwd: resolvedPath,
        });

        const pkgData = JSON.parse(pkgJson);
        const license = pkgData.license || 'UNKNOWN';
        const isAllowed = allowedLicenses.some(allowed =>
          license.includes(allowed) || allowed.includes(license)
        );

        licenses.push({
          package: pkgName,
          license,
          allowed: isAllowed,
        });

        if (!isAllowed && license !== 'UNKNOWN') {
          problematicLicenses.push({
            package: pkgName,
            license,
          });
        }
      } catch {
        // Skip if package.json not found
        licenses.push({
          package: pkgName,
          license: 'UNKNOWN',
          allowed: false,
        });
      }
    }

    const result = {
      success: problematicLicenses.length === 0,
      message: problematicLicenses.length === 0
        ? 'All licenses are compatible'
        : `Found ${problematicLicenses.length} packages with potentially incompatible licenses`,
      licenses: licenses.sort((a, b) => a.package.localeCompare(b.package)).slice(0, 50), // Limit to 50 for context
      problematic: problematicLicenses,
      details: {
        totalPackages: licenses.length,
        allowedLicenses,
        unknownLicenses: licenses.filter(l => l.license === 'UNKNOWN').length,
        truncated: licenses.length > 50,
      },
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const result = {
      success: false,
      message: 'License check failed',
      error: truncateOutput(errorMessage, 500),
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
}
