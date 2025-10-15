/**
 * Spec Kit markdown parser
 * 
 * Parses Spec Kit markdown documents into structured data
 */

import * as fs from 'fs/promises';

export interface SpecDocument {
  title: string;
  branch: string;
  created: string;
  status: string;
  userDescription: string;
  userScenarios: {
    primaryStory: string;
    acceptanceScenarios: string[];
    edgeCases: string[];
  };
  requirements: {
    functional: FunctionalRequirement[];
    entities: Entity[];
  };
  needsClarification: string[];
  checklistStatus: Record<string, boolean>;
}

export interface FunctionalRequirement {
  id: string;
  description: string;
  needsClarification?: string;
}

export interface Entity {
  name: string;
  description: string;
  attributes?: string[];
  relationships?: string[];
}

export interface PlanDocument {
  title: string;
  branch: string;
  date: string;
  specLink: string;
  summary: string;
  technicalContext: Record<string, string>;
  projectStructure: string;
  phases: PlanPhase[];
  complexityTracking: ComplexityItem[];
  progressTracking: ProgressItem[];
}

export interface PlanPhase {
  number: string;
  name: string;
  description: string;
  output?: string[];
}

export interface ComplexityItem {
  violation: string;
  whyNeeded: string;
  alternativeRejected: string;
}

export interface ProgressItem {
  phase: string;
  status: 'pending' | 'complete' | 'in-progress';
}

export interface TaskDocument {
  title: string;
  featureName: string;
  tasks: Task[];
  dependencies: string[];
  parallelGroups: string[][];
}

export interface Task {
  id: string;
  description: string;
  parallel: boolean;
  filePath?: string;
  phase: string;
  status: 'pending' | 'in-progress' | 'complete';
  dependencies?: string[];
}

/**
 * Parse a Spec Kit spec.md document
 */
export async function parseSpec(filePath: string): Promise<SpecDocument> {
  const content = await fs.readFile(filePath, 'utf-8');
  
  const spec: SpecDocument = {
    title: extractTitle(content),
    branch: extractBranch(content),
    created: extractDate(content, 'Created'),
    status: extractStatus(content),
    userDescription: extractUserDescription(content),
    userScenarios: extractUserScenarios(content),
    requirements: extractRequirements(content),
    needsClarification: extractNeedsClarification(content),
    checklistStatus: extractChecklistStatus(content),
  };
  
  return spec;
}

/**
 * Parse a Spec Kit plan.md document
 */
export async function parsePlan(filePath: string): Promise<PlanDocument> {
  const content = await fs.readFile(filePath, 'utf-8');
  
  const plan: PlanDocument = {
    title: extractTitle(content),
    branch: extractBranch(content),
    date: extractDate(content, 'Date'),
    specLink: extractSpecLink(content),
    summary: extractSummary(content),
    technicalContext: extractTechnicalContext(content),
    projectStructure: extractProjectStructure(content),
    phases: extractPhases(content),
    complexityTracking: extractComplexityTracking(content),
    progressTracking: extractProgressTracking(content),
  };
  
  return plan;
}

/**
 * Parse a Spec Kit tasks.md document
 */
export async function parseTasks(filePath: string): Promise<TaskDocument> {
  const content = await fs.readFile(filePath, 'utf-8');
  
  const taskDoc: TaskDocument = {
    title: extractTitle(content),
    featureName: extractFeatureName(content),
    tasks: extractTasks(content),
    dependencies: extractDependencies(content),
    parallelGroups: extractParallelGroups(content),
  };
  
  return taskDoc;
}

/**
 * Section manipulation helpers for spec refinement
 */

export interface SectionBoundary {
  name: string;
  level: number;
  startLine: number;
  endLine: number;
  content: string;
}

/**
 * Parse markdown document into sections
 */
