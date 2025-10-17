/**
 * Spec Linter Module
 *
 * Provides automated quality checking for spec.md files with:
 * - Markdownlint integration for markdown quality
 * - Spec-specific rules (required sections, acceptance criteria)
 * - Prose quality rules (passive voice, vague language)
 * - Auto-fix capabilities for simple issues
 * - Configurable severity levels
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { lint as markdownlintSync } from 'markdownlint/sync';

export type LintSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface LintIssue {
  rule: string;
  severity: LintSeverity;
  line: number;
  column: number;
  message: string;
  fixable: boolean;
  context?: string;
  suggestion?: string;
}

export interface LintResult {
  filePath: string;
  issues: LintIssue[];
  fixed: boolean;
  summary: {
    errors: number;
    warnings: number;
    info: number;
    fixable: number;
  };
}

export interface LintConfig {
  markdownlint?: {
    enabled: boolean;
    config?: any;
  };
  specRules?: {
    requiredSections?: boolean;
    acceptanceCriteria?: boolean;
    codeBlocks?: boolean;
  };
  proseRules?: {
    passiveVoice?: boolean;
    vagueLanguage?: boolean;
    ambiguousPronouns?: boolean;
    sentenceComplexity?: boolean;
  };
  customRules?: {
    clarificationFormat?: boolean;
    zodValidation?: boolean;
    edgeCaseFormat?: boolean;
  };
  autoFix?: boolean;
  severityOverrides?: Record<string, LintSeverity>;
}

const DEFAULT_CONFIG: LintConfig = {
  markdownlint: {
    enabled: true,
    config: {
      // MD013: Line length - disabled for specs which may have long examples
      MD013: false,
      // MD033: Inline HTML - disabled for flexibility
      MD033: false,
      // MD041: First line heading - enforce
      MD041: true,
    },
  },
  specRules: {
    requiredSections: true,
    acceptanceCriteria: true,
    codeBlocks: true,
  },
  proseRules: {
    passiveVoice: true,
    vagueLanguage: true,
    ambiguousPronouns: true,
    sentenceComplexity: true,
  },
  customRules: {
    clarificationFormat: true,
    zodValidation: true,
    edgeCaseFormat: true,
  },
  autoFix: false,
  severityOverrides: {},
};

/**
 * Load lint configuration from .dincoder/lint.json
 */
async function loadLintConfig(workspacePath: string): Promise<LintConfig> {
  const configPath = path.join(workspacePath, '.dincoder', 'lint.json');

  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const userConfig = JSON.parse(content);
    return { ...DEFAULT_CONFIG, ...userConfig };
  } catch {
    return DEFAULT_CONFIG;
  }
}

/**
 * Main lint function
 */
