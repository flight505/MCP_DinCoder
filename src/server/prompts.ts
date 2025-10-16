/**
 * MCP Prompts Registration
 *
 * Registers workflow prompts that become slash commands in MCP clients
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Register all MCP workflow prompts
 */
export function registerPrompts(server: McpServer): void {
  // Prompt 1: start_project
  server.prompt(
    "start_project",
    "Initialize a new spec-driven project with DinCoder",
    {
      projectName: z.string().describe("Name of the project"),
      agent: z.string().optional().describe("AI agent type (claude|copilot|gemini)")
    },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Initialize a spec-driven project called "${args.projectName}".

Follow this workflow:

1. Run \`specify_start\` with:
   - projectName: "${args.projectName}"
   - agent: "${args.agent || 'claude'}"

2. After initialization, explain to the user:
   - The .dincoder/ directory structure created
   - The spec-driven workflow: Specify → Plan → Execute
   - Next step: Creating a specification

3. Ask the user what they want to build, then:
   - Run \`specify_describe\` with their requirements
   - Guide them through adding details if needed

## Available DinCoder Tools

### Project Setup
- \`specify_start\`: Initialize .dincoder/ directory
- \`prereqs_check\`: Verify environment (Node, npm, git)
- \`constitution_create\`: Define project principles

### Specification Phase
- \`specify_describe\`: Create detailed spec.md
- \`spec_validate\`: Check quality (completeness, acceptance criteria)
- \`spec_refine\`: Update specific sections
- \`clarify_add\`: Flag ambiguities
- \`clarify_resolve\`: Resolve clarifications
- \`clarify_list\`: View all clarifications

### Planning Phase
- \`plan_create\`: Generate technical implementation plan
- \`artifacts_analyze\`: Verify spec-plan alignment

### Task Management
- \`tasks_generate\`: Create actionable task list
- \`tasks_visualize\`: Show dependency graphs (Mermaid/Graphviz/ASCII)
- \`tasks_filter\`: Smart filtering (presets: next, frontend, backend, ready, cleanup)
- \`tasks_search\`: Fuzzy search across tasks
- \`tasks_stats\`: Progress analytics with charts
- \`tasks_tick\`: Mark single task complete
- \`tasks_tick_range\`: Batch completion (T001-T005 syntax)

### Quality & Research
- \`quality_format\`: Run Prettier
- \`quality_lint\`: Run ESLint
- \`quality_test\`: Run test suite
- \`research_append\`: Log technical decisions

Start by calling \`specify_start\` now.`
          }
        }
      ]
    })
  );

  // Prompt 2: create_spec
  server.prompt(
    "create_spec",
    "Create specification for a new feature or project",
    {
      description: z.string().describe("Brief description of what you want to build")
    },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Create a specification for: "${args.description}"

Workflow:

1. Check if .dincoder/ exists:
   - If not, run \`specify_start\` first
   - If yes, proceed to step 2

2. Gather comprehensive requirements by asking:
   - What problem does this solve?
   - Who are the users?
   - What are the success criteria?
   - What are the constraints?
   - What's explicitly out of scope?

3. Run \`specify_describe\` with a complete specification including:
   - **Goals**: Why are we building this?
   - **Requirements**: What must it do? (functional & non-functional)
   - **Acceptance Criteria**: Testable when/then statements
   - **Edge Cases**: Error scenarios, boundary conditions
   - **Out of Scope**: What we're NOT building

4. Run \`spec_validate\` to check quality:
   - Completeness (all required sections)
   - Acceptance criteria (testable assertions)
   - Clarifications (no unresolved ambiguities)
   - Implementation leakage (no HOW in WHAT sections)

5. Address any validation issues using \`spec_refine\`

6. Confirm specification is complete before suggesting next steps

Remember: Specifications focus on WHAT, not HOW. No implementation details yet.`
          }
        }
      ]
    })
  );

  // Prompt 3: generate_plan
  server.prompt(
    "generate_plan",
    "Generate implementation plan from specification",
    {
      specPath: z.string().optional().describe("Path to spec.md file (optional, auto-detected)")
    },
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate an implementation plan from the specification.

Workflow:

1. Verify specification exists and is validated:
   - Run \`artifacts_read\` with artifactType: "spec"
   - If spec missing, guide user to create one first
   - If spec exists but not validated, run \`spec_validate\`

2. Run \`plan_create\` with technical constraints:
   - Technology stack preferences
   - Architecture patterns
   - Performance requirements
   - Security considerations

3. Run \`artifacts_analyze\` to verify:
   - All spec requirements are addressed in plan
   - No missing features
   - Plan is feasible

4. Present the plan structure:
   - Milestones
   - Technical decisions
   - Architecture overview
   - Implementation phases

5. Ask if user wants to proceed to task generation

The plan focuses on HOW to build what the spec defines.`
          }
        }
      ]
    })
  );

  // Prompt 4: create_tasks
  server.prompt(
    "create_tasks",
    "Break down plan into actionable tasks",
    {
      planPath: z.string().optional().describe("Path to plan.md file (optional, auto-detected)")
    },
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate actionable tasks from the implementation plan.

Workflow:

1. Verify plan exists:
   - Run \`artifacts_read\` with artifactType: "plan"
   - If missing, guide user to create plan first

2. Run \`tasks_generate\` with granular scope:
   - Break down plan into 1-point tasks
   - Each task should be completable in one session
   - Add metadata: phase, type, dependencies, priority, effort

3. Run \`tasks_visualize\` to show:
   - Dependency graph (Mermaid format for GitHub rendering)
   - Circular dependency detection
   - Critical path highlighting

4. Run \`tasks_stats\` to display:
   - Total tasks by phase/type
   - Estimated effort
   - Blocker analysis

5. Run \`tasks_filter\` with preset: "next" to show:
   - Unblocked tasks ready to start
   - Prioritized by importance

6. Guide user to start first task

Tasks use metadata format: \`(phase: setup, type: backend, depends: T001, priority: high, effort: 3)\``
          }
        }
      ]
    })
  );

  // Prompt 5: review_progress
  server.prompt(
    "review_progress",
    "Generate comprehensive progress report with statistics and charts",
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a comprehensive progress report.

Workflow:

1. Run \`tasks_stats\` with:
   - groupBy: "all"
   - includeCharts: true
   - showBlockers: true

2. Run \`tasks_filter\` with preset: "next" to show actionable items

3. Run \`tasks_search\` for any in-progress tasks (status filter)

4. Summarize in this format:

   ## Progress Summary
   - Overall completion: X%
   - Tasks: X completed, Y in progress, Z pending

   ## Recent Accomplishments
   [List completed tasks]

   ## Current Work
   [List in-progress tasks]

   ## Next Actions (Unblocked)
   [Top 5 actionable tasks]

   ## Blockers
   [List blocked tasks with dependencies]

   ## Recommendations
   [Suggest focus areas or concerns]

5. Include visual progress chart from tasks_stats

Present actionable insights, not just raw data.`
          }
        }
      ]
    })
  );

  // Prompt 6: validate_spec
  server.prompt(
    "validate_spec",
    "Check specification quality before moving to implementation",
    {
      specPath: z.string().optional().describe("Path to spec.md file (optional, auto-detected)")
    },
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Validate specification quality before implementation.

Workflow:

1. Run \`spec_validate\` with all checks enabled

2. Check for:
   - ✅ Completeness: All required sections (goals, requirements, acceptance, edge cases)
   - ✅ Acceptance Criteria: Testable when/then statements for each feature
   - ✅ Clarifications: No unresolved [NEEDS CLARIFICATION] markers
   - ✅ Implementation Leakage: No HOW details in WHAT sections

3. Run \`clarify_list\` to show pending clarifications

4. If validation fails:
   - List specific issues found
   - Run \`spec_refine\` to fix each issue
   - Re-validate until all checks pass

5. If validation passes:
   - Confirm spec is ready for planning phase
   - Suggest running \`plan_create\` next

Quality gates prevent incomplete specs from reaching implementation.`
          }
        }
      ]
    })
  );

  // Prompt 7: next_tasks
  server.prompt(
    "next_tasks",
    "Show next actionable tasks (unblocked, ready to start)",
    {
      limit: z.string().optional().describe("Maximum number of tasks to show (default: 5)")
    },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Show next actionable tasks (unblocked and ready to start).

Workflow:

1. Run \`tasks_filter\` with:
   - preset: "next"
   - limit: ${args.limit || '5'}
   - sortBy: "priority"

2. For each task, display:
   - Task ID and description
   - Metadata (phase, type, priority, effort)
   - Why it's actionable (no blockers)

3. Recommend which task to start first based on:
   - Priority level
   - Dependencies completed
   - Effort estimate
   - Current project phase

4. Offer to provide more details on any specific task

Focus on tasks that can be started immediately.`
          }
        }
      ]
    })
  );
}
