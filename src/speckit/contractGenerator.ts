/**
 * Contract Generation Module
 *
 * Advanced contract extraction and generation using tsoa and other tools.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ContractOptions {
  format: 'openapi' | 'graphql' | 'json-schema';
  includeExamples: boolean;
  specVersion?: string;
  baseUrl?: string;
}

export interface GeneratedContract {
  content: string;
  endpoints: number;
  models: number;
  format: string;
}

/**
 * Generate contract using tsoa for TypeScript projects
 */
export async function generateWithTsoa(
  projectRoot: string,
  outputPath: string
): Promise<GeneratedContract> {
  try {
    // Check if tsoa.json exists
    const tsoaConfigPath = path.join(projectRoot, 'tsoa.json');
    const tsoaExists = await fs.access(tsoaConfigPath).then(() => true).catch(() => false);

    if (!tsoaExists) {
      throw new Error('tsoa.json configuration not found. Run tsoa initialization first.');
    }

    // Run tsoa spec generation
    await execAsync('npx tsoa spec', {
      cwd: projectRoot,
    });

    // Read generated spec
    const specPath = path.join(projectRoot, 'contracts', 'swagger.json');
    const specContent = await fs.readFile(specPath, 'utf-8');
    const spec = JSON.parse(specContent);

    // Count endpoints and models
    const endpoints = Object.keys(spec.paths || {}).reduce((count, path) => {
      return count + Object.keys(spec.paths[path]).length;
    }, 0);

    const models = Object.keys(spec.components?.schemas || {}).length;

    // Convert to YAML if needed
    let content = specContent;
    const isYaml = outputPath.endsWith('.yaml') || outputPath.endsWith('.yml');

    if (isYaml) {
      // For now, use JSON. We can add yaml library later
      content = JSON.stringify(spec, null, 2);
    }

    return {
      content,
      endpoints,
      models,
      format: 'openapi',
    };
  } catch (error) {
    throw new Error(`tsoa generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract contract from markdown specification
 */
export async function extractFromMarkdown(
  specContent: string,
  options: ContractOptions
): Promise<GeneratedContract> {
  switch (options.format) {
    case 'openapi':
      return extractOpenAPIFromMarkdown(specContent, options);
    case 'graphql':
      return extractGraphQLFromMarkdown(specContent, options);
    case 'json-schema':
      return extractJSONSchemaFromMarkdown(specContent, options);
  }
}

/**
 * Extract OpenAPI contract from markdown
 */
function extractOpenAPIFromMarkdown(
  specContent: string,
  options: ContractOptions
): GeneratedContract {
  const endpoints = parseEndpoints(specContent);
  const models = parseModels(specContent);

  const openapi: any = {
    openapi: options.specVersion || '3.1.0',
    info: {
      title: extractTitle(specContent) || 'API Specification',
      version: '1.0.0',
      description: extractDescription(specContent),
    },
    servers: [
      {
        url: options.baseUrl || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    paths: {},
    components: {
      schemas: {},
    },
  };

  // Build paths from endpoints
  for (const endpoint of endpoints) {
    if (!openapi.paths[endpoint.path]) {
      openapi.paths[endpoint.path] = {};
    }

    const operation: any = {
      summary: endpoint.summary,
      description: endpoint.description || endpoint.summary,
      responses: {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: endpoint.responseSchema || { type: 'object' },
            },
          },
        },
        '400': {
          description: 'Bad request',
        },
        '500': {
          description: 'Internal server error',
        },
      },
    };

    // Add request body if present
    if (endpoint.requestSchema) {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: endpoint.requestSchema,
          },
        },
      };
    }

    // Add parameters if present
    if (endpoint.parameters) {
      operation.parameters = endpoint.parameters;
    }

    // Add examples if requested
    if (options.includeExamples && endpoint.example) {
      operation.responses['200'].content['application/json'].example = endpoint.example;
    }

    openapi.paths[endpoint.path][endpoint.method.toLowerCase()] = operation;
  }

  // Add models to schemas
  for (const model of models) {
    openapi.components.schemas[model.name] = model.schema;
  }

  return {
    content: JSON.stringify(openapi, null, 2),
    endpoints: endpoints.length,
    models: models.length,
    format: 'openapi',
  };
}

/**
 * Extract GraphQL schema from markdown
 */
function extractGraphQLFromMarkdown(
  specContent: string,
  _options: ContractOptions
): GeneratedContract {
  const models = parseModels(specContent);
  const queries = parseQueries(specContent);
  const mutations = parseMutations(specContent);

  let schema = '# Auto-generated GraphQL Schema\n\n';

  // Add scalars
  schema += 'scalar DateTime\nscalar JSON\n\n';

  // Add type definitions
  for (const model of models) {
    schema += `type ${model.name} {\n`;
    if (model.fields) {
      for (const [fieldName, fieldType] of Object.entries(model.fields)) {
        const gqlType = mapToGraphQLType(fieldType as string);
        schema += `  ${fieldName}: ${gqlType}\n`;
      }
    }
    schema += '}\n\n';

    // Add input type for mutations
    schema += `input ${model.name}Input {\n`;
    if (model.fields) {
      for (const [fieldName, fieldType] of Object.entries(model.fields)) {
        if (fieldName !== 'id') {
          // Skip id for input types
          const gqlType = mapToGraphQLType(fieldType as string);
          schema += `  ${fieldName}: ${gqlType}\n`;
        }
      }
    }
    schema += '}\n\n';
  }

  // Add Query type
  if (queries.length > 0) {
    schema += 'type Query {\n';
    for (const query of queries) {
      schema += `  ${query.name}${query.args || ''}: ${query.returnType}\n`;
    }
    schema += '}\n\n';
  }

  // Add Mutation type
  if (mutations.length > 0) {
    schema += 'type Mutation {\n';
    for (const mutation of mutations) {
      schema += `  ${mutation.name}${mutation.args || ''}: ${mutation.returnType}\n`;
    }
    schema += '}\n\n';
  }

  return {
    content: schema,
    endpoints: queries.length + mutations.length,
    models: models.length,
    format: 'graphql',
  };
}

/**
 * Extract JSON Schema from markdown
 */
function extractJSONSchemaFromMarkdown(
  specContent: string,
  _options: ContractOptions
): GeneratedContract {
  const models = parseModels(specContent);

  const schema: any = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://example.com/schema.json',
    title: extractTitle(specContent) || 'Data Models',
    type: 'object',
    definitions: {},
  };

  for (const model of models) {
    schema.definitions[model.name] = model.schema;
  }

  return {
    content: JSON.stringify(schema, null, 2),
    endpoints: 0,
    models: models.length,
    format: 'json-schema',
  };
}

/**
 * Parse endpoints from spec content
 */
function parseEndpoints(content: string): Array<any> {
  const endpoints: Array<any> = [];

  // Pattern 1: GET /api/users - Get all users
  const simplePattern = /(GET|POST|PUT|PATCH|DELETE)\s+(\/[^\s-]+)\s*-\s*(.+)/gi;

  let match;
  while ((match = simplePattern.exec(content)) !== null) {
    endpoints.push({
      method: match[1].toUpperCase(),
      path: match[2],
      summary: match[3].trim(),
    });
  }

  // Pattern 2: More detailed endpoint definitions in code blocks
  // Look for API sections
  const apiSectionRegex = /## API Endpoints?[\s\S]*?(?=##|$)/gim;
  const apiSection = apiSectionRegex.exec(content);

  if (apiSection) {
    const sectionContent = apiSection[0];

    // Extract code blocks with endpoint details
    const codeBlockRegex = /```(?:json|typescript|javascript)?\s*([\s\S]*?)```/gi;
    let codeMatch;

    while ((codeMatch = codeBlockRegex.exec(sectionContent)) !== null) {
      try {
        const parsed = JSON.parse(codeMatch[1]);
        if (parsed.method && parsed.path) {
          endpoints.push(parsed);
        }
      } catch {
        // Not JSON, skip
      }
    }
  }

  return endpoints;
}

/**
 * Parse data models from spec content
 */
function parseModels(content: string): Array<any> {
  const models: Array<any> = [];

  // Pattern 1: Model: User { id: string, name: string }
  const inlinePattern = /Model:\s*(\w+)\s*\{([^}]+)\}/gi;

  let match;
  while ((match = inlinePattern.exec(content)) !== null) {
    const name = match[1];
    const fieldsStr = match[2];

    const fields: Record<string, string> = {};
    const schema: any = {
      type: 'object',
      properties: {},
      required: [],
    };

    // Parse fields
    const fieldPattern = /(\w+):\s*(\w+)/g;
    let fieldMatch;
    while ((fieldMatch = fieldPattern.exec(fieldsStr)) !== null) {
      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2];

      fields[fieldName] = fieldType;
      schema.properties[fieldName] = {
        type: mapTypeToJSONSchema(fieldType),
      };
      schema.required.push(fieldName);
    }

    models.push({ name, schema, fields });
  }

  // Pattern 2: TypeScript interfaces in code blocks
  const interfacePattern = /interface\s+(\w+)\s*\{([^}]+)\}/gi;

  while ((match = interfacePattern.exec(content)) !== null) {
    const name = match[1];
    const fieldsStr = match[2];

    const fields: Record<string, string> = {};
    const schema: any = {
      type: 'object',
      properties: {},
      required: [],
    };

    // Parse TypeScript interface fields
    const fieldPattern = /(\w+)\??:\s*([^;\n]+)/g;
    let fieldMatch;
    while ((fieldMatch = fieldPattern.exec(fieldsStr)) !== null) {
      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2].trim();
      const isOptional = match[0].includes('?:');

      fields[fieldName] = fieldType;
      schema.properties[fieldName] = {
        type: mapTypeToJSONSchema(fieldType),
      };

      if (!isOptional) {
        schema.required.push(fieldName);
      }
    }

    models.push({ name, schema, fields });
  }

  return models;
}

/**
 * Parse GraphQL queries from spec
 */
function parseQueries(content: string): Array<any> {
  const queries: Array<any> = [];

  const queryPattern = /Query:\s*(\w+)(\([^)]*\))?\s*:\s*(\[?\w+\]?!?)/gi;

  let match;
  while ((match = queryPattern.exec(content)) !== null) {
    queries.push({
      name: match[1],
      args: match[2] || '',
      returnType: match[3],
    });
  }

  return queries;
}

/**
 * Parse GraphQL mutations from spec
 */
function parseMutations(content: string): Array<any> {
  const mutations: Array<any> = [];

  const mutationPattern = /Mutation:\s*(\w+)(\([^)]*\))?\s*:\s*(\[?\w+\]?!?)/gi;

  let match;
  while ((match = mutationPattern.exec(content)) !== null) {
    mutations.push({
      name: match[1],
      args: match[2] || '',
      returnType: match[3],
    });
  }

  return mutations;
}

/**
 * Extract title from spec
 */
function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Extract description from spec
 */
function extractDescription(content: string): string {
  const sections = content.split(/^##\s+/m);
  if (sections.length > 0) {
    const intro = sections[0].replace(/^#\s+.+$/m, '').trim();
    return intro || 'No description available';
  }
  return 'No description available';
}

/**
 * Map type to JSON Schema type
 */
function mapTypeToJSONSchema(type: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    array: 'array',
    object: 'object',
    int: 'integer',
    integer: 'integer',
    float: 'number',
    date: 'string',
    datetime: 'string',
    Date: 'string',
    any: 'object',
  };

  // eslint-disable-next-line no-useless-escape
  const cleanType = type.replace(/[\[\]!?]/g, '').toLowerCase();
  return typeMap[cleanType] || 'string';
}

/**
 * Map type to GraphQL type
 */
function mapToGraphQLType(type: string): string {
  const typeMap: Record<string, string> = {
    string: 'String!',
    number: 'Float!',
    int: 'Int!',
    integer: 'Int!',
    boolean: 'Boolean!',
    date: 'DateTime!',
    datetime: 'DateTime!',
    Date: 'DateTime!',
    object: 'JSON!',
    any: 'JSON!',
  };

  // eslint-disable-next-line no-useless-escape
  const cleanType = type.replace(/[\[\]!?]/g, '').toLowerCase();
  return typeMap[cleanType] || 'String!';
}