export async function lintSpec(
  specPath: string,
  config?: Partial<LintConfig>
): Promise<LintResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const issues: LintIssue[] = [];

  // Read spec content
  const content = await fs.readFile(specPath, 'utf-8');
  const lines = content.split('\n');

  // Run markdownlint
  if (fullConfig.markdownlint?.enabled) {
    const mdlintIssues = await runMarkdownlint(specPath, content, fullConfig.markdownlint.config);
    issues.push(...mdlintIssues);
  }

  // Run spec-specific rules
  if (fullConfig.specRules) {
    if (fullConfig.specRules.requiredSections) {
      issues.push(...checkRequiredSections(lines));
    }
    if (fullConfig.specRules.acceptanceCriteria) {
      issues.push(...checkAcceptanceCriteria(lines));
    }
    if (fullConfig.specRules.codeBlocks) {
      issues.push(...checkCodeBlocks(lines));
    }
  }

  // Run prose quality rules
  if (fullConfig.proseRules) {
    if (fullConfig.proseRules.passiveVoice) {
      issues.push(...detectPassiveVoice(lines));
    }
    if (fullConfig.proseRules.vagueLanguage) {
      issues.push(...flagVagueLanguage(lines));
    }
    if (fullConfig.proseRules.ambiguousPronouns) {
      issues.push(...detectAmbiguousPronouns(lines));
    }
    if (fullConfig.proseRules.sentenceComplexity) {
      issues.push(...checkSentenceComplexity(lines));
    }
  }

  // Run custom DinCoder rules
  if (fullConfig.customRules) {
    if (fullConfig.customRules.clarificationFormat) {
      issues.push(...verifyClarificationFormat(lines));
    }
    if (fullConfig.customRules.zodValidation) {
      issues.push(...validateZodSchemas(lines));
    }
    if (fullConfig.customRules.edgeCaseFormat) {
      issues.push(...checkEdgeCaseFormat(lines));
    }
  }

  // Apply severity overrides
  if (fullConfig.severityOverrides) {
    for (const issue of issues) {
      if (fullConfig.severityOverrides[issue.rule]) {
        issue.severity = fullConfig.severityOverrides[issue.rule];
      }
    }
  }

  // Auto-fix if enabled
  let fixed = false;
  if (fullConfig.autoFix) {
    const fixedContent = await applyAutoFixes(content, issues);
    if (fixedContent !== content) {
      await fs.writeFile(specPath, fixedContent, 'utf-8');
      fixed = true;
    }
  }

  // Calculate summary
  const summary = {
    errors: issues.filter(i => i.severity === 'ERROR').length,
    warnings: issues.filter(i => i.severity === 'WARNING').length,
    info: issues.filter(i => i.severity === 'INFO').length,
    fixable: issues.filter(i => i.fixable).length,
  };

  return {
    filePath: specPath,
    issues: issues.sort((a, b) => a.line - b.line || a.column - b.column),
    fixed,
    summary,
  };
}

/**
 * Run markdownlint
 */
async function runMarkdownlint(
  filePath: string,
  content: string,
  config?: any
): Promise<LintIssue[]> {
  const issues: LintIssue[] = [];

  const options = {
    strings: {
      [filePath]: content,
    },
    config: config || {},
  };

  const results = markdownlintSync(options);

  for (const [_file, fileResults] of Object.entries(results)) {
    for (const result of fileResults) {
      issues.push({
        rule: `MD${result.ruleNames[0].substring(2)}`,
        severity: 'WARNING',
        line: result.lineNumber,
        column: result.errorRange ? result.errorRange[0] : 1,
        message: result.ruleDescription,
        fixable: result.fixInfo !== undefined,
        context: result.errorContext,
      });
    }
  }

  return issues;
}

/**
 * Check for required sections
 */
function checkRequiredSections(lines: string[]): LintIssue[] {
  const issues: LintIssue[] = [];
  const requiredSections = ['Goals', 'Requirements', 'Acceptance Criteria', 'Edge Cases'];

  const foundSections = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      const heading = match[1].trim();
      for (const required of requiredSections) {
        if (heading.toLowerCase().includes(required.toLowerCase())) {
          foundSections.add(required);
        }
      }
    }
  }

  for (const required of requiredSections) {
    if (!foundSections.has(required)) {
      issues.push({
        rule: 'spec-required-section',
        severity: 'ERROR',
        line: 1,
        column: 1,
        message: `Missing required section: "${required}"`,
        fixable: false,
        suggestion: `Add a "## ${required}" section to your specification`,
      });
    }
  }

  return issues;
}

/**
 * Check acceptance criteria format
 */
function checkAcceptanceCriteria(lines: string[]): LintIssue[] {
  const issues: LintIssue[] = [];
  let inAcceptanceSection = false;
  let foundCriteria = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we're in acceptance criteria section
    if (line.match(/^##\s+Acceptance\s+Criteria/i)) {
      inAcceptanceSection = true;
      continue;
    }

    // Exit section on next heading
    if (inAcceptanceSection && line.match(/^##\s+/)) {
      inAcceptanceSection = false;
      if (!foundCriteria) {
        issues.push({
          rule: 'spec-acceptance-format',
          severity: 'WARNING',
          line: i,
          column: 1,
          message: 'Acceptance Criteria section has no criteria',
          fixable: false,
          suggestion: 'Add acceptance criteria in "When... Then..." format',
        });
      }
    }

    // Check for criteria format
    if (inAcceptanceSection && line.match(/^[\s-•*]+/)) {
      foundCriteria = true;

      // Check for When/Then format
      const criteriaText = line.replace(/^[\s-•*]+/, '').trim();
      if (!criteriaText.match(/\b(when|given|then)\b/i)) {
        issues.push({
          rule: 'spec-acceptance-format',
          severity: 'INFO',
          line: i + 1,
          column: 1,
          message: 'Acceptance criteria should use "When... Then..." format',
          fixable: false,
          context: criteriaText.substring(0, 50),
          suggestion: 'Example: "When user clicks save, Then data is persisted"',
        });
      }
    }
  }

  return issues;
}

/**
 * Check code blocks have language tags
 */
function checkCodeBlocks(lines: string[]): LintIssue[] {
  const issues: LintIssue[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for code fence without language
    if (line.match(/^```\s*$/)) {
      issues.push({
        rule: 'spec-code-block-language',
        severity: 'WARNING',
        line: i + 1,
        column: 1,
        message: 'Code block missing language tag',
        fixable: true,
        suggestion: 'Add language: ```typescript or ```json or ```bash',
      });
    }
  }

  return issues;
}

/**
 * Detect passive voice
 */
