import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { resolveWorkspacePath } from './workspace.js';

/**
 * Template Management Tools
 *
 * Provides template discovery, customization, and override capabilities.
 */

// Hook types for template customization
export type TemplateHookType = 'before' | 'after' | 'transform' | 'validate';

export interface TemplateHook {
  type: TemplateHookType;
  script: string;
  description?: string;
}

export interface TemplateCustomization {
  templateId: string;
  overridePath?: string;
  hooks?: TemplateHook[];
  variables?: Record<string, string>;
  extends?: string; // Parent template ID for inheritance
}

// Schema for templates_list tool
export const TemplatesListSchema = z.object({
  workspacePath: z.string().optional().describe('Workspace directory path'),
  includeCustom: z.boolean().default(true).describe('Include custom templates'),
  category: z.enum(['project', 'spec', 'plan', 'task', 'all']).default('all').describe('Filter by template category'),
});

// Schema for templates_customize tool
export const TemplatesCustomizeSchema = z.object({
  templateId: z.string().describe('ID of the template to customize (e.g., "web-app", "api-service")'),
  customizationPath: z.string().describe('Path to save customization config (relative to workspace)'),
  overridePath: z.string().optional().describe('Path to custom template file (overrides built-in template)'),
  hooks: z.array(z.object({
    type: z.enum(['before', 'after', 'transform', 'validate']).describe('Hook type'),
    script: z.string().describe('Hook script or function'),
    description: z.string().optional().describe('Hook description')
  })).optional().describe('Template hooks for customization'),
  variables: z.record(z.string()).optional().describe('Variable substitutions'),
  extends: z.string().optional().describe('Parent template ID for inheritance'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

/**
 * List all available templates (built-in and custom)
 */
export async function templatesList(params: z.infer<typeof TemplatesListSchema>) {
  const { workspacePath, includeCustom, category } = params;

  const resolvedPath = resolveWorkspacePath(workspacePath);

  try {
    const templates: any[] = [];

    // Discover built-in templates
    const builtInTemplates = await discoverBuiltInTemplates(category);
    templates.push(...builtInTemplates);

    // Discover custom templates if requested
    if (includeCustom) {
      const customTemplates = await discoverCustomTemplates(resolvedPath, category);
      templates.push(...customTemplates);
    }

    return {
      success: true,
      count: templates.length,
      templates,
      message: `Found ${templates.length} template(s)`,
    };
  } catch (error) {
    throw new Error(`Failed to list templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create or update template customization
 */
export async function templatesCustomize(params: z.infer<typeof TemplatesCustomizeSchema>) {
  const { templateId, customizationPath, overridePath, hooks, variables, extends: extendsTemplate, workspacePath } = params;

  const resolvedPath = resolveWorkspacePath(workspacePath);

  try {
    // Verify that the base template exists
    const templateExists = await verifyTemplateExists(templateId);
    if (!templateExists) {
      throw new Error(`Template "${templateId}" not found`);
    }

    // If extends is specified, verify parent template exists
    if (extendsTemplate) {
      const parentExists = await verifyTemplateExists(extendsTemplate);
      if (!parentExists) {
        throw new Error(`Parent template "${extendsTemplate}" not found`);
      }
    }

    // Build customization config
    const customization: TemplateCustomization = {
      templateId,
      overridePath,
      hooks,
      variables,
      extends: extendsTemplate,
    };

    // Resolve customization path
    const fullCustomizationPath = path.resolve(resolvedPath, customizationPath);

    // Ensure parent directory exists
    const customizationDir = path.dirname(fullCustomizationPath);
    await fs.mkdir(customizationDir, { recursive: true });

    // Write customization config
    await fs.writeFile(
      fullCustomizationPath,
      JSON.stringify(customization, null, 2),
      'utf-8'
    );

    // If override path is specified, verify it exists or create placeholder
    if (overridePath) {
      const fullOverridePath = path.resolve(resolvedPath, overridePath);
      const overrideExists = await fs.access(fullOverridePath).then(() => true).catch(() => false);

      if (!overrideExists) {
        // Create placeholder override file
        const placeholderContent = await generateOverridePlaceholder(templateId);
        await fs.mkdir(path.dirname(fullOverridePath), { recursive: true });
        await fs.writeFile(fullOverridePath, placeholderContent, 'utf-8');
      }
    }

    return {
      success: true,
      templateId,
      customizationPath: fullCustomizationPath,
      message: `Customization created for template "${templateId}"`,
      details: {
        hasOverride: !!overridePath,
        hooksCount: hooks?.length || 0,
        variablesCount: Object.keys(variables || {}).length,
        extendsTemplate: extendsTemplate || null,
      },
    };
  } catch (error) {
    throw new Error(`Failed to customize template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Discover built-in templates
 */
async function discoverBuiltInTemplates(category: string): Promise<any[]> {
  const templates: any[] = [];

  // Get the templates directory (relative to this file)
  const templatesDir = path.join(process.cwd(), 'templates', 'projects');

  try {
    const entries = await fs.readdir(templatesDir);

    for (const entry of entries) {
      if (entry === 'README.md') {
        continue; // Skip README
      }

      const entryPath = path.join(templatesDir, entry);
      const stat = await fs.stat(entryPath);

      if (stat.isDirectory()) {
        // Check if it has a constitution.md or README.md
        const constitutionPath = path.join(entryPath, 'constitution.md');
        const readmePath = path.join(entryPath, 'README.md');

        const hasConstitution = await fs.access(constitutionPath).then(() => true).catch(() => false);
        const hasReadme = await fs.access(readmePath).then(() => true).catch(() => false);

        if (hasConstitution || hasReadme) {
          // Read README to get description
          let description = 'No description available';
          if (hasReadme) {
            const readmeContent = await fs.readFile(readmePath, 'utf-8');
            // Extract first paragraph or heading
            const match = readmeContent.match(/^#\s+(.+)$/m);
            if (match) {
              description = match[1];
            }
          }

          templates.push({
            id: entry,
            name: formatTemplateName(entry),
            category: 'project',
            type: 'built-in',
            path: entryPath,
            description,
            files: {
              constitution: hasConstitution ? constitutionPath : null,
              readme: hasReadme ? readmePath : null,
            },
          });
        }
      }
    }
  } catch {
    // Templates directory might not exist, which is fine
  }

  // Filter by category if not 'all'
  if (category !== 'all') {
    return templates.filter(t => t.category === category);
  }

  return templates;
}

/**
 * Discover custom templates in workspace
 */
async function discoverCustomTemplates(workspacePath: string, category: string): Promise<any[]> {
  const templates: any[] = [];

  // Look for custom templates in .dincoder/templates/
  const customTemplatesDir = path.join(workspacePath, '.dincoder', 'templates');

  try {
    const entries = await fs.readdir(customTemplatesDir);

    for (const entry of entries) {
      const entryPath = path.join(customTemplatesDir, entry);
      const stat = await fs.stat(entryPath);

      if (stat.isDirectory()) {
        // Check for template.json or customization.json
        const templateConfigPath = path.join(entryPath, 'template.json');
        const customizationPath = path.join(entryPath, 'customization.json');

        const hasConfig = await fs.access(templateConfigPath).then(() => true).catch(() => false);
        const hasCustomization = await fs.access(customizationPath).then(() => true).catch(() => false);

        if (hasConfig || hasCustomization) {
          let templateData: any = { id: entry, name: formatTemplateName(entry) };

          if (hasConfig) {
            const configContent = await fs.readFile(templateConfigPath, 'utf-8');
            templateData = { ...templateData, ...JSON.parse(configContent) };
          }

          if (hasCustomization) {
            const customizationContent = await fs.readFile(customizationPath, 'utf-8');
            const customization = JSON.parse(customizationContent);
            templateData.customization = customization;
          }

          templates.push({
            ...templateData,
            type: 'custom',
            path: entryPath,
          });
        }
      }
    }
  } catch {
    // Custom templates directory might not exist, which is fine
  }

  // Filter by category if not 'all'
  if (category !== 'all') {
    return templates.filter(t => t.category === category);
  }

  return templates;
}

/**
 * Verify that a template exists
 */
async function verifyTemplateExists(templateId: string): Promise<boolean> {
  // Check built-in templates
  const builtInPath = path.join(process.cwd(), 'templates', 'projects', templateId);

  try {
    await fs.access(builtInPath);
    return true;
  } catch {
    // Not a built-in template, might be custom
    return false;
  }
}

/**
 * Generate override placeholder content
 */
async function generateOverridePlaceholder(templateId: string): Promise<string> {
  return `# ${formatTemplateName(templateId)} Template Override

**Template ID:** ${templateId}
**Created:** ${new Date().toISOString()}

---

## Instructions

This is a custom override for the "${templateId}" template.

You can customize this template by editing the content below. The override will be used
instead of the built-in template when generating artifacts.

### Available Variables

Variables can be used in the template using {{variable_name}} syntax:

- \`{{projectName}}\` - The project name
- \`{{timestamp}}\` - Current timestamp
- \`{{principles}}\` - Project principles (for constitution templates)
- \`{{constraints}}\` - Technical constraints (for constitution templates)

### Template Hooks

You can define hooks in the customization.json file:
- \`before\` - Runs before template generation
- \`after\` - Runs after template generation
- \`transform\` - Transforms the generated content
- \`validate\` - Validates the generated content

---

## Template Content

Start customizing your template below:

`;
}

/**
 * Format template name for display
 */
function formatTemplateName(id: string): string {
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
