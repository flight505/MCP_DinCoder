/**
 * Spec Kit template manager
 * 
 * Manages and processes Spec Kit markdown templates
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type TemplateName = 'spec' | 'plan' | 'tasks';

export interface TemplateVariables {
  [key: string]: string | string[] | Record<string, any>;
}

/**
 * Load a Spec Kit template
 */
export async function loadTemplate(name: TemplateName): Promise<string> {
  const templatePath = path.join(
    __dirname,
    '..',
    '..',
    'templates',
    'speckit',
    `${name}-template.md`
  );
  
  try {
    return await fs.readFile(templatePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to load template ${name}: ${error}`);
  }
}

/**
 * Process template with variables
 */
export function processTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let processed = template;
  
  // Replace simple variables: [VARIABLE_NAME] -> value
  for (const [key, value] of Object.entries(variables)) {
    if (typeof value === 'string') {
      const pattern = new RegExp(`\\[${key}\\]`, 'g');
      processed = processed.replace(pattern, value);
    }
  }
  
  // Handle special variables
  if (variables.DATE) {
    processed = processed.replace(/\[DATE\]/g, new Date().toISOString().split('T')[0]);
  }
  
  return processed;
}

/**
 * Generate spec from template
 */
export async function generateSpecFromTemplate(
  description: string,
  projectName: string = 'unnamed-feature'
): Promise<string> {
  const template = await loadTemplate('spec');
  
  // Extract key concepts from description
  const concepts = extractKeyConcepts(description);
  
  // Generate functional requirements
  const requirements = generateFunctionalRequirements(description, concepts);
  
  // Generate user scenarios
  const scenarios = generateUserScenarios(description, concepts);
  
  const variables: TemplateVariables = {
    'FEATURE NAME': projectName,
    'ARGUMENTS': description,
    'DATE': new Date().toISOString().split('T')[0],
    '###-feature-name': await generateFeatureBranch(projectName),
  };
  
  let spec = processTemplate(template, variables);
  
  // Fill in dynamic sections
  spec = spec.replace(
    '[Describe the main user journey in plain language]',
    scenarios.primaryStory
  );
  
  // Replace requirement placeholders
  spec = replaceRequirements(spec, requirements);
  
  // Replace acceptance scenarios
  spec = replaceAcceptanceScenarios(spec, scenarios.acceptanceScenarios);
  
  // Mark ambiguities
  spec = markAmbiguities(spec, description);
  
  return spec;
}

/**
 * Generate plan from template
 */
export async function generatePlanFromTemplate(
  specPath: string,
  constraints: string
): Promise<{ plan: string; research: string; dataModel: string }> {
  const template = await loadTemplate('plan');
  
  // Parse constraints for technical context
  const techContext = parseTechnicalContext(constraints);
  
  const variables: TemplateVariables = {
    'FEATURE': await extractFeatureNameFromSpec(specPath),
    '###-feature-name': path.basename(path.dirname(specPath)),
    'DATE': new Date().toISOString().split('T')[0],
    'link': specPath,
  };
  
  let plan = processTemplate(template, variables);
  
  // Fill technical context
  plan = fillTechnicalContext(plan, techContext);
  
  // Generate research document
  const research = generateResearchDocument(techContext);
  
  // Generate data model
  const dataModel = await generateDataModel(specPath);
  
  return { plan, research, dataModel };
}

/**
 * Generate tasks from template
 */
export async function generateTasksFromTemplate(
  planPath: string,
  scope?: string
): Promise<string> {
  const template = await loadTemplate('tasks');
  
  // Load plan and extract information
  const planContent = await fs.readFile(planPath, 'utf-8');
  const planInfo = extractPlanInfo(planContent);
  
  const variables: TemplateVariables = {
    'FEATURE NAME': planInfo.featureName,
    '###-feature-name': path.basename(path.dirname(planPath)),
  };
  
  let tasks = processTemplate(template, variables);
  
  // Generate actual tasks based on plan
  const generatedTasks = generateTasksFromPlan(planInfo, scope);
  
  // Replace task placeholders
  tasks = replaceTaskPlaceholders(tasks, generatedTasks);
  
  return tasks;
}

// Helper functions

function extractKeyConcepts(description: string): string[] {
  // Simple keyword extraction
  const words = description.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
  
  return words
    .filter(word => !stopWords.has(word) && word.length > 3)
    .slice(0, 10);
}

function generateFunctionalRequirements(
  description: string,
  _concepts: string[]
): string[] {
  const requirements: string[] = [];
  
  // Generate basic requirements based on common patterns
  if (description.includes('user') || description.includes('account')) {
    requirements.push('System MUST allow users to create accounts');
    requirements.push('System MUST validate user input');
  }
  
  if (description.includes('save') || description.includes('store')) {
    requirements.push('System MUST persist data reliably');
  }
  
  if (description.includes('search') || description.includes('find')) {
    requirements.push('System MUST provide search functionality');
  }
  
  // Add clarification markers for ambiguous requirements
  requirements.push('System MUST [NEEDS CLARIFICATION: specific requirement based on description]');
  
  return requirements;
}

function generateUserScenarios(
  description: string,
  _concepts: string[]
): { primaryStory: string; acceptanceScenarios: string[] } {
  const primaryStory = `As a user, I want to ${description.toLowerCase()} so that I can achieve my goals efficiently.`;
  
  const acceptanceScenarios = [
    'Given the system is ready, When a user performs the primary action, Then the expected outcome occurs',
    'Given an error condition, When the user attempts the action, Then appropriate error handling occurs',
  ];
  
  return { primaryStory, acceptanceScenarios };
}

async function generateFeatureBranch(projectName: string): Promise<string> {
  const sanitized = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `001-${sanitized}`;
}

function replaceRequirements(spec: string, requirements: string[]): string {
  const requirementSection = requirements
    .map((req, index) => `- **FR-${String(index + 1).padStart(3, '0')}**: ${req}`)
    .join('\n');
  
  // Find and replace the requirements section
  const pattern = /- \*\*FR-001\*\*: System MUST.*?(?=\n\n|\*Example of marking)/s;
  return spec.replace(pattern, requirementSection + '\n');
}

function replaceAcceptanceScenarios(spec: string, scenarios: string[]): string {
  const scenarioSection = scenarios
    .map((scenario, index) => `${index + 1}. **${scenario}`)
    .join('\n');
  
  const pattern = /1\. \*\*Given\*\* \[initial state\].*?2\. \*\*Given\*\* \[initial state\].*?\n/s;
  return spec.replace(pattern, scenarioSection + '\n');
}

function markAmbiguities(spec: string, description: string): string {
  // Mark common ambiguities
  if (!description.includes('authentication') && description.includes('user')) {
    spec = spec.replace(
      'authenticate users',
      'authenticate users via [NEEDS CLARIFICATION: auth method not specified]'
    );
  }
  
  return spec;
}

function parseTechnicalContext(constraints: string): Record<string, string> {
  const context: Record<string, string> = {
    'Language/Version': 'NEEDS CLARIFICATION',
    'Primary Dependencies': 'NEEDS CLARIFICATION',
    'Storage': 'NEEDS CLARIFICATION',
    'Testing': 'NEEDS CLARIFICATION',
    'Target Platform': 'NEEDS CLARIFICATION',
  };
  
  // Parse constraints for technical details
  const lower = constraints.toLowerCase();
  
  if (lower.includes('typescript') || lower.includes('javascript')) {
    context['Language/Version'] = 'TypeScript 5.x';
    context['Testing'] = 'Vitest';
  }
  
  if (lower.includes('python')) {
    context['Language/Version'] = 'Python 3.11+';
    context['Testing'] = 'pytest';
  }
  
  if (lower.includes('postgres')) {
    context['Storage'] = 'PostgreSQL';
  }
  
  if (lower.includes('react')) {
    context['Primary Dependencies'] = 'React 18+';
    context['Target Platform'] = 'Web Browser';
  }
  
  return context;
}

function fillTechnicalContext(plan: string, context: Record<string, string>): string {
  for (const [key, value] of Object.entries(context)) {
    const pattern = new RegExp(`\\*\\*${key}\\*\\*: \\[.*?\\]`, 'g');
    plan = plan.replace(pattern, `**${key}**: ${value}`);
  }
  
  return plan;
}

function generateResearchDocument(techContext: Record<string, string>): string {
  const needsClarification = Object.entries(techContext)
    .filter(([_, value]) => value.includes('NEEDS CLARIFICATION'))
    .map(([key, _]) => key);
  
  return `# Research Document

## Technical Decisions

${needsClarification.map(item => `### ${item}
- **Decision**: [To be determined]
- **Rationale**: [Research needed]
- **Alternatives considered**: [To be researched]
`).join('\n')}

## Best Practices Research

### Framework Patterns
- [To be researched based on chosen tech stack]

### Performance Considerations
- [To be researched based on requirements]

### Security Considerations
- [To be researched based on platform]
`;
}

async function generateDataModel(specPath: string): Promise<string> {
  try {
    const specContent = await fs.readFile(specPath, 'utf-8');
    
    // Extract entities from spec
    const entityMatch = specContent.match(/### Key Entities.*?\n(.*?)(?=\n---|\n##)/s);
    const entities = entityMatch ? entityMatch[1] : '';
    
    return `# Data Model

## Entities

${entities || '- [No entities identified in specification]'}

## Relationships

[To be determined based on entities]

## Validation Rules

[To be extracted from functional requirements]

## State Transitions

[If applicable]
`;
  } catch {
    return `# Data Model

## Entities

[To be extracted from specification]

## Relationships

[To be determined]

## Validation Rules

[To be determined]
`;
  }
}

async function extractFeatureNameFromSpec(specPath: string): Promise<string> {
  try {
    const specContent = await fs.readFile(specPath, 'utf-8');
    const match = specContent.match(/# Feature Specification: (.+)/);
    return match ? match[1] : 'Unknown Feature';
  } catch {
    return 'Unknown Feature';
  }
}

function extractPlanInfo(planContent: string): any {
  const featureMatch = planContent.match(/# Implementation Plan: (.+)/);
  const techMatch = planContent.match(/\*\*Language\/Version\*\*: (.+)/);
  
  return {
    featureName: featureMatch ? featureMatch[1] : 'Unknown Feature',
    language: techMatch ? techMatch[1] : 'Unknown',
    // Extract more as needed
  };
}

function generateTasksFromPlan(planInfo: any, _scope?: string): any {
  // Generate tasks based on plan information
  const tasks = {
    setup: [
      'Create project structure per implementation plan',
      `Initialize ${planInfo.language} project with dependencies`,
      'Configure linting and formatting tools',
    ],
    tests: [
      'Write contract tests for API endpoints',
      'Write integration tests for user stories',
    ],
    implementation: [
      'Implement data models',
      'Implement service layer',
      'Implement API endpoints',
    ],
    polish: [
      'Add unit tests',
      'Performance optimization',
      'Update documentation',
    ],
  };
  
  return tasks;
}

function replaceTaskPlaceholders(template: string, _tasks: any): string {
  // This would be more sophisticated in a real implementation
  // For now, just return the template as-is since it has example tasks
  return template;
}