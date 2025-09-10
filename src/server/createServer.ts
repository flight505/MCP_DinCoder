import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { 
  SpecifyStartSchema, 
  SpecifyDescribeSchema,
  specifyStart,
  specifyDescribe,
} from '../tools/specify.js';
import {
  PlanCreateSchema,
  planCreate,
} from '../tools/plan.js';
import {
  TasksGenerateSchema,
  TasksTickSchema,
  tasksGenerate,
  tasksTick,
} from '../tools/tasks.js';
import {
  QualityFormatSchema,
  QualityLintSchema,
  QualityTestSchema,
  QualitySecurityAuditSchema,
  QualityDepsUpdateSchema,
  QualityLicenseCheckSchema,
  qualityFormat,
  qualityLint,
  qualityTest,
  qualitySecurityAudit,
  qualityDepsUpdate,
  qualityLicenseCheck,
} from '../tools/quality.js';
import {
  ArtifactsReadSchema,
  artifactsRead,
} from '../tools/artifacts.js';
import {
  ResearchAppendSchema,
  researchAppend,
} from '../tools/research.js';
import {
  GitCreateBranchSchema,
  gitCreateBranch,
} from '../tools/git.js';

/**
 * Server configuration schema
 */
export const ServerConfigSchema = z.object({
  name: z.string().default('mcp-dincoder'),
  version: z.string().default('0.0.1'),
  capabilities: z.object({
    tools: z.boolean().default(true),
    resources: z.boolean().default(false),
    prompts: z.boolean().default(false),
  }).default({}),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

/**
 * Creates and configures an MCP server instance
 */
export function createServer(config: Partial<ServerConfig> = {}): McpServer {
  const validatedConfig = ServerConfigSchema.parse(config);
  
  const server = new McpServer({
    name: validatedConfig.name,
    version: validatedConfig.version,
  });

  // Register capabilities
  if (validatedConfig.capabilities.tools) {
    registerTools(server);
  }
  
  if (validatedConfig.capabilities.resources) {
    registerResources(server);
  }
  
  if (validatedConfig.capabilities.prompts) {
    registerPrompts(server);
  }

  return server;
}

/**
 * Register MCP tools
 */
function registerTools(server: McpServer): void {
  // Spec Kit tools
  server.tool(
    'specify.start',
    'Initialize a new spec-driven project',
    SpecifyStartSchema.shape,
    async (params) => {
      const result = await specifyStart(SpecifyStartSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  server.tool(
    'specify.describe',
    'Create project specification',
    SpecifyDescribeSchema.shape,
    async (params) => {
      const result = await specifyDescribe(SpecifyDescribeSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  server.tool(
    'plan.create',
    'Generate technical plan from specification',
    PlanCreateSchema.shape,
    async (params) => {
      const result = await planCreate(PlanCreateSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  server.tool(
    'tasks.generate',
    'Generate actionable tasks from plan',
    TasksGenerateSchema.shape,
    async (params) => {
      const result = await tasksGenerate(TasksGenerateSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  server.tool(
    'tasks.tick',
    'Mark a task as complete',
    TasksTickSchema.shape,
    async (params) => {
      const result = await tasksTick(TasksTickSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  // Quality tools
  server.tool(
    'quality.format',
    'Run code formatter (Prettier)',
    QualityFormatSchema.shape,
    async (params) => {
      const result = await qualityFormat(QualityFormatSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  server.tool(
    'quality.lint',
    'Run linter (ESLint)',
    QualityLintSchema.shape,
    async (params) => {
      const result = await qualityLint(QualityLintSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  server.tool(
    'quality.test',
    'Run tests with optional coverage',
    QualityTestSchema.shape,
    async (params) => {
      const result = await qualityTest(QualityTestSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  server.tool(
    'quality.security_audit',
    'Run security audit',
    QualitySecurityAuditSchema.shape,
    async (params) => {
      const result = await qualitySecurityAudit(QualitySecurityAuditSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  server.tool(
    'quality.deps_update',
    'Check for dependency updates',
    QualityDepsUpdateSchema.shape,
    async (params) => {
      const result = await qualityDepsUpdate(QualityDepsUpdateSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  server.tool(
    'quality.license_check',
    'Check dependency licenses for compatibility',
    QualityLicenseCheckSchema.shape,
    async (params) => {
      const result = await qualityLicenseCheck(QualityLicenseCheckSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  // Artifacts tools
  server.tool(
    'artifacts.read',
    'Read and return normalized JSON for spec/plan/tasks',
    ArtifactsReadSchema.shape,
    async (params) => {
      const result = await artifactsRead(ArtifactsReadSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  // Research tools
  server.tool(
    'research.append',
    'Append to research document for decisions taken',
    ResearchAppendSchema.shape,
    async (params) => {
      const result = await researchAppend(ResearchAppendSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  // Git tools
  server.tool(
    'git.create_branch',
    'Create a working branch for a feature',
    GitCreateBranchSchema.shape,
    async (params) => {
      const result = await gitCreateBranch(GitCreateBranchSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
  
  // Keep test tool for compatibility
  server.tool(
    'test.echo',
    'Echo test tool',
    {
      message: z.string().describe('Message to echo'),
    },
    async ({ message }) => {
      return {
        content: [
          {
            type: 'text',
            text: `Echo: ${message}`,
          },
        ],
      };
    }
  );
}

/**
 * Register MCP resources
 */
function registerResources(_server: McpServer): void {
  // TODO: Implement resource handlers if needed
}

/**
 * Register MCP prompts
 */
function registerPrompts(_server: McpServer): void {
  // TODO: Implement prompt handlers if needed
}