export function parseSpecSections(content: string): SectionBoundary[] {
  const lines = content.split('\n');
  const sections: SectionBoundary[] = [];
  let currentSection: Partial<SectionBoundary> | null = null;

  lines.forEach((line, index) => {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)/);

    if (headerMatch) {
      // Found a new section header
      if (currentSection) {
        // Close previous section
        currentSection.endLine = index - 1;
        currentSection.content = lines
          .slice(currentSection.startLine!, currentSection.endLine + 1)
          .join('\n');
        sections.push(currentSection as SectionBoundary);
      }

      // Start new section
      currentSection = {
        name: headerMatch[2].trim(),
        level: headerMatch[1].length,
        startLine: index,
      };
    }
  });

  // Close last section
  if (currentSection) {
    currentSection.endLine = lines.length - 1;
    currentSection.content = lines
      .slice(currentSection.startLine!, currentSection.endLine! + 1)
      .join('\n');
    sections.push(currentSection as SectionBoundary);
  }

  return sections;
}

/**
 * Get content of a specific section by name
 */
export function getSectionContent(content: string, sectionName: string): string | null {
  const sections = parseSpecSections(content);
  const section = sections.find(
    s => s.name.toLowerCase() === sectionName.toLowerCase()
  );
  return section ? section.content : null;
}

/**
 * Replace content of a specific section
 */
export function setSectionContent(
  content: string,
  sectionName: string,
  newContent: string
): string {
  const sections = parseSpecSections(content);
  const sectionIndex = sections.findIndex(
    s => s.name.toLowerCase() === sectionName.toLowerCase()
  );

  if (sectionIndex === -1) {
    throw new Error(`Section "${sectionName}" not found in document`);
  }

  const section = sections[sectionIndex];
  const lines = content.split('\n');

  // Replace section content while preserving header
  const headerLine = lines[section.startLine];
  const newSectionContent = `${headerLine}\n\n${newContent}`;

  // Rebuild document
  const beforeSection = lines.slice(0, section.startLine).join('\n');
  const afterSection = lines.slice(section.endLine + 1).join('\n');

  return [beforeSection, newSectionContent, afterSection]
    .filter(part => part.length > 0)
    .join('\n\n');
}

// Helper functions for parsing

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+?)(?:\n|$)/m);
  return match ? match[1].replace(/^(Feature Specification|Implementation Plan|Tasks):\s*/, '') : 'Untitled';
}

