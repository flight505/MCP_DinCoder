import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { findSpecsDirectory } from '../speckit/detector.js';
import { resolveWorkspacePath } from './workspace.js';
import { validateSpec, ValidationReport } from '../speckit/validators.js';

/**
 * Spec Validation & Quality Gates
 *
 * Implements GitHub Spec Kit's /analyze command for automated quality checks.
 */

// Schema for spec_validate tool
export const SpecValidateSchema = z.object({
  checks: z.object({
    completeness: z.boolean().optional().describe('Check if all required sections are present'),
    acceptanceCriteria: z.boolean().optional().describe('Check if features have testable criteria'),
    clarifications: z.boolean().optional().describe('Check for unresolved [NEEDS CLARIFICATION] markers'),
    prematureImplementation: z.boolean().optional().describe('Check for HOW details in WHAT sections')
  }).optional().describe('Which checks to run (default: all)'),
  specPath: z.string().optional().describe('Path to specific spec file (auto-detect if not provided)'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

// Schema for artifacts_analyze tool
export const ArtifactsAnalyzeSchema = z.object({
  artifacts: z.array(z.enum(['spec', 'plan', 'tasks'])).optional().describe('Which artifacts to analyze (default: all)'),
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
 * Validate a specification file
 */
export async function specValidate(params: z.infer<typeof SpecValidateSchema>) {
  const { checks = {}, specPath, workspacePath } = params;

  const resolvedPath = resolveWorkspacePath(workspacePath);

  try {
    // Find spec file
    const specFilePath = await findSpecFile(resolvedPath, specPath);

    // Load spec content
    const specContent = await fs.readFile(specFilePath, 'utf-8');

    // Run validation
    const report: ValidationReport = validateSpec(specContent, checks);

    // Generate summary message
    const totalIssues = report.errors.length + report.warnings.length;
    const status = report.passed ? 'PASSED' : 'FAILED';

    const result = {
      success: true,
      status,
      specFile: path.basename(path.dirname(specFilePath)),
      passed: report.passed,
      summary: {
        errors: report.errors.length,
        warnings: report.warnings.length,
        total: totalIssues
      },
      errors: report.errors,
      warnings: report.warnings,
      message: report.passed
        ? `Specification validation passed! No critical errors found.`
        : `Specification validation failed with ${report.errors.length} error(s) and ${report.warnings.length} warning(s).`,
      nextSteps: report.passed
        ? [
            'Specification looks good!',
            'Use plan_create to proceed with technical planning',
            'Or use spec_refine to make improvements'
          ]
        : [
            `Fix ${report.errors.length} error(s) before proceeding`,
            'Review warnings for quality improvements',
            'Use clarify_add for any ambiguities',
            'Use spec_refine to update the specification'
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
    throw new Error(`Failed to validate specification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Analyze consistency across artifacts (spec, plan, tasks)
 */
export async function artifactsAnalyze(params: z.infer<typeof ArtifactsAnalyzeSchema>) {
  const { artifacts = ['spec', 'plan', 'tasks'], workspacePath } = params;

  const resolvedPath = resolveWorkspacePath(workspacePath);

  try {
    // Find feature directory
    const specsDir = await findSpecsDirectory(resolvedPath);
    const entries = await fs.readdir(specsDir);
    const featureDirs = entries
      .filter(entry => /^\d{3}-/.test(entry))
      .sort()
      .reverse();

    if (featureDirs.length === 0) {
      throw new Error('No feature directory found');
    }

    const featurePath = path.join(specsDir, featureDirs[0]);
    const issues: ValidationReport['errors'] = [];
    const loadedArtifacts: { [key: string]: string } = {};

    // Load requested artifacts
    for (const artifact of artifacts) {
      const filePath = path.join(featurePath, `${artifact}.md`);
      try {
        loadedArtifacts[artifact] = await fs.readFile(filePath, 'utf-8');
      } catch {
        issues.push({
          rule: 'artifact_missing',
          message: `${artifact}.md file not found`,
          suggestion: artifact === 'spec'
            ? 'Run specify_describe to create spec.md'
            : artifact === 'plan'
            ? 'Run plan_create to create plan.md'
            : 'Run tasks_generate to create tasks.md'
        });
      }
    }

    // Analyze spec vs plan consistency
    if (loadedArtifacts['spec'] && loadedArtifacts['plan']) {
      const specGoals = extractSectionContent(loadedArtifacts['spec'], 'Goals');
      const planPhases = extractSectionContent(loadedArtifacts['plan'], 'Implementation');

      if (!specGoals || specGoals.trim().length < 50) {
        issues.push({
          rule: 'spec_incomplete',
          message: 'Spec has minimal or missing Goals section',
          suggestion: 'Expand Goals section with clear objectives'
        });
      }

      if (!planPhases || planPhases.trim().length < 50) {
        issues.push({
          rule: 'plan_incomplete',
          message: 'Plan has minimal or missing Implementation section',
          suggestion: 'Use plan_create to generate a detailed implementation plan'
        });
      }
    }

    // Analyze plan vs tasks consistency
    if (loadedArtifacts['plan'] && loadedArtifacts['tasks']) {
      const hasTaskList = /^[\s]*(\d+\.|[-*])\s+/m.test(loadedArtifacts['tasks']);

      if (!hasTaskList) {
        issues.push({
          rule: 'tasks_incomplete',
          message: 'tasks.md exists but has no task list',
          suggestion: 'Use tasks_generate to create a task list from the plan'
        });
      }
    }

    const result = {
      success: true,
      featureDirectory: featureDirs[0],
      artifactsChecked: artifacts,
      artifactsFound: Object.keys(loadedArtifacts),
      issues,
      passed: issues.length === 0,
      message: issues.length === 0
        ? `All artifacts are consistent!`
        : `Found ${issues.length} issue(s) across artifacts`,
      nextSteps: issues.length === 0
        ? [
            'Artifacts are aligned!',
            'Proceed with implementation using tasks.md'
          ]
        : issues.map(issue => issue.suggestion || issue.message)
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
    throw new Error(`Failed to analyze artifacts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper: Extract section content from markdown
 */
function extractSectionContent(markdown: string, sectionName: string): string | null {
  const sectionPattern = new RegExp(`##\\s+${sectionName}([\\s\\S]*?)(?=##|$)`, 'i');
  const match = markdown.match(sectionPattern);
  return match ? match[1].trim() : null;
}
