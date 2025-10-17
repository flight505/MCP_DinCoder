import { z } from 'zod';
import * as path from 'path';
import { resolveWorkspacePath } from './workspace.js';
import { lintSpec, generateLintReport, LintConfig } from '../speckit/linter.js';

/**
 * Spec Linting Tool
 *
 * Provides automated quality checking for spec.md files with markdownlint,
 * spec-specific rules, and prose quality analysis.
 */

// Schema for spec_lint tool
export const SpecLintSchema = z.object({
  specPath: z.string().optional().describe('Path to spec file (defaults to .dincoder/spec.md or auto-detect)'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
  autoFix: z.boolean().default(false).describe('Automatically fix issues when possible'),
  config: z.object({
    markdownlint: z.object({
      enabled: z.boolean().default(true),
      config: z.record(z.any()).optional(),
    }).optional(),
    specRules: z.object({
      requiredSections: z.boolean().default(true),
      acceptanceCriteria: z.boolean().default(true),
      codeBlocks: z.boolean().default(true),
    }).optional(),
    proseRules: z.object({
      passiveVoice: z.boolean().default(true),
      vagueLanguage: z.boolean().default(true),
      ambiguousPronouns: z.boolean().default(true),
      sentenceComplexity: z.boolean().default(true),
    }).optional(),
    customRules: z.object({
      clarificationFormat: z.boolean().default(true),
      zodValidation: z.boolean().default(true),
      edgeCaseFormat: z.boolean().default(true),
    }).optional(),
    severityOverrides: z.record(z.enum(['ERROR', 'WARNING', 'INFO'])).optional(),
  }).optional().describe('Custom lint configuration (overrides defaults)'),
  format: z.enum(['json', 'markdown']).default('markdown').describe('Output format'),
});

export interface SpecLintResult {
  success: boolean;
  filePath: string;
  summary: {
    errors: number;
    warnings: number;
    info: number;
    fixable: number;
  };
  issues?: any[];
  report?: string;
  fixed?: boolean;
  message: string;
}

/**
 * Run spec linting
 */
export async function specLint(params: z.infer<typeof SpecLintSchema>): Promise<SpecLintResult> {
  const { specPath, workspacePath, autoFix, config, format } = params;

  const resolvedPath = resolveWorkspacePath(workspacePath);

  try {
    // Resolve spec file path
    let fullSpecPath: string;

    if (specPath) {
      fullSpecPath = path.isAbsolute(specPath) ? specPath : path.resolve(resolvedPath, specPath);
    } else {
      // Auto-detect spec file
      fullSpecPath = await autoDetectSpecFile(resolvedPath);
    }

    // Prepare lint config
    const lintConfig: LintConfig = {
      ...config,
      autoFix,
    };

    // Run linting
    const result = await lintSpec(fullSpecPath, lintConfig);

    // Generate report
    const report = format === 'markdown' ? generateLintReport(result) : undefined;

    // Determine success
    const success = result.summary.errors === 0;

    return {
      success,
      filePath: result.filePath,
      summary: result.summary,
      issues: format === 'json' ? result.issues : undefined,
      report,
      fixed: result.fixed,
      message: success
        ? `✅ Spec passed linting (${result.summary.warnings} warnings, ${result.summary.info} info)`
        : `❌ Spec has ${result.summary.errors} error(s), ${result.summary.warnings} warning(s)`,
    };
  } catch (error) {
    throw new Error(`Failed to lint spec: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Auto-detect spec file location
 */
async function autoDetectSpecFile(workspacePath: string): Promise<string> {
  const fs = await import('fs/promises');

  // Try common locations
  const candidates = [
    path.join(workspacePath, '.dincoder', 'spec.md'),
    path.join(workspacePath, 'spec.md'),
    path.join(workspacePath, 'specs', 'spec.md'),
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // File doesn't exist, try next
    }
  }

  throw new Error('Spec file not found. Tried: .dincoder/spec.md, spec.md, specs/spec.md');
}