function extractBranch(content: string): string {
  const match = content.match(/\*\*(?:Feature )?Branch\*\*:\s*`([^`]+)`/);
  return match ? match[1] : '';
}

function extractDate(content: string, field: string): string {
  const match = content.match(new RegExp(`\\*\\*${field}\\*\\*:\\s*([^\\n\\|]+)`));
  return match ? match[1].trim() : '';
}

function extractStatus(content: string): string {
  const match = content.match(/\*\*Status\*\*:\s*(\w+)/);
  return match ? match[1] : 'Draft';
}

function extractUserDescription(content: string): string {
  const match = content.match(/\*\*Input\*\*:\s*User description:\s*"([^"]+)"/);
  return match ? match[1] : '';
}

function extractUserScenarios(content: string): SpecDocument['userScenarios'] {
  const scenarios: SpecDocument['userScenarios'] = {
    primaryStory: '',
    acceptanceScenarios: [],
    edgeCases: [],
  };
  
  // Extract primary user story
  const storyMatch = content.match(/### Primary User Story\n([^\n]+)/);
  if (storyMatch) {
    scenarios.primaryStory = storyMatch[1];
  }
  
  // Extract acceptance scenarios
  const acceptanceMatch = content.match(/### Acceptance Scenarios\n((?:[^\n]+\n)+?)(?=###|##|$)/);
  if (acceptanceMatch) {
    scenarios.acceptanceScenarios = acceptanceMatch[1]
      .split('\n')
      .filter(line => line.trim().match(/^\d+\.|^-/))
      .map(line => line.replace(/^\d+\.\s*|-\s*/, '').trim());
  }
  
  // Extract edge cases
  const edgeMatch = content.match(/### Edge Cases\n((?:[^\n]+\n)+?)(?=###|##|$)/);
  if (edgeMatch) {
    scenarios.edgeCases = edgeMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim());
  }
  
  return scenarios;
}

function extractRequirements(content: string): SpecDocument['requirements'] {
  const requirements: SpecDocument['requirements'] = {
    functional: [],
    entities: [],
  };
  
  // Extract functional requirements
  const reqMatch = content.match(/### Functional Requirements\n((?:[^\n]+\n)+?)(?=###|##|$)/);
  if (reqMatch) {
    const reqLines = reqMatch[1].split('\n').filter(line => line.includes('**FR-'));
    
    for (const line of reqLines) {
      const match = line.match(/\*\*([^*]+)\*\*:\s*(.+)/);
      if (match) {
        const [, id, desc] = match;
        const clarificationMatch = desc.match(/\[NEEDS CLARIFICATION:\s*([^\]]+)\]/);
        
        requirements.functional.push({
          id,
          description: desc.replace(/\[NEEDS CLARIFICATION:[^\]]+\]/, '').trim(),
          needsClarification: clarificationMatch ? clarificationMatch[1] : undefined,
        });
      }
    }
  }
  
  // Extract entities
  const entityMatch = content.match(/### Key Entities[^#]+((?:[^\n]+\n)+?)(?=###|##|---|\n\n|$)/);
  if (entityMatch) {
    const entityLines = entityMatch[1].split('\n').filter(line => line.includes('**'));
    
    for (const line of entityLines) {
      const match = line.match(/\*\*([^*]+)\*\*:\s*(.+)/);
      if (match) {
        requirements.entities.push({
          name: match[1],
          description: match[2],
        });
      }
    }
  }
  
  return requirements;
}

function extractNeedsClarification(content: string): string[] {
  const matches = content.matchAll(/\[NEEDS CLARIFICATION:\s*([^\]]+)\]/g);
  const clarifications = new Set<string>();
  
  for (const match of matches) {
    clarifications.add(match[1]);
  }
  
  return Array.from(clarifications);
}

function extractChecklistStatus(content: string): Record<string, boolean> {
  const checklist: Record<string, boolean> = {};
  const checklistMatch = content.match(/## Review & Acceptance Checklist[^#]+((?:[^\n]+\n)+?)(?=##|$)/);
  
  if (checklistMatch) {
    const lines = checklistMatch[1].split('\n');
    
    for (const line of lines) {
      const match = line.match(/- \[([ x])\]\s*(.+)/);
      if (match) {
        checklist[match[2]] = match[1] === 'x';
      }
    }
  }
  
  return checklist;
}

function extractSpecLink(content: string): string {
  const match = content.match(/\*\*Spec\*\*:\s*\[([^\]]+)\]/);
  return match ? match[1] : '';
}

function extractSummary(content: string): string {
  const match = content.match(/## Summary\n([^\n]+)/);
  return match ? match[1] : '';
}

function extractTechnicalContext(content: string): Record<string, string> {
  const context: Record<string, string> = {};
  const contextMatch = content.match(/## Technical Context\n((?:[^\n]+\n)+?)(?=##|$)/);
  
  if (contextMatch) {
    const lines = contextMatch[1].split('\n');
    
    for (const line of lines) {
      const match = line.match(/\*\*([^*]+)\*\*:\s*(.+)/);
      if (match) {
        context[match[1]] = match[2];
      }
    }
  }
  
  return context;
}

function extractProjectStructure(content: string): string {
  const match = content.match(/### Source Code \(repository root\)\n```\n((?:[^`]+)+?)```/);
  return match ? match[1] : '';
}

function extractPhases(content: string): PlanPhase[] {
  const phases: PlanPhase[] = [];
  const phaseMatches = content.matchAll(/## Phase (\d+(?:\.\d+)?): (.+)\n((?:[^\n]+\n)+?)(?=##|$)/g);
  
  for (const match of phaseMatches) {
    phases.push({
      number: match[1],
      name: match[2],
      description: match[3].trim(),
    });
  }
  
  return phases;
}

function extractComplexityTracking(content: string): ComplexityItem[] {
  const items: ComplexityItem[] = [];
  const tableMatch = content.match(/## Complexity Tracking[^|]+((?:\|[^\n]+\n)+)/);
  
  if (tableMatch) {
    const rows = tableMatch[1].split('\n').filter(line => line.includes('|') && !line.includes('---'));
    
    for (const row of rows.slice(1)) { // Skip header
      const cells = row.split('|').map(cell => cell.trim()).filter(Boolean);
      if (cells.length >= 3) {
        items.push({
          violation: cells[0],
          whyNeeded: cells[1],
          alternativeRejected: cells[2],
        });
      }
    }
  }
  
  return items;
}

function extractProgressTracking(content: string): ProgressItem[] {
  const items: ProgressItem[] = [];
  const progressMatch = content.match(/## Progress Tracking[^#]+((?:[^\n]+\n)+?)(?=##|---|\n\n|$)/);
  
  if (progressMatch) {
    const lines = progressMatch[1].split('\n');
    
    for (const line of lines) {
      const match = line.match(/- \[([ x])\]\s*Phase (\d+(?:\.\d+)?): (.+)/);
      if (match) {
        items.push({
          phase: `Phase ${match[2]}: ${match[3]}`,
          status: match[1] === 'x' ? 'complete' : 'pending',
        });
      }
    }
  }
  
  return items;
}

function extractFeatureName(content: string): string {
  const match = content.match(/# Tasks:\s*(.+)/);
  return match ? match[1] : 'Unknown Feature';
}

function extractTasks(content: string): Task[] {
  const tasks: Task[] = [];
  const taskMatches = content.matchAll(/- \[([ x])\]\s*(T\d+)\s*(\[P\])?\s*(.+)/g);
  
  for (const match of taskMatches) {
    const [, status, id, parallel, description] = match;
    
    // Extract file path if present
    const fileMatch = description.match(/in\s+([^\s]+\.(ts|js|py|md|json|yaml|yml))/);
    
    // Determine phase from task ID
    let phase = 'unknown';
    const taskNum = parseInt(id.substring(1), 10);
    if (taskNum <= 3) {phase = 'setup';}
    else if (taskNum <= 7) {phase = 'tests';}
    else if (taskNum <= 14) {phase = 'implementation';}
    else if (taskNum <= 18) {phase = 'integration';}
    else {phase = 'polish';}
    
    tasks.push({
      id,
      description,
      parallel: !!parallel,
      filePath: fileMatch ? fileMatch[1] : undefined,
      phase,
      status: status === 'x' ? 'complete' : 'pending',
    });
  }
  
  return tasks;
}

function extractDependencies(content: string): string[] {
  const deps: string[] = [];
  const depMatch = content.match(/## Dependencies\n((?:[^\n]+\n)+?)(?=##|$)/);
  
  if (depMatch) {
    const lines = depMatch[1].split('\n').filter(line => line.trim().startsWith('-'));
    deps.push(...lines.map(line => line.replace(/^-\s*/, '').trim()));
  }
  
  return deps;
}

function extractParallelGroups(content: string): string[][] {
  const groups: string[][] = [];
  const parallelMatch = content.match(/## Parallel Example\n```\n((?:[^`]+)+?)```/);
  
  if (parallelMatch) {
    const taskLines = parallelMatch[1]
      .split('\n')
      .filter(line => line.includes('Task:'))
      .map(line => line.replace(/Task:\s*"(.+)"/, '$1'));
    
    if (taskLines.length > 0) {
      groups.push(taskLines);
    }
  }
  
  return groups;
}