function detectPassiveVoice(lines: string[]): LintIssue[] {
  const issues: LintIssue[] = [];

  // Common passive voice patterns
  const passivePatterns = [
    /\b(is|are|was|were|be|been|being)\s+(being\s+)?\w+ed\b/i,
    /\b(will|can|could|should|would|may|might)\s+be\s+\w+ed\b/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip code blocks and headings
    if (line.match(/^```/) || line.match(/^#+\s/)) {
      continue;
    }

    for (const pattern of passivePatterns) {
      const match = line.match(pattern);
      if (match) {
        issues.push({
          rule: 'prose-passive-voice',
          severity: 'INFO',
          line: i + 1,
          column: (line.indexOf(match[0]) || 0) + 1,
          message: 'Passive voice detected - consider active voice',
          fixable: false,
          context: match[0],
          suggestion: 'Rewrite in active voice (e.g., "system does X" instead of "X is done by system")',
        });
      }
    }
  }

  return issues;
}

/**
 * Flag vague language
 */
function flagVagueLanguage(lines: string[]): LintIssue[] {
  const issues: LintIssue[] = [];

  const vagueWords = [
    'should', 'might', 'probably', 'maybe', 'could',
    'possibly', 'perhaps', 'somewhat', 'fairly', 'quite',
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip code blocks and headings
    if (line.match(/^```/) || line.match(/^#+\s/)) {
      continue;
    }

    for (const word of vagueWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = Array.from(line.matchAll(regex));

      for (const match of matches) {
        issues.push({
          rule: 'prose-vague-language',
          severity: 'INFO',
          line: i + 1,
          column: (match.index || 0) + 1,
          message: `Vague language: "${word}" - be more specific`,
          fixable: false,
          context: match[0],
          suggestion: 'Use specific, definitive language (e.g., "must", "will", "does")',
        });
      }
    }
  }

  return issues;
}

/**
 * Detect ambiguous pronouns
 */
function detectAmbiguousPronouns(lines: string[]): LintIssue[] {
  const issues: LintIssue[] = [];

  const pronouns = ['it', 'this', 'that', 'these', 'those'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip code blocks and headings
    if (line.match(/^```/) || line.match(/^#+\s/)) {
      continue;
    }

    // Check if line starts with pronoun (often ambiguous)
    for (const pronoun of pronouns) {
      const regex = new RegExp(`^\\s*${pronoun}\\b`, 'i');
      if (line.match(regex)) {
        issues.push({
          rule: 'prose-ambiguous-pronoun',
          severity: 'INFO',
          line: i + 1,
          column: 1,
          message: `Sentence starts with ambiguous pronoun "${pronoun}"`,
          fixable: false,
          suggestion: 'Specify what the pronoun refers to',
        });
      }
    }
  }

  return issues;
}

/**
 * Check sentence complexity
 */
function checkSentenceComplexity(lines: string[]): LintIssue[] {
  const issues: LintIssue[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip code blocks and headings
    if (line.match(/^```/) || line.match(/^#+\s/) || line.match(/^[\s-•*]+/)) {
      continue;
    }

    // Split by sentence-ending punctuation
    const sentences = line.split(/[.!?]+/).filter(s => s.trim().length > 0);

    for (const sentence of sentences) {
      const words = sentence.split(/\s+/).length;

      if (words > 30) {
        issues.push({
          rule: 'prose-sentence-complexity',
          severity: 'INFO',
          line: i + 1,
          column: 1,
          message: `Long sentence (${words} words) - consider breaking into smaller sentences`,
          fixable: false,
          context: sentence.substring(0, 50) + '...',
          suggestion: 'Break into multiple sentences for clarity',
        });
      }
    }
  }

  return issues;
}

/**
 * Verify clarification format
 */
function verifyClarificationFormat(lines: string[]): LintIssue[] {
  const issues: LintIssue[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for malformed clarification markers
    if (line.match(/\[.*clarif/i) && !line.match(/\[NEEDS CLARIFICATION\]/)) {
      issues.push({
        rule: 'dincoder-clarification-format',
        severity: 'ERROR',
        line: i + 1,
        column: 1,
        message: 'Malformed clarification marker',
        fixable: true,
        context: line.substring(0, 50),
        suggestion: 'Use exact format: [NEEDS CLARIFICATION]',
      });
    }
  }

  return issues;
}

/**
 * Validate Zod schemas
 */
function validateZodSchemas(lines: string[]): LintIssue[] {
  const issues: LintIssue[] = [];
  let inCodeBlock = false;
  let codeBlockStart = 0;
  let codeBlockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^```(typescript|ts)/)) {
      inCodeBlock = true;
      codeBlockStart = i + 1;
      codeBlockContent = [];
      continue;
    }

    if (inCodeBlock && line.match(/^```$/)) {
      inCodeBlock = false;

      // Check if code block contains Zod schema
      const code = codeBlockContent.join('\n');
      if (code.includes('z.') || code.includes('zod')) {
        // Basic syntax check
        if (!code.includes('z.object') && !code.includes('z.string') && !code.includes('z.number')) {
          issues.push({
            rule: 'dincoder-zod-validation',
            severity: 'WARNING',
            line: codeBlockStart,
            column: 1,
            message: 'Code block mentions Zod but may not contain valid schema',
            fixable: false,
            suggestion: 'Verify Zod schema syntax',
          });
        }
      }

      codeBlockContent = [];
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
    }
  }

  return issues;
}

/**
 * Check edge case format
 */
