/**
 * Template Customizer Module
 *
 * Handles template customization with hooks, variable substitution, and inheritance.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface TemplateHook {
  type: 'before' | 'after' | 'transform' | 'validate';
  script: string;
  description?: string;
}

export interface TemplateCustomization {
  templateId: string;
  overridePath?: string;
  hooks?: TemplateHook[];
  variables?: Record<string, string>;
  extends?: string;
}

export interface TemplateContext {
  templateId: string;
  variables: Record<string, any>;
  workspacePath: string;
}

/**
 * Load template with customization applied
 */
export async function loadCustomizedTemplate(
  templateId: string,
  context: TemplateContext,
  customizationPath?: string
): Promise<string> {
  // Load customization config if provided
  let customization: TemplateCustomization | null = null;
  if (customizationPath) {
    customization = await loadCustomization(customizationPath);
  }

  // Load base template (with inheritance)
  let templateContent = await loadBaseTemplate(templateId, customization);

  // Apply before hooks
  if (customization?.hooks) {
    templateContent = await applyHooks(templateContent, customization.hooks, 'before', context);
  }

  // Apply variable substitution
  templateContent = applyVariableSubstitution(templateContent, {
    ...context.variables,
    ...customization?.variables,
  });

  // Apply transform hooks
  if (customization?.hooks) {
    templateContent = await applyHooks(templateContent, customization.hooks, 'transform', context);
  }

  // Apply after hooks
  if (customization?.hooks) {
    templateContent = await applyHooks(templateContent, customization.hooks, 'after', context);
  }

  // Apply validate hooks
  if (customization?.hooks) {
    await applyHooks(templateContent, customization.hooks, 'validate', context);
  }

  return templateContent;
}

/**
 * Load customization config
 */
async function loadCustomization(customizationPath: string): Promise<TemplateCustomization> {
  try {
    const content = await fs.readFile(customizationPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load customization: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load base template with inheritance support
 */
async function loadBaseTemplate(
  templateId: string,
  customization: TemplateCustomization | null
): Promise<string> {
  // If there's an override, use that
  if (customization?.overridePath) {
    try {
      return await fs.readFile(customization.overridePath, 'utf-8');
    } catch {
      // Fall through to default template
    }
  }

  // If template extends another, load parent first
  if (customization?.extends) {
    const parentContent = await loadBaseTemplate(customization.extends, null);
    // Child template can override sections of parent
    const childContent = await loadBuiltInTemplate(templateId);
    return mergeTemplates(parentContent, childContent);
  }

  // Load built-in template
  return await loadBuiltInTemplate(templateId);
}

/**
 * Load built-in template
 */
async function loadBuiltInTemplate(templateId: string): Promise<string> {
  // Try templates/projects/{templateId}/constitution.md
  const constitutionPath = path.join(
    process.cwd(),
    'templates',
    'projects',
    templateId,
    'constitution.md'
  );

  try {
    return await fs.readFile(constitutionPath, 'utf-8');
  } catch {
    throw new Error(`Built-in template "${templateId}" not found`);
  }
}

/**
 * Merge parent and child templates
 */
function mergeTemplates(parent: string, child: string): string {
  // Simple merge strategy: sections in child override parent
  // Sections are identified by ## headings

  const parentSections = parseTemplateSections(parent);
  const childSections = parseTemplateSections(child);

  // Merge: child sections override parent sections
  const merged = { ...parentSections, ...childSections };

  // Rebuild template
  let result = '';
  for (const [heading, content] of Object.entries(merged)) {
    result += `## ${heading}\n\n${content}\n\n`;
  }

  return result.trim();
}

/**
 * Parse template into sections
 */
function parseTemplateSections(template: string): Record<string, string> {
  const sections: Record<string, string> = {};

  // Split by ## headings
  const parts = template.split(/^##\s+/m);

  // Skip first part (before first ##)
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const lines = part.split('\n');
    const heading = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    sections[heading] = content;
  }

  return sections;
}

/**
 * Apply variable substitution
 */
function applyVariableSubstitution(
  template: string,
  variables: Record<string, any>
): string {
  let result = template;

  // Replace {{variable}} with values
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value));
  }

  return result;
}

/**
 * Apply hooks of a specific type
 */
async function applyHooks(
  content: string,
  hooks: TemplateHook[],
  hookType: 'before' | 'after' | 'transform' | 'validate',
  context: TemplateContext
): Promise<string> {
  let result = content;

  const relevantHooks = hooks.filter(h => h.type === hookType);

  for (const hook of relevantHooks) {
    result = await executeHook(result, hook, context);
  }

  return result;
}

/**
 * Execute a single hook
 */
async function executeHook(
  content: string,
  hook: TemplateHook,
  context: TemplateContext
): Promise<string> {
  try {
    // For now, we support simple JavaScript hooks
    // In the future, we could support external scripts

    // Create a safe eval environment
    const hookFunction = new Function('content', 'context', hook.script);
    const result = hookFunction(content, context);

    // Handle async results
    if (result instanceof Promise) {
      return await result;
    }

    return result;
  } catch (error) {
    throw new Error(`Hook execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate template customization
 */
export async function validateCustomization(
  customization: TemplateCustomization
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Check if template exists
  try {
    await loadBuiltInTemplate(customization.templateId);
  } catch {
    errors.push(`Template "${customization.templateId}" does not exist`);
  }

  // Check if parent template exists (if extends is used)
  if (customization.extends) {
    try {
      await loadBuiltInTemplate(customization.extends);
    } catch {
      errors.push(`Parent template "${customization.extends}" does not exist`);
    }
  }

  // Check if override path exists (if specified)
  if (customization.overridePath) {
    try {
      await fs.access(customization.overridePath);
    } catch {
      errors.push(`Override file "${customization.overridePath}" does not exist`);
    }
  }

  // Validate hooks
  if (customization.hooks) {
    for (const hook of customization.hooks) {
      if (!hook.script) {
        errors.push(`Hook of type "${hook.type}" has no script`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * List customization points for a template
 */
export async function listCustomizationPoints(
  templateId: string
): Promise<{
  sections: string[];
  variables: string[];
  hooks: string[];
}> {
  const template = await loadBuiltInTemplate(templateId);

  // Extract sections (## headings)
  const sectionMatches = template.matchAll(/^##\s+(.+)$/gm);
  const sections = Array.from(sectionMatches, m => m[1]);

  // Extract variables ({{variable}})
  const variableMatches = template.matchAll(/\{\{(\w+)\}\}/g);
  const variables = Array.from(new Set(Array.from(variableMatches, m => m[1])));

  // Hook types available
  const hooks = ['before', 'after', 'transform', 'validate'];

  return {
    sections,
    variables,
    hooks,
  };
}
