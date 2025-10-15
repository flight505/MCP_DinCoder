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
import {
  ConstitutionCreateSchema,
  constitutionCreate,
} from '../tools/constitution.js';
import {
  ClarifyAddSchema,
  ClarifyResolveSchema,
  ClarifyListSchema,
  clarifyAdd,
  clarifyResolve,
  clarifyList,
} from '../tools/clarify.js';
import {
  SpecValidateSchema,
  ArtifactsAnalyzeSchema,
  specValidate,
  artifactsAnalyze,
} from '../tools/validate.js';
import {
  SpecRefineSchema,
  specRefine,
} from '../tools/refine.js';
import {
  PrereqsCheckSchema,
  prereqsCheck,
} from '../tools/prereqs.js';
import {
  TasksVisualizeSchema,
  tasksVisualize,
} from '../tools/visualize.js';
import {
  TasksFilterSchema,
  tasksFilter,
} from '../tools/filter.js';
import {
  TasksTickRangeSchema,
  tasksTickRange,
} from '../tools/batch.js';
import {
  TasksSearchSchema,
  tasksSearch,
} from '../tools/search.js';

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

  // Constitution tool - define project principles
  server.tool(
    'constitution_create',
    'Define project principles, constraints, and preferences that guide all AI-generated artifacts. Use this before specify_start to establish project guardrails.',
    ConstitutionCreateSchema.shape,
    async (params) => {
      return await constitutionCreate(ConstitutionCreateSchema.parse(params));
    }
  );

  // Clarification tools - track and resolve ambiguities
  server.tool(
    'clarify_add',
    'Flag ambiguities or questions in specifications that need clarification. Creates a tracked clarification with unique ID.',
    ClarifyAddSchema.shape,
    async (params) => {
      return await clarifyAdd(ClarifyAddSchema.parse(params));
    }
  );

  server.tool(
    'clarify_resolve',
    'Resolve a pending clarification with an answer. Updates spec.md and logs resolution in research.md.',
    ClarifyResolveSchema.shape,
    async (params) => {
      return await clarifyResolve(ClarifyResolveSchema.parse(params));
    }
  );

  server.tool(
    'clarify_list',
    'List all clarifications with optional status filter (pending/resolved/all). Useful for tracking progress.',
    ClarifyListSchema.shape,
    async (params) => {
      return await clarifyList(ClarifyListSchema.parse(params));
    }
  );

  server.tool(
    'spec_validate',
    'Check specification quality and completeness. Validates required sections, acceptance criteria, clarifications, and checks for premature implementation details.',
    SpecValidateSchema.shape,
    async (params) => {
      return await specValidate(SpecValidateSchema.parse(params));
    }
  );

  server.tool(
    'artifacts_analyze',
    'Analyze consistency across spec, plan, and tasks artifacts. Verifies that all artifacts are aligned and complete.',
    ArtifactsAnalyzeSchema.shape,
    async (params) => {
      return await artifactsAnalyze(ArtifactsAnalyzeSchema.parse(params));
    }
  );

  server.tool(
    'spec_refine',
    'Refine/update an existing specification. Supports updating specific sections (goals, requirements, acceptance, edge-cases) or the full spec. Changes are logged to research.md.',
    SpecRefineSchema.shape,
    async (params) => {
      return await specRefine(SpecRefineSchema.parse(params));
    }
  );

  server.tool(
    'prereqs_check',
    'Check environment prerequisites before project setup. Verifies Node.js version, npm, git, and custom commands are available.',
    PrereqsCheckSchema.shape,
    async (params) => {
      return await prereqsCheck(PrereqsCheckSchema.parse(params));
    }
  );

  server.tool(
    'specify_start',
    'Initialize a new spec-driven project. Creates .dincoder directory with spec.json template. Use this as the first step when starting a new project.',
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
    'specify_describe',
    'Create or update project specification with detailed requirements, goals, and constraints. Use after specify_start to define what the project should do.',
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
    'plan_create',
    'Generate technical implementation plan from the project specification. Creates a step-by-step technical approach with milestones and architecture decisions.',
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
    'tasks_generate',
    'Generate granular, actionable tasks from the technical plan. Creates a task list with specific implementation steps that can be executed sequentially.',
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
    'tasks_tick',
    'Mark a specific task as complete by its ID. Updates the task status and tracks progress through the implementation.',
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

  server.tool(
    'tasks_visualize',
    'Generate visual dependency graphs from tasks.md. Supports Mermaid flowcharts, Graphviz DOT, and ASCII tree formats. Shows task dependencies, status colors, and optional phase grouping.',
    TasksVisualizeSchema.shape,
    async (params) => {
      const result = await tasksVisualize(TasksVisualizeSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    }
  );

  server.tool(
    'tasks_filter',
    'Filter tasks by status, phase, type, priority, blockers, or tags. Includes smart presets (next, frontend, backend, ready, cleanup) for common workflows. Returns markdown-formatted task list.',
    TasksFilterSchema.shape,
    async (params) => {
      const result = await tasksFilter(TasksFilterSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    }
  );

  server.tool(
    'tasks_tick_range',
    'Mark multiple tasks as complete at once. Supports array format ["T001", "T003"], range format "T001-T005", or mixed format. Includes strict mode for all-or-nothing completion.',
    TasksTickRangeSchema.shape,
    async (params) => {
      const result = await tasksTickRange(TasksTickRangeSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    }
  );

  server.tool(
    'tasks_search',
    'Full-text search across task descriptions and metadata. Supports plain text, regex patterns, and fuzzy matching for typo tolerance. Returns ranked results with relevance scores.',
    TasksSearchSchema.shape,
    async (params) => {
      const result = await tasksSearch(TasksSearchSchema.parse(params));
      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    }
  );
  
  // Quality tools
  server.tool(
    'quality_format',
    'Run Prettier code formatter to ensure consistent code style. Automatically formats JavaScript, TypeScript, JSON, and other supported files.',
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
    'quality_lint',
    'Run ESLint to check for code quality issues, potential bugs, and style violations. Helps maintain code standards and catch errors early.',
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
    'quality_test',
    'Run test suite with optional code coverage reporting. Executes all unit and integration tests to ensure code correctness.',
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
    'quality_security_audit',
    'Run npm/yarn security audit to check for known vulnerabilities in dependencies. Identifies and reports security issues that need attention.',
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
    'quality_deps_update',
    'Check for available updates to project dependencies. Lists outdated packages and their latest versions for potential upgrades.',
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
    'quality_license_check',
    'Analyze licenses of all dependencies to ensure compatibility with project requirements. Identifies potential licensing conflicts or restrictions.',
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
    'artifacts_read',
    'Read and return the current state of spec.json, plan.json, or tasks.json files. Use to retrieve project artifacts in normalized JSON format.',
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
    'research_append',
    'Append technical decisions, trade-offs, and research findings to the research.md document. Maintains a record of architectural choices and reasoning.',
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
    'git_create_branch',
    'Create a new Git branch for implementing a specific feature or fix. Follows naming conventions and ensures clean branch creation from main/master.',
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
    'test_echo',
    'Simple echo tool for testing MCP server connectivity. Returns the input message prefixed with "Echo:". Use for debugging and connection verification.',
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