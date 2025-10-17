import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { resolveWorkspacePath } from './workspace.js';

/**
 * API Contract Generation Tools
 *
 * Generates OpenAPI 3.1 and GraphQL schemas from specifications and TypeScript code.
 */

// Tool schema
export const ContractsGenerateSchema = z.object({
  specPath: z.string().optional().describe('Path to specification file (auto-detect if not provided)'),
  outputPath: z.string().optional().describe('Output path for generated contract (default: contracts/ in spec directory)'),
  format: z.enum(['openapi', 'graphql', 'json-schema']).default('openapi').describe('Contract format to generate'),
  includeExamples: z.boolean().default(true).describe('Include example values in generated contract'),
  workspacePath: z.string().optional().describe('Workspace directory path'),
});

export type ContractFormat = 'openapi' | 'graphql' | 'json-schema';

export interface ContractGenerationResult {
  success: boolean;
  contractPath: string;
  format: ContractFormat;
  message: string;
  details: {
    specPath: string;
    endpointsFound: number;
    modelsFound: number;
    version: string;
    validationErrors?: string[];
  };
}

/**
 * Generate API contract from specification
 */
export async function contractsGenerate(
  params: z.infer<typeof ContractsGenerateSchema>
): Promise<ContractGenerationResult> {
  const { specPath, outputPath, format, includeExamples, workspacePath } = params;

  // Resolve workspace path
  const resolvedPath = resolveWorkspacePath(workspacePath);

  try {
    // Find spec file
    const actualSpecPath = await findSpecFile(resolvedPath, specPath);

    // Read spec content
    const specContent = await fs.readFile(actualSpecPath, 'utf-8');

    // Determine output path
    const specDir = path.dirname(actualSpecPath);
    const contractsDir = path.join(specDir, 'contracts');
    await fs.mkdir(contractsDir, { recursive: true });

    const defaultFileName = format === 'openapi'
      ? 'openapi.yaml'
      : format === 'graphql'
      ? 'schema.graphql'
      : 'schema.json';

    const actualOutputPath = outputPath
      ? path.resolve(resolvedPath, outputPath)
      : path.join(contractsDir, defaultFileName);

    // Generate contract based on format
    let contractContent: string;
    let endpointsFound = 0;
    let modelsFound = 0;

    switch (format) {
      case 'openapi':
        ({ content: contractContent, endpointsFound, modelsFound } =
          await generateOpenAPIContract(specContent, includeExamples));
        break;
      case 'graphql':
        ({ content: contractContent, modelsFound } =
          await generateGraphQLContract(specContent, includeExamples));
        break;
      case 'json-schema':
        ({ content: contractContent, modelsFound } =
          await generateJSONSchemaContract(specContent));
        break;
    }

    // Write contract file
    await fs.writeFile(actualOutputPath, contractContent, 'utf-8');

    return {
      success: true,
      contractPath: actualOutputPath,
      format,
      message: `Generated ${format.toUpperCase()} contract successfully`,
      details: {
        specPath: actualSpecPath,
        endpointsFound,
        modelsFound,
        version: format === 'openapi' ? '3.1.0' : '1.0.0',
      },
    };
  } catch (error) {
    throw new Error(`Failed to generate contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Find specification file in workspace
 */
async function findSpecFile(workspacePath: string, specPath?: string): Promise<string> {
  if (specPath) {
    const absolutePath = path.isAbsolute(specPath)
      ? specPath
      : path.resolve(workspacePath, specPath);

    // Check if file exists
    try {
      await fs.access(absolutePath);
      return absolutePath;
    } catch {
      throw new Error(`Specification file not found: ${specPath}`);
    }
  }

  // Auto-detect spec file
  const possiblePaths = [
    path.join(workspacePath, '.dincoder', 'spec.md'),
    path.join(workspacePath, 'specs', 'spec.md'),
    path.join(workspacePath, 'spec.md'),
  ];

  // Try to find most recent feature spec in specs directory
  const specsDir = path.join(workspacePath, 'specs');
  try {
    const entries = await fs.readdir(specsDir);
    const featureDirs = entries
      .filter(entry => /^\d{3}-/.test(entry))
      .sort()
      .reverse();

    if (featureDirs.length > 0) {
      possiblePaths.unshift(path.join(specsDir, featureDirs[0], 'spec.md'));
    }
  } catch {
    // specs directory doesn't exist
  }

  for (const possiblePath of possiblePaths) {
    try {
      await fs.access(possiblePath);
      return possiblePath;
    } catch {
      continue;
    }
  }

  throw new Error('No specification file found. Use specPath parameter to specify location.');
}

/**
 * Generate OpenAPI 3.1 contract from specification
 */
async function generateOpenAPIContract(
  specContent: string,
  includeExamples: boolean
): Promise<{ content: string; endpointsFound: number; modelsFound: number }> {
  // Parse spec for API endpoints and models
  const endpoints = extractEndpoints(specContent);
  const models = extractModels(specContent);

  // Build OpenAPI document
  const openapi = {
    openapi: '3.1.0',
    info: {
      title: extractTitle(specContent) || 'API Specification',
      version: '1.0.0',
      description: extractDescription(specContent),
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    paths: {} as Record<string, any>,
    components: {
      schemas: {} as Record<string, any>,
    },
  };

  // Add endpoints to paths
  for (const endpoint of endpoints) {
    const pathKey = endpoint.path;
    if (!openapi.paths[pathKey]) {
      openapi.paths[pathKey] = {};
    }

    const operation: any = {
      summary: endpoint.summary,
      description: endpoint.description,
      responses: {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: endpoint.responseSchema || { type: 'object' },
            },
          },
        },
      },
    };

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

    if (includeExamples && endpoint.example) {
      operation.responses['200'].content['application/json'].example = endpoint.example;
    }

    openapi.paths[pathKey][endpoint.method.toLowerCase()] = operation;
  }

  // Add models to components.schemas
  for (const model of models) {
    openapi.components.schemas[model.name] = model.schema;
  }

  // Convert to YAML (using JSON for now, can add yaml library later)
  const content = JSON.stringify(openapi, null, 2);

  return {
    content,
    endpointsFound: endpoints.length,
    modelsFound: models.length,
  };
}

/**
 * Generate GraphQL schema from specification
 */
async function generateGraphQLContract(
  specContent: string,
  _includeExamples: boolean
): Promise<{ content: string; modelsFound: number }> {
  const models = extractModels(specContent);
  const queries = extractQueries(specContent);
  const mutations = extractMutations(specContent);

  let schema = '# GraphQL Schema\n\n';

  // Add type definitions
  for (const model of models) {
    schema += `type ${model.name} {\n`;
    for (const [fieldName, fieldType] of Object.entries(model.fields || {})) {
      schema += `  ${fieldName}: ${fieldType}\n`;
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
    modelsFound: models.length,
  };
}

/**
 * Generate JSON Schema from specification
 */
async function generateJSONSchemaContract(
  specContent: string
): Promise<{ content: string; modelsFound: number }> {
  const models = extractModels(specContent);

  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://example.com/schema.json',
    title: extractTitle(specContent) || 'Data Models',
    type: 'object',
    properties: {} as Record<string, any>,
    definitions: {} as Record<string, any>,
  };

  for (const model of models) {
    schema.definitions[model.name] = model.schema;
  }

  return {
    content: JSON.stringify(schema, null, 2),
    modelsFound: models.length,
  };
}

/**
 * Extract API endpoints from specification
 */
function extractEndpoints(specContent: string): Array<{
  path: string;
  method: string;
  summary: string;
  description?: string;
  requestSchema?: any;
  responseSchema?: any;
  example?: any;
}> {
  const endpoints: Array<any> = [];

  // Look for API endpoint patterns in spec
  // Pattern: GET /api/users - Get all users
  const endpointPattern = /(GET|POST|PUT|PATCH|DELETE)\s+(\/[^\s-]+)\s*-\s*(.+)/gi;

  let match;
  while ((match = endpointPattern.exec(specContent)) !== null) {
    endpoints.push({
      method: match[1],
      path: match[2],
      summary: match[3].trim(),
    });
  }

  return endpoints;
}

/**
 * Extract data models from specification
 */
function extractModels(specContent: string): Array<{
  name: string;
  schema: any;
  fields?: Record<string, string>;
}> {
  const models: Array<any> = [];

  // Look for model definitions in spec
  // Pattern: Model: User { id: string, name: string, email: string }
  const modelPattern = /Model:\s*(\w+)\s*\{([^}]+)\}/gi;

  let match;
  while ((match = modelPattern.exec(specContent)) !== null) {
    const name = match[1];
    const fieldsStr = match[2];

    const fields: Record<string, string> = {};
    const schema: any = {
      type: 'object',
      properties: {},
      required: [],
    };

    // Parse fields: id: string, name: string, email: string
    const fieldPattern = /(\w+):\s*(\w+)/g;
    let fieldMatch;
    while ((fieldMatch = fieldPattern.exec(fieldsStr)) !== null) {
      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2];

      fields[fieldName] = fieldType;
      schema.properties[fieldName] = { type: mapTypeToJsonSchema(fieldType) };
      schema.required.push(fieldName);
    }

    models.push({ name, schema, fields });
  }

  return models;
}

/**
 * Extract GraphQL queries from specification
 */
function extractQueries(specContent: string): Array<{
  name: string;
  args?: string;
  returnType: string;
}> {
  const queries: Array<any> = [];

  // Look for query patterns
  // Pattern: Query: getUser(id: ID!): User
  const queryPattern = /Query:\s*(\w+)(\([^)]*\))?\s*:\s*(\w+)/gi;

  let match;
  while ((match = queryPattern.exec(specContent)) !== null) {
    queries.push({
      name: match[1],
      args: match[2] || '',
      returnType: match[3],
    });
  }

  return queries;
}

/**
 * Extract GraphQL mutations from specification
 */
function extractMutations(specContent: string): Array<{
  name: string;
  args?: string;
  returnType: string;
}> {
  const mutations: Array<any> = [];

  // Look for mutation patterns
  // Pattern: Mutation: createUser(name: String!, email: String!): User
  const mutationPattern = /Mutation:\s*(\w+)(\([^)]*\))?\s*:\s*(\w+)/gi;

  let match;
  while ((match = mutationPattern.exec(specContent)) !== null) {
    mutations.push({
      name: match[1],
      args: match[2] || '',
      returnType: match[3],
    });
  }

  return mutations;
}

/**
 * Extract title from specification
 */
function extractTitle(specContent: string): string | null {
  const match = specContent.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Extract description from specification
 */
function extractDescription(specContent: string): string {
  // Extract content between title and first heading
  const sections = specContent.split(/^##\s+/m);
  if (sections.length > 0) {
    const intro = sections[0].replace(/^#\s+.+$/m, '').trim();
    return intro || 'No description available';
  }
  return 'No description available';
}

/**
 * Map TypeScript/spec types to JSON Schema types
 */
function mapTypeToJsonSchema(type: string): string {
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
  };

  return typeMap[type.toLowerCase()] || 'string';
}