function checkEdgeCaseFormat(lines: string[]): LintIssue[] {
  const issues: LintIssue[] = [];
  let inEdgeCaseSection = false;
  let foundCases = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we're in edge cases section
    if (line.match(/^##\s+Edge\s+Cases/i)) {
      inEdgeCaseSection = true;
      continue;
    }

    // Exit section on next heading
    if (inEdgeCaseSection && line.match(/^##\s+/)) {
      inEdgeCaseSection = false;
      if (!foundCases) {
        issues.push({
          rule: 'dincoder-edge-case-format',
          severity: 'WARNING',
          line: i,
          column: 1,
          message: 'Edge Cases section has no cases listed',
          fixable: false,
          suggestion: 'Add edge cases as bullet points',
        });
      }
    }

    // Check for cases
    if (inEdgeCaseSection && line.match(/^[\s-•*]+/)) {
      foundCases = true;
    }
  }

  return issues;
}

/**
 * Apply auto-fixes
 */
async function applyAutoFixes(content: string, issues: LintIssue[]): Promise<string> {
  let fixed = content;

  // Sort issues by line number (descending) to avoid offset issues
  const fixableIssues = issues
    .filter(i => i.fixable)
    .sort((a, b) => b.line - a.line);

  for (const issue of fixableIssues) {
    if (issue.rule === 'spec-code-block-language') {
      fixed = fixCodeBlockLanguage(fixed, issue.line);
    } else if (issue.rule === 'dincoder-clarification-format') {
      fixed = fixClarificationFormat(fixed, issue.line);
    }
  }

  // Apply general markdown fixes
  fixed = fixTrailingSpaces(fixed);
  fixed = fixLineEndings(fixed);

  return fixed;
}

/**
 * Fix code block language tag
 */
function fixCodeBlockLanguage(content: string, lineNumber: number): string {
  const lines = content.split('\n');
  if (lineNumber > 0 && lineNumber <= lines.length) {
    if (lines[lineNumber - 1].match(/^```\s*$/)) {
      // Default to 'text' if we can't infer language
      lines[lineNumber - 1] = '```text';
    }
  }
  return lines.join('\n');
}

/**
 * Fix clarification format
 */
function fixClarificationFormat(content: string, lineNumber: number): string {
  const lines = content.split('\n');
  if (lineNumber > 0 && lineNumber <= lines.length) {
    lines[lineNumber - 1] = lines[lineNumber - 1].replace(
      /\[.*clarif.*\]/gi,
      '[NEEDS CLARIFICATION]'
    );
  }
  return lines.join('\n');
}

/**
 * Fix trailing spaces
 */
function fixTrailingSpaces(content: string): string {
  return content
    .split('\n')
    .map(line => line.replace(/\s+$/, ''))
    .join('\n');
}

/**
 * Fix line endings
 */
function fixLineEndings(content: string): string {
  // Ensure file ends with single newline
  return content.replace(/\n*$/, '\n');
}

/**
 * Generate formatted lint report
 */
export function generateLintReport(result: LintResult): string {
  const { filePath, issues, fixed, summary } = result;

  let report = `# Lint Report: ${path.basename(filePath)}\n\n`;

  if (fixed) {
    report += '✅ Auto-fixes applied\n\n';
  }

  // Summary
  report += '## Summary\n\n';
  report += `- **Errors:** ${summary.errors}\n`;
  report += `- **Warnings:** ${summary.warnings}\n`;
  report += `- **Info:** ${summary.info}\n`;
  report += `- **Fixable:** ${summary.fixable}\n\n`;

  if (issues.length === 0) {
    report += '✨ No issues found!\n';
    return report;
  }

  // Group by severity
  const errors = issues.filter(i => i.severity === 'ERROR');
  const warnings = issues.filter(i => i.severity === 'WARNING');
  const info = issues.filter(i => i.severity === 'INFO');

  if (errors.length > 0) {
    report += '## Errors\n\n';
    for (const issue of errors) {
      report += formatIssue(issue);
    }
  }

  if (warnings.length > 0) {
    report += '## Warnings\n\n';
    for (const issue of warnings) {
      report += formatIssue(issue);
    }
  }

  if (info.length > 0) {
    report += '## Info\n\n';
    for (const issue of info) {
      report += formatIssue(issue);
    }
  }

  return report;
}

/**
 * Format single issue for report
 */
function formatIssue(issue: LintIssue): string {
  let text = `### Line ${issue.line}:${issue.column} - ${issue.rule}\n\n`;
  text += `**${issue.message}**\n\n`;

  if (issue.context) {
    text += `Context: \`${issue.context}\`\n\n`;
  }

  if (issue.suggestion) {
    text += `💡 Suggestion: ${issue.suggestion}\n\n`;
  }

  if (issue.fixable) {
    text += '🔧 *Auto-fixable*\n\n';
  }

  return text;
}

/**
 * Export configuration
 */
export { loadLintConfig, DEFAULT_CONFIG };
