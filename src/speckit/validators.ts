/**
 * Spec Kit Validators
 *
 * Validation rules for checking specification quality and completeness.
 * Implements GitHub Spec Kit's /analyze command patterns.
 */

export interface ValidationIssue {
  rule: string;
  message: string;
  location?: string;
  suggestion?: string;
}

export interface ValidationReport {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  passed: boolean;
}

/**
 * Check if spec has all required sections
 */
export function checkCompleteness(specContent: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const requiredSections = [
    { name: 'Goals', pattern: /##\s+Goals?/i },
    { name: 'Acceptance Criteria', pattern: /##\s+(Acceptance\s+Criteria|Success\s+Criteria)/i },
    { name: 'Requirements', pattern: /##\s+(Requirements?|Features?)/i },
  ];

  for (const section of requiredSections) {
    if (!section.pattern.test(specContent)) {
      issues.push({
        rule: 'completeness',
        message: `Missing required section: ${section.name}`,
        suggestion: `Add a "## ${section.name}" section to your spec.md`
      });
    }
  }

  return issues;
}

/**
 * Check if features have testable acceptance criteria
 */
export function checkAcceptanceCriteria(specContent: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Look for acceptance criteria section
  const acceptanceMatch = specContent.match(/##\s+(Acceptance\s+Criteria|Success\s+Criteria)([\s\S]*?)(?=##|$)/i);

  if (!acceptanceMatch) {
    return [{
      rule: 'acceptance_criteria',
      message: 'No acceptance criteria section found',
      suggestion: 'Add "## Acceptance Criteria" section with testable criteria'
    }];
  }

  const acceptanceContent = acceptanceMatch[2];

  // Check for when/then patterns or bullet points
  const hasWhenThen = /when\s+.*\s+then/i.test(acceptanceContent);
  const hasBullets = /^[\s]*[-*]\s+/m.test(acceptanceContent);
  const hasChecklist = /^[\s]*-\s+\[[ x]\]/m.test(acceptanceContent);

  if (!hasWhenThen && !hasBullets && !hasChecklist) {
    issues.push({
      rule: 'acceptance_criteria',
      message: 'Acceptance criteria section exists but has no testable criteria',
      location: 'Acceptance Criteria section',
      suggestion: 'Add specific criteria using "when/then" format or bullet points'
    });
  }

  return issues;
}

/**
 * Check for unresolved clarification markers
 */
export function checkClarifications(specContent: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Find all [NEEDS CLARIFICATION] markers
  const clarificationPattern = /\[NEEDS CLARIFICATION:?\s*([^\]]*)\]/gi;
  const matches = Array.from(specContent.matchAll(clarificationPattern));

  for (const match of matches) {
    const clarificationId = match[1]?.trim() || 'unknown';
    issues.push({
      rule: 'clarifications',
      message: `Unresolved clarification: ${clarificationId}`,
      location: `Line containing: ${match[0]}`,
      suggestion: `Use clarify_resolve to address ${clarificationId || 'this clarification'}`
    });
  }

  return issues;
}

/**
 * Check for premature implementation details (HOW in WHAT sections)
 */
export function checkPrematureImplementation(specContent: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Extract sections that should focus on WHAT (Goals, Requirements, Features)
  const whatSections = specContent.match(/##\s+(Goals?|Requirements?|Features?)([\s\S]*?)(?=##|$)/gi);

  if (!whatSections) {
    return issues;
  }

  for (const section of whatSections) {
    const sectionName = section.match(/##\s+([\w\s]+)/)?.[1] || 'Unknown section';

    // Check for code blocks (implementation details)
    if (/```[\s\S]*?```/.test(section)) {
      issues.push({
        rule: 'premature_implementation',
        message: `Code block found in ${sectionName} section`,
        location: sectionName,
        suggestion: 'Move implementation details to plan.md or remove them. Specs should focus on WHAT, not HOW.'
      });
    }

    // Check for technology/library mentions (common indicator of HOW)
    const techKeywords = /\b(React|Vue|Angular|Express|Django|Flask|PostgreSQL|MongoDB|Redis|Docker|Kubernetes)\b/g;
    const techMatches = section.match(techKeywords);

    if (techMatches && techMatches.length > 2) {
      issues.push({
        rule: 'premature_implementation',
        message: `Multiple technology references in ${sectionName} section: ${techMatches.slice(0, 3).join(', ')}`,
        location: sectionName,
        suggestion: 'Specs should describe user needs, not implementation technologies. Move tech stack to plan.md.'
      });
    }

    // Check for file paths or directory structures
    if (/src\/|lib\/|components\/|routes\/|models\//i.test(section)) {
      issues.push({
        rule: 'premature_implementation',
        message: `File/directory paths found in ${sectionName} section`,
        location: sectionName,
        suggestion: 'Remove file structure details. Focus on what users need, not how code is organized.'
      });
    }
  }

  return issues;
}

/**
 * Run all validation checks and generate a report
 */
export function validateSpec(
  specContent: string,
  checks: {
    completeness?: boolean;
    acceptanceCriteria?: boolean;
    clarifications?: boolean;
    prematureImplementation?: boolean;
  } = {}
): ValidationReport {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Default: run all checks
  const runAll = Object.values(checks).every(v => v === undefined);

  if (runAll || checks.completeness) {
    errors.push(...checkCompleteness(specContent));
  }

  if (runAll || checks.acceptanceCriteria) {
    warnings.push(...checkAcceptanceCriteria(specContent));
  }

  if (runAll || checks.clarifications) {
    warnings.push(...checkClarifications(specContent));
  }

  if (runAll || checks.prematureImplementation) {
    warnings.push(...checkPrematureImplementation(specContent));
  }

  return {
    errors,
    warnings,
    passed: errors.length === 0
  };
}
