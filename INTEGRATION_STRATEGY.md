# DinCoder Integration Strategy

**Version:** 1.0.0
**Date:** 2025-10-16
**Status:** Planning Phase

This document outlines comprehensive strategies for integrating DinCoder MCP server with various AI coding assistants, making spec-driven development workflows accessible and discoverable in new projects.

## Table of Contents

1. [Overview](#overview)
2. [Strategy A: MCP Prompts (Universal)](#strategy-a-mcp-prompts-universal)
3. [Strategy B: Claude Code Plugin](#strategy-b-claude-code-plugin)
4. [Strategy C: VS Code Integration](#strategy-c-vs-code-integration)
5. [Strategy D: OpenAI Codex Integration](#strategy-d-openai-codex-integration)
6. [Strategy E: Project Templates](#strategy-e-project-templates)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Cross-Platform Comparison](#cross-platform-comparison)

---

## Overview

### The Problem

When users start a new project with DinCoder installed, they face:

- **Low Discoverability**: MCP tools are available but users don't know which ones to use or when
- **High Friction**: Requires reading documentation to understand workflow
- **No Guidance**: AI assistants must figure out tool usage patterns from tool descriptions alone
- **Context Gap**: No automatic provisioning of spec-driven methodology knowledge

### The Solution

Implement multiple integration strategies targeting different platforms:

1. **MCP Prompts** - Universal workflow commands (all MCP-compatible assistants)
2. **Claude Code Plugin** - Bundled experience with slash commands + agents
3. **VS Code Integration** - GitHub Copilot workspace configuration
4. **OpenAI Codex Integration** - Config.toml setup with custom instructions
5. **Project Templates** - Pre-configured starter repositories

---

## Strategy A: MCP Prompts (Universal)

**Status:** 🎯 **Highest Priority - Works Everywhere**
**Effort:** 2-3 days
**Hosting:** This repository (MCP_DinCoder)

### Description

Add MCP Prompts to the DinCoder server that expose workflows as discoverable slash commands. This works with **all MCP-compatible clients** (Claude Code, VS Code Copilot, OpenAI Codex, Cursor, Windsurf, etc.).

### Technical Implementation

Add prompt handlers to `src/server/createServer.ts`:

```typescript
// Register prompts capability during initialization
const serverCapabilities = {
  tools: {},
  resources: {},
  prompts: {},  // ← Add this
};

// Add prompts list handler
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: "start_project",
      description: "Initialize a new spec-driven project with DinCoder",
      arguments: [
        {
          name: "projectName",
          description: "Name of the project",
          required: true
        },
        {
          name: "agent",
          description: "AI agent type (claude|copilot|gemini)",
          required: false
        }
      ]
    },
    {
      name: "create_spec",
      description: "Create specification for a new feature or project",
      arguments: [
        {
          name: "description",
          description: "Brief description of what you want to build",
          required: true
        }
      ]
    },
    {
      name: "generate_plan",
      description: "Generate implementation plan from specification",
      arguments: [
        {
          name: "specPath",
          description: "Path to spec.md file (optional, auto-detected)",
          required: false
        }
      ]
    },
    {
      name: "create_tasks",
      description: "Break down plan into actionable tasks",
      arguments: [
        {
          name: "planPath",
          description: "Path to plan.md file (optional, auto-detected)",
          required: false
        }
      ]
    },
    {
      name: "review_progress",
      description: "Generate comprehensive progress report with statistics and charts",
      arguments: []
    },
    {
      name: "validate_spec",
      description: "Check specification quality before moving to implementation",
      arguments: [
        {
          name: "specPath",
          description: "Path to spec.md file (optional, auto-detected)",
          required: false
        }
      ]
    },
    {
      name: "next_tasks",
      description: "Show next actionable tasks (unblocked, ready to start)",
      arguments: [
        {
          name: "limit",
          description: "Maximum number of tasks to show (default: 5)",
          required: false
        }
      ]
    }
  ]
}));

// Add get prompt handler
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "start_project":
      return {
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
      };

    case "create_spec":
      return {
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
      };

    case "generate_plan":
      return {
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
      };

    case "create_tasks":
      return {
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
      };

    case "review_progress":
      return {
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
      };

    case "validate_spec":
      return {
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
      };

    case "next_tasks":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Show next actionable tasks (unblocked and ready to start).

Workflow:

1. Run \`tasks_filter\` with:
   - preset: "next"
   - limit: ${args.limit || 5}
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
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});
```

### Usage Across Platforms

**Claude Code:**
```bash
cd /new-project
claude
> /mcp__dincoder__start_project my-app
```

**VS Code (GitHub Copilot):**
```bash
# In Copilot Chat (agent mode)
/mcp.dincoder.start_project my-app
```

**OpenAI Codex (CLI):**
```bash
codex "use /mcp.dincoder.start_project my-app"
```

### Benefits

✅ Works with **all MCP-compatible assistants** (Claude Code, VS Code, Codex, Cursor, Windsurf)
✅ **Zero additional repositories** - hosted in main DinCoder repo
✅ **Immediate discoverability** - slash commands appear automatically
✅ **Workflow guidance** - prompts include step-by-step instructions
✅ **Context provisioning** - full tool catalog included in each prompt

### Deliverables

1. ✅ Add prompt handlers to `src/server/createServer.ts`
2. ✅ Update README with prompt usage examples
3. ✅ Add prompt documentation to CLAUDE.md
4. ✅ Test with Claude Desktop, VS Code, and Codex
5. ✅ Publish as part of next npm release (v0.3.1 or v0.4.0)

---

## Strategy B: Claude Code Plugin

**Status:** 🚀 **Best Long-term Experience for Claude Code Users**
**Effort:** 1 week
**Hosting:** Separate repository (`dincoder/claude-plugin`)

### Description

Create a Claude Code plugin that bundles slash commands, agents, MCP server config, and documentation into a single installable package.

### Technical Implementation

**Repository Structure:**
```
dincoder-plugin/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── spec.md
│   ├── plan.md
│   ├── tasks.md
│   ├── progress.md
│   ├── validate.md
│   └── next.md
├── agents/
│   ├── spec-writer.md
│   ├── plan-architect.md
│   └── task-manager.md
├── CLAUDE.md
├── .mcp.json
└── README.md
```

**plugin.json:**
```json
{
  "name": "dincoder",
  "description": "Spec-driven development workflow with DinCoder MCP server. Transform ideas into implementation through structured specifications, technical plans, and actionable tasks.",
  "version": "0.3.0",
  "author": {
    "name": "DinCoder Team",
    "email": "support@dincoder.dev",
    "url": "https://github.com/dincoder"
  },
  "homepage": "https://github.com/dincoder/claude-plugin",
  "repository": {
    "type": "git",
    "url": "https://github.com/dincoder/claude-plugin.git"
  },
  "license": "MIT",
  "keywords": [
    "specification",
    "planning",
    "task-management",
    "spec-driven",
    "workflow"
  ],
  "mcpServers": {
    "dincoder": {
      "command": "npx",
      "args": ["-y", "mcp-dincoder@latest"]
    }
  }
}
```

**commands/spec.md:**
```markdown
---
description: Create or refine project specification using spec-driven methodology
---

Create a detailed specification for this project using DinCoder's spec-driven workflow.

## Workflow

1. **Initialize** (if needed):
   - Check if `.dincoder/` exists
   - If not, run `specify_start` with project name

2. **Gather Requirements**:
   - What problem are we solving?
   - Who are the users?
   - What does success look like?
   - What are the constraints?
   - What's out of scope?

3. **Create Specification**:
   - Run `specify_describe` with comprehensive details:
     - **Goals**: Why we're building this (business value)
     - **Requirements**: What it must do (functional & non-functional)
     - **Acceptance Criteria**: Testable when/then statements
     - **Edge Cases**: Error scenarios, boundary conditions
     - **Out of Scope**: Explicitly state what we're NOT building

4. **Validate Quality**:
   - Run `spec_validate` to check:
     - ✅ All required sections present
     - ✅ Acceptance criteria are testable
     - ✅ No unresolved clarifications
     - ✅ No implementation details (HOW) leaking into spec (WHAT)

5. **Refine if Needed**:
   - Address validation issues with `spec_refine`
   - Resolve ambiguities with `clarify_resolve`
   - Iterate until validation passes

6. **Confirm Completion**:
   - Specification should be clear, complete, and unambiguous
   - Ready for planning phase

## Remember

- Specifications focus on **WHAT** to build, not **HOW**
- Every feature needs **testable acceptance criteria**
- Flag assumptions as **clarifications**
- Be specific about what's **out of scope**

Ask clarifying questions to fill gaps!
```

**commands/plan.md:**
```markdown
---
description: Generate technical implementation plan from specification
---

Generate a detailed implementation plan from the project specification.

## Workflow

1. **Verify Prerequisites**:
   - Check spec exists: `artifacts_read` with `artifactType: "spec"`
   - If missing, run `/spec` first
   - Verify spec is validated: `spec_validate`

2. **Gather Technical Context**:
   - Preferred technology stack
   - Architecture patterns (monolith, microservices, serverless)
   - Performance requirements
   - Security considerations
   - Deployment environment

3. **Generate Plan**:
   - Run `plan_create` with constraints:
     ```
     Technology stack: [stack preferences]
     Architecture: [architecture choice]
     Performance: [performance requirements]
     Security: [security requirements]
     ```

4. **Validate Alignment**:
   - Run `artifacts_analyze` to verify:
     - All spec requirements addressed
     - No missing features
     - Plan is technically feasible
     - Spec-plan consistency

5. **Review Structure**:
   - **Milestones**: Major implementation phases
   - **Technical Decisions**: Architecture choices with rationale
   - **Implementation Phases**: Ordered development steps
   - **Dependencies**: External services, libraries

6. **Next Steps**:
   - If plan looks good, suggest `/tasks` to generate actionable items
   - Log key decisions to `research.md` using `research_append`

## Focus

The plan focuses on **HOW** to build what the spec defines.
```

**commands/tasks.md:**
```markdown
---
description: Generate actionable task list from implementation plan
---

Break down the implementation plan into granular, actionable tasks.

## Workflow

1. **Verify Plan Exists**:
   - Run `artifacts_read` with `artifactType: "plan"`
   - If missing, run `/plan` first

2. **Generate Tasks**:
   - Run `tasks_generate` with scope guidance
   - Break down into 1-point tasks (completable in one session)
   - Add metadata to each task:
     - `phase`: setup | implementation | testing | polish
     - `type`: frontend | backend | devops | testing | docs
     - `depends`: Task dependencies (T001, T002)
     - `priority`: high | medium | low
     - `effort`: Estimated hours (1-8)

3. **Visualize Dependencies**:
   - Run `tasks_visualize` with format: "mermaid"
   - Review dependency graph for:
     - Circular dependencies (auto-detected)
     - Critical path
     - Parallelization opportunities

4. **Analyze Scope**:
   - Run `tasks_stats` with:
     - `groupBy: "all"`
     - `includeCharts: true`
   - Review:
     - Total tasks by phase/type
     - Estimated total effort
     - Blocker analysis

5. **Identify Next Actions**:
   - Run `tasks_filter` with `preset: "next"`
   - Show unblocked, high-priority tasks
   - Recommend starting point

6. **Begin Implementation**:
   - Start with first unblocked task
   - Mark complete with `tasks_tick` when done
   - Use `/progress` to track advancement

## Task Metadata Format

```
- [ ] Task description (phase: setup, type: backend, depends: T001, priority: high, effort: 3)
```

## Tips

- Keep tasks atomic (one clear deliverable)
- Use dependencies to enforce order
- Tag by type for filtering (frontend, backend, etc.)
- Update status regularly for accurate progress tracking
```

**commands/progress.md:**
```markdown
---
description: View comprehensive project progress report with statistics and charts
---

Generate a detailed progress report with actionable insights.

## Workflow

1. **Overall Statistics**:
   - Run `tasks_stats` with:
     - `groupBy: "all"`
     - `includeCharts: true`
     - `showBlockers: true`

2. **Next Actions**:
   - Run `tasks_filter` with `preset: "next"`
   - Show top 5 unblocked tasks

3. **Current Work**:
   - Run `tasks_search` for in-progress tasks
   - Check if any are blocked

4. **Generate Report**:
   ```
   # Project Progress Report

   ## Overall Status
   - Completion: X% (Y/Z tasks)
   - Phase distribution: [breakdown]
   - Type distribution: [breakdown]

   [ASCII Progress Chart]

   ## Recent Accomplishments
   [Completed tasks from last session]

   ## Current Work
   [Tasks in progress]

   ## Next Actions (Unblocked)
   1. [Task ID]: [Description] (priority: X, effort: Y)
   2. ...

   ## Blockers & Dependencies
   [Tasks blocked by incomplete dependencies]

   ## Recommendations
   - Focus area: [suggestion]
   - Concerns: [potential issues]
   - Velocity: [on track / ahead / behind]
   ```

5. **Actionable Insights**:
   - Highlight bottlenecks
   - Suggest focus areas
   - Flag risks early

## Use Cases

- Daily standup preparation
- Sprint planning
- Stakeholder updates
- Personal progress tracking
```

**commands/validate.md:**
```markdown
---
description: Run quality checks on specification before implementation
---

Validate specification quality to ensure it's ready for the planning phase.

## Workflow

1. **Run Validation**:
   - Execute `spec_validate` with all checks

2. **Review Results**:
   - ✅ **Completeness**: All required sections present
     - Goals
     - Requirements
     - Acceptance Criteria
     - Edge Cases
   - ✅ **Acceptance Criteria**: Testable when/then statements
   - ✅ **Clarifications**: No unresolved `[NEEDS CLARIFICATION]` markers
   - ✅ **Implementation Leakage**: No HOW details in WHAT sections

3. **Check Clarifications**:
   - Run `clarify_list` to view all clarifications
   - Resolve pending items with `clarify_resolve`

4. **Fix Issues**:
   - For each validation failure:
     - Run `spec_refine` with specific section and changes
     - Document rationale
     - Re-validate

5. **Verify Alignment**:
   - Run `artifacts_analyze` for cross-check
   - Ensure spec is self-consistent

6. **Approval**:
   - If all checks pass:
     - ✅ Spec is ready for planning
     - Suggest running `/plan` next
   - If checks fail:
     - ❌ List specific issues
     - Guide through fixes

## Quality Gates

Validation prevents incomplete specs from reaching implementation.
Only specs that pass all checks should proceed to planning.
```

**commands/next.md:**
```markdown
---
description: Show next actionable tasks ready to start
---

Display the highest-priority, unblocked tasks that are ready to work on now.

## Workflow

1. **Filter for Next Tasks**:
   - Run `tasks_filter` with:
     - `preset: "next"`
     - `limit: 5`
     - `sortBy: "priority"`

2. **Display Each Task**:
   - **Task ID**: [e.g., T042]
   - **Description**: [one-liner]
   - **Metadata**:
     - Phase: [phase]
     - Type: [type]
     - Priority: [high/medium/low]
     - Effort: [hours]
   - **Why Ready**: No blocking dependencies

3. **Recommend Starting Point**:
   - Analyze priorities
   - Consider current phase
   - Suggest which task to start first

4. **Offer Details**:
   - Ask if user wants to dive deeper into any specific task
   - Show related tasks if helpful

## Use Cases

- Starting a coding session
- Deciding what to work on next
- Daily planning
- Context switching between tasks
```

**agents/spec-writer.md:**
```markdown
---
description: Expert agent for creating high-quality, validated specifications
---

You are a **Specification Writer** expert using DinCoder's spec-driven methodology.

## Your Role

Help users create complete, unambiguous specifications that:
- Pass all validation checks
- Provide clear acceptance criteria
- Separate WHAT from HOW
- Flag assumptions as clarifications

## Workflow

### 1. Discovery Phase

Ask targeted questions to understand:

**Problem Space**:
- What problem are we solving?
- Why is this important? (Business value)
- What happens if we don't build this?

**Users & Stakeholders**:
- Who will use this?
- What are their needs/pain points?
- Any constraints from stakeholders?

**Success Criteria**:
- What does "done" look like?
- How will we measure success?
- What's the minimum viable version?

**Constraints**:
- Technical constraints (platforms, integrations)
- Business constraints (time, budget)
- Regulatory/compliance requirements

**Scope Boundaries**:
- What's explicitly included?
- What's explicitly excluded?
- Future enhancements (nice-to-have)?

### 2. Drafting Phase

Create `spec.md` with these sections:

**Goals** (WHY):
- Business objectives
- User value proposition
- Success metrics

**Requirements** (WHAT):
- Functional requirements (features)
- Non-functional requirements (performance, security, etc.)
- Integration requirements

**Acceptance Criteria** (TESTABLE):
- For each feature, write when/then statements:
  - "When [action], then [expected outcome]"
- Make criteria specific and measurable

**Edge Cases**:
- Error scenarios
- Boundary conditions
- Failure modes

**Out of Scope**:
- Features NOT in this version
- Related work for later
- Assumptions/dependencies

### 3. Validation Phase

Run quality checks:

```
Use tool: spec_validate
```

Check for:
- ✅ All required sections present
- ✅ Acceptance criteria are testable
- ✅ No unresolved clarifications
- ✅ No implementation details (HOW)

### 4. Refinement Phase

Fix any issues:

```
Use tool: spec_refine
Parameters:
  section: [goals|requirements|acceptance|edge-cases|full]
  changes: [specific updates in markdown]
  reason: [why this change is needed]
```

Iterate until validation passes.

### 5. Clarification Management

When you encounter ambiguities:

```
Use tool: clarify_add
Parameters:
  question: [specific question needing clarification]
  context: [where in spec this applies]
  options: [possible approaches to consider]
```

When user provides answers:

```
Use tool: clarify_resolve
Parameters:
  clarificationId: [e.g., CLARIFY-001]
  resolution: [the decision/answer]
  rationale: [reasoning behind decision]
```

## Quality Standards

**Completeness**: Every section filled with relevant details
**Testability**: Every feature has measurable acceptance criteria
**Clarity**: No ambiguous language, all assumptions flagged
**Scope Control**: Clear boundaries on what's in/out
**WHAT not HOW**: Zero implementation details in spec

## Communication Style

- **Ask before assuming**: Clarify ambiguities through questions
- **Be specific**: Avoid vague language like "user-friendly" or "fast"
- **Challenge scope creep**: Push back on feature bloat
- **Document decisions**: Use `clarify_resolve` to log rationale

## Tools You Use

- `specify_start`: Initialize .dincoder/ directory
- `specify_describe`: Write specification
- `spec_validate`: Run quality checks
- `spec_refine`: Update sections iteratively
- `clarify_add`: Flag ambiguities
- `clarify_resolve`: Resolve clarifications
- `clarify_list`: View all clarifications
- `research_append`: Log technical decisions

## Success Criteria

You've succeeded when:
1. `spec_validate` passes all checks
2. All clarifications are resolved
3. Acceptance criteria are testable
4. User confirms spec is complete
5. Ready to proceed to planning phase

Focus on quality over speed. A great spec saves time downstream.
```

**agents/plan-architect.md:**
```markdown
---
description: Expert agent for designing technical implementation plans
---

You are a **Plan Architect** expert using DinCoder's spec-driven methodology.

## Your Role

Transform validated specifications into detailed technical implementation plans that:
- Address all spec requirements
- Make sound architectural decisions
- Define clear milestones and phases
- Document technical trade-offs

## Prerequisites

Before you start:
1. Verify spec exists and is validated
2. Read spec thoroughly
3. Understand project constraints

## Workflow

### 1. Technical Discovery

Gather technical context:

**Technology Stack**:
- Frontend framework? (React, Vue, Svelte, etc.)
- Backend framework? (Node.js, Python, Go, etc.)
- Database? (PostgreSQL, MongoDB, etc.)
- Deployment? (AWS, Vercel, Docker, etc.)

**Architecture**:
- Pattern? (monolith, microservices, serverless)
- Existing codebase or greenfield?
- Integration points?

**Non-Functional Requirements**:
- Performance targets (latency, throughput)
- Security requirements (auth, encryption)
- Scalability needs
- Availability targets (uptime SLA)

### 2. Plan Creation

Generate implementation plan:

```
Use tool: plan_create
Parameters:
  constraintsText: |
    Technology Stack:
    - [stack details]

    Architecture:
    - [architecture choice]

    Performance:
    - [performance requirements]

    Security:
    - [security requirements]
```

### 3. Plan Structure

Ensure plan includes:

**Milestones**:
- Phase 1: [goal]
- Phase 2: [goal]
- Phase 3: [goal]

**Technical Decisions**:
- Decision: [choice made]
- Rationale: [why this choice]
- Trade-offs: [pros/cons]
- Alternatives considered: [other options]

**Architecture**:
- System components
- Data flow
- Integration points
- Deployment architecture

**Implementation Phases**:
1. Setup & scaffolding
2. Core functionality
3. Integrations
4. Testing & refinement
5. Deployment & monitoring

### 4. Validation

Check plan-spec alignment:

```
Use tool: artifacts_analyze
```

Verify:
- ✅ All spec requirements addressed
- ✅ No missing features
- ✅ Plan is technically feasible
- ✅ Phases are logical

### 5. Decision Documentation

Log key technical decisions:

```
Use tool: research_append
Parameters:
  topic: [decision area, e.g., "Database Choice"]
  content: |
    ## Decision
    [what was decided]

    ## Context
    [why this matters]

    ## Options Considered
    1. Option A: [pros/cons]
    2. Option B: [pros/cons]

    ## Choice
    Selected: [chosen option]

    ## Rationale
    [reasoning]

    ## Consequences
    [impact on project]
```

## Best Practices

**Architecture Decisions**:
- Start simple, scale as needed
- Choose boring technology (proven > trendy)
- Consider team expertise
- Balance performance vs. complexity

**Phasing**:
- Earliest valuable increment first
- Defer nice-to-haves
- Plan for iterative refinement
- Build in feedback loops

**Risk Management**:
- Identify technical risks early
- Prototype unknowns
- Plan for failure modes
- Document assumptions

## Communication Style

- **Explain trade-offs**: Every choice has pros/cons
- **Document reasoning**: Future you will thank you
- **Challenge complexity**: Simplicity is a feature
- **Be pragmatic**: Perfect is the enemy of good

## Tools You Use

- `artifacts_read`: Read spec.md
- `plan_create`: Generate implementation plan
- `artifacts_analyze`: Verify spec-plan alignment
- `research_append`: Log technical decisions

## Success Criteria

You've succeeded when:
1. `artifacts_analyze` shows full spec-plan alignment
2. All requirements mapped to implementation phases
3. Technical decisions documented with rationale
4. Plan is clear enough for task generation
5. User approves plan and is ready for `/tasks`

Focus on clarity and feasibility. A great plan is a roadmap, not a straightjacket.
```

**agents/task-manager.md:**
```markdown
---
description: Expert agent for managing tasks, tracking progress, and optimizing workflow
---

You are a **Task Manager** expert using DinCoder's spec-driven methodology.

## Your Role

Help users:
- Generate actionable task lists
- Track progress and velocity
- Identify blockers and bottlenecks
- Optimize workflow efficiency

## Capabilities

### Task Generation

Break down plans into granular tasks:

```
Use tool: tasks_generate
Parameters:
  scope: [context about granularity needed]
```

**Task Quality Standards**:
- Atomic (one clear deliverable)
- Completable in one session (1-8 hours)
- Includes metadata (phase, type, depends, priority, effort)
- Has clear acceptance criteria

### Progress Tracking

Monitor project health:

```
Use tool: tasks_stats
Parameters:
  groupBy: "all"
  includeCharts: true
  showBlockers: true
```

**Insights to Provide**:
- Completion percentage
- Velocity (tasks/day)
- Phase distribution
- Blocker analysis
- Risk indicators

### Task Filtering

Find relevant tasks:

```
Use tool: tasks_filter
Parameters:
  preset: [next | frontend | backend | ready | cleanup]
```

**Presets**:
- `next`: Unblocked, high-priority tasks
- `frontend`: Frontend work (unblocked)
- `backend`: Backend work (unblocked)
- `ready`: High-priority, unblocked tasks
- `cleanup`: Low-priority polish work

### Task Search

Locate specific tasks:

```
Use tool: tasks_search
Parameters:
  query: [search term]
  fuzzy: true
  fuzzyThreshold: 70
```

### Dependency Management

Visualize relationships:

```
Use tool: tasks_visualize
Parameters:
  format: "mermaid"
  includeCompleted: false
  groupByPhase: true
```

**Checks**:
- Circular dependencies (auto-detected)
- Critical path
- Parallelization opportunities

### Batch Operations

Efficient completion:

```
Use tool: tasks_tick_range
Parameters:
  taskIds: "T001-T005"  # or ["T001", "T003", "T007"]
  strict: false
```

## Workflow Optimization

### Daily Planning

1. Run `/next` to see actionable tasks
2. Recommend starting point based on:
   - Priority
   - Effort
   - Dependencies
   - Current phase

### Progress Reviews

1. Run `/progress` for comprehensive report
2. Highlight:
   - What's done
   - What's blocked
   - What's next
   - Any concerns

### Blocker Resolution

1. Identify blocked tasks
2. Check dependencies
3. Suggest completing blockers first
4. Re-prioritize if needed

## Best Practices

**Task Metadata**:
- Always add phase/type for filtering
- Set realistic effort estimates
- Mark dependencies explicitly
- Prioritize ruthlessly

**Progress Tracking**:
- Update status regularly (not batch)
- Mark tasks complete immediately
- Flag blockers early
- Celebrate wins

**Dependency Management**:
- Minimize dependencies (prefer parallel)
- Front-load risky tasks
- Defer polish work
- Avoid circular dependencies

## Communication Style

- **Be actionable**: Always suggest next steps
- **Be data-driven**: Use stats to support recommendations
- **Be proactive**: Flag risks before they become problems
- **Be encouraging**: Acknowledge progress

## Tools You Use

- `tasks_generate`: Create task list
- `tasks_visualize`: Show dependency graphs
- `tasks_filter`: Smart filtering
- `tasks_search`: Find tasks
- `tasks_stats`: Progress analytics
- `tasks_tick`: Mark single task complete
- `tasks_tick_range`: Batch completion

## Success Criteria

You've succeeded when:
1. Tasks are granular and actionable
2. Dependencies are clear and acyclic
3. User always knows what to work on next
4. Blockers are identified and resolved quickly
5. Progress is visible and measurable

Focus on keeping momentum. Small, frequent wins beat big, delayed victories.
```

**CLAUDE.md:**
```markdown
# DinCoder Plugin

This plugin provides a complete spec-driven development workflow using the DinCoder MCP server.

## Philosophy

**Spec-Driven Development** separates WHAT from HOW:

1. **Specify** - Define what to build (specification)
2. **Plan** - Design how to build it (technical plan)
3. **Execute** - Build following tasks (implementation)
4. **Track** - Monitor progress (analytics)

## Quick Start

### New Project

```
/spec
```

Guides you through creating a detailed specification.

### Existing Project

If you already have `.dincoder/spec.md`:

```
/plan     # Generate implementation plan
/tasks    # Break down into actionable tasks
/next     # Show what to work on now
```

## Available Commands

### Workflow Commands

- `/spec` - Create or refine specification
- `/plan` - Generate implementation plan
- `/tasks` - Generate actionable task list
- `/progress` - View progress report
- `/validate` - Check spec quality
- `/next` - Show next actionable tasks

### Specialized Agents

Type `@` to access agents:

- `@spec-writer` - Expert at creating validated specifications
- `@plan-architect` - Expert at designing technical plans
- `@task-manager` - Expert at managing tasks and progress

## File Structure

```
.dincoder/
├── spec.md          # Project specification (WHAT)
├── plan.md          # Implementation plan (HOW)
├── tasks.md         # Actionable task list
├── research.md      # Technical decisions log
└── constitution.json # Project principles
```

## MCP Tools Available

### Project Setup
- `specify_start` - Initialize .dincoder/ directory
- `prereqs_check` - Verify environment

### Specification
- `specify_describe` - Create spec.md
- `spec_validate` - Quality checks
- `spec_refine` - Update sections
- `clarify_add` / `clarify_resolve` / `clarify_list`

### Planning
- `plan_create` - Generate plan.md
- `artifacts_analyze` - Verify alignment

### Task Management
- `tasks_generate` - Create tasks.md
- `tasks_visualize` - Dependency graphs (Mermaid/Graphviz/ASCII)
- `tasks_filter` - Smart filtering (presets: next, frontend, backend, ready, cleanup)
- `tasks_search` - Fuzzy search
- `tasks_stats` - Progress analytics
- `tasks_tick` - Mark complete
- `tasks_tick_range` - Batch completion (T001-T005)

### Quality
- `quality_format` / `quality_lint` / `quality_test`
- `research_append` - Log decisions

## Workflow Example

```bash
# 1. Create specification
/spec
> I want to build a task management API...

# 2. Generate plan
/plan

# 3. Create tasks
/tasks

# 4. Check what's next
/next

# 5. Work on tasks...
# (Claude helps implement)

# 6. Track progress
/progress

# 7. Repeat
```

## Best Practices

### Specifications
- Focus on WHAT, not HOW
- Every feature needs testable acceptance criteria
- Flag assumptions as clarifications
- Be specific about what's out of scope

### Planning
- Start simple, scale as needed
- Document technical trade-offs
- Phase work for iterative delivery
- Log decisions to research.md

### Tasks
- Keep tasks atomic (1 session)
- Add metadata (phase, type, depends, priority, effort)
- Update status regularly
- Use batch operations for efficiency

### Progress Tracking
- Run `/progress` daily
- Focus on unblocked tasks
- Resolve blockers quickly
- Celebrate completed phases

## Quality Gates

✅ **Spec Validation** - Before planning
✅ **Plan-Spec Alignment** - Before tasks
✅ **Dependency Check** - Before starting tasks
✅ **Progress Review** - Regularly during execution

## Tips

- Use `/next` when you don't know what to work on
- Use `@spec-writer` for help writing specs
- Use `@task-manager` for progress insights
- Use `/validate` before moving to next phase
- Commit .dincoder/ to git for team sharing

## Support

- GitHub: https://github.com/dincoder/mcp-server
- npm: https://www.npmjs.com/package/mcp-dincoder
- Issues: https://github.com/dincoder/mcp-server/issues
```

**.mcp.json:**
```json
{
  "mcpServers": {
    "dincoder": {
      "command": "npx",
      "args": ["-y", "mcp-dincoder@latest"]
    }
  }
}
```

### Installation & Usage

**Users install with:**
```bash
# In any project
claude
> /plugin install dincoder/claude-plugin
```

**Plugin automatically:**
- ✅ Installs MCP server (npx -y mcp-dincoder)
- ✅ Adds slash commands (/spec, /plan, /tasks, /progress, /validate, /next)
- ✅ Provides specialized agents (@spec-writer, @plan-architect, @task-manager)
- ✅ Loads CLAUDE.md with methodology documentation

### Benefits

✅ **One-command install** - Everything bundled
✅ **Slash command convenience** - No MCP syntax needed
✅ **Specialized agents** - Expert guidance for each phase
✅ **Comprehensive docs** - CLAUDE.md auto-loaded
✅ **Version-locked** - Plugin version pins MCP server version

### Deliverables

1. ✅ Create `dincoder/claude-plugin` repository
2. ✅ Implement all commands and agents
3. ✅ Write comprehensive CLAUDE.md
4. ✅ Test installation flow
5. ✅ Publish to plugin marketplace
6. ✅ Update main repo README with plugin link

---

## Strategy C: VS Code Integration

**Status:** ⚡ **High Impact - Reaches GitHub Copilot Users**
**Effort:** 3-5 days
**Hosting:** Documentation in main repo + `.vscode/` templates

### Description

Provide VS Code workspace configuration templates and documentation for GitHub Copilot users to integrate DinCoder seamlessly.

### Technical Implementation

**Project Template: `.vscode/mcp.json`**
```json
{
  "mcpServers": {
    "dincoder": {
      "command": "npx",
      "args": ["-y", "mcp-dincoder@latest"],
      "env": {}
    }
  }
}
```

**Project Template: `.vscode/settings.json`**
```json
{
  "chat.mcp.access": "registry",
  "chat.mcp.discovery.enabled": true,
  "chat.mcp.approval": "workspace"
}
```

**Workspace Instructions: `.github/copilot-instructions.md`**
```markdown
# DinCoder Spec-Driven Development

This project uses DinCoder for spec-driven development workflows.

## MCP Tools Available

The DinCoder MCP server provides tools for structured development:

### Project Initialization
- `specify_start` - Initialize .dincoder/ directory
- `prereqs_check` - Verify environment setup

### Specification Phase
- `specify_describe` - Create detailed specification
- `spec_validate` - Check specification quality
- `spec_refine` - Update specific sections
- `clarify_add/resolve/list` - Manage clarifications

### Planning Phase
- `plan_create` - Generate technical implementation plan
- `artifacts_analyze` - Verify spec-plan alignment

### Task Management
- `tasks_generate` - Create actionable task list
- `tasks_visualize` - Show dependency graphs (Mermaid/Graphviz/ASCII)
- `tasks_filter` - Smart filtering (next, frontend, backend, ready, cleanup)
- `tasks_search` - Fuzzy search across tasks
- `tasks_stats` - Progress analytics and charts
- `tasks_tick` - Mark single task complete
- `tasks_tick_range` - Batch completion (T001-T005 syntax)

## Workflow

1. **Specify** - Define what to build
   - Run `specify_start` to initialize
   - Run `specify_describe` to create spec.md
   - Run `spec_validate` to ensure quality

2. **Plan** - Design how to build it
   - Run `plan_create` to generate plan.md
   - Run `artifacts_analyze` to verify alignment

3. **Execute** - Build following tasks
   - Run `tasks_generate` to create tasks.md
   - Run `tasks_filter` with preset "next" to see actionable items
   - Mark complete with `tasks_tick` or `tasks_tick_range`

4. **Track** - Monitor progress
   - Run `tasks_stats` for progress analytics
   - Run `tasks_visualize` for dependency graphs

## MCP Prompts (Slash Commands)

Use these slash commands in Copilot Chat (agent mode):

- `/mcp.dincoder.start_project` - Initialize new project
- `/mcp.dincoder.create_spec` - Create specification
- `/mcp.dincoder.generate_plan` - Generate implementation plan
- `/mcp.dincoder.create_tasks` - Generate task list
- `/mcp.dincoder.review_progress` - View progress report
- `/mcp.dincoder.validate_spec` - Check spec quality
- `/mcp.dincoder.next_tasks` - Show next actionable tasks

## File Structure

```
.dincoder/
├── spec.md          # What to build (requirements)
├── plan.md          # How to build it (architecture)
├── tasks.md         # Actionable task list
├── research.md      # Technical decisions log
└── constitution.json # Project principles
```

## Quality Gates

- ✅ Validate spec before planning (`spec_validate`)
- ✅ Verify plan-spec alignment (`artifacts_analyze`)
- ✅ Check dependencies before starting tasks (`tasks_visualize`)
- ✅ Track progress regularly (`tasks_stats`)

## Best Practices

**Specifications:**
- Focus on WHAT, not HOW
- Include testable acceptance criteria
- Flag ambiguities as clarifications

**Tasks:**
- Keep tasks atomic (1 session)
- Add metadata (phase, type, priority, effort)
- Use dependencies to enforce order

**Progress:**
- Update task status regularly
- Review progress with `tasks_stats`
- Focus on unblocked tasks first
```

### Usage in VS Code

**Initial Setup:**
```bash
# 1. Create project from template (or copy .vscode/ files)
# 2. Open in VS Code
# 3. MCP server auto-discovered

# 4. In Copilot Chat (agent mode):
#    Click tools icon → verify "dincoder" appears
```

**Slash Command Usage:**
```
# In Copilot Chat
/mcp.dincoder.start_project my-app

# Or reference tools with #
#dincoder.specify_start
```

**Resource Integration:**
```
# Add Context → MCP Resources
# Select dincoder resources (spec.md, plan.md, tasks.md)
```

### Benefits

✅ **Native VS Code integration** - No separate installations
✅ **GitHub Copilot compatibility** - Works with existing workflows
✅ **Workspace-level config** - Shareable via git
✅ **Enterprise-friendly** - IT can deploy managed configs
✅ **Autodiscovery** - Detects Claude Desktop configs

### Deliverables

1. ✅ Create `.vscode/` template files
2. ✅ Write `.github/copilot-instructions.md`
3. ✅ Add VS Code setup guide to README
4. ✅ Create video tutorial
5. ✅ Test with GitHub Copilot Free/Pro/Enterprise

---

## Strategy D: OpenAI Codex Integration

**Status:** 🔧 **Emerging - Codex is New**
**Effort:** 2-3 days
**Hosting:** Documentation in main repo + config templates

### Description

Provide configuration templates and instructions for OpenAI Codex (CLI and IDE extension) users.

### Technical Implementation

**Config Template: `~/.codex/config.toml`**
```toml
[mcp_servers.dincoder]
command = "npx"
args = ["-y", "mcp-dincoder@latest"]

# Optional: Timeout configuration
startup_timeout_sec = 30
tool_timeout_sec = 120
```

**Workspace Template: `.codex/instructions.md`**
```markdown
# DinCoder Spec-Driven Development

This project uses DinCoder MCP server for structured development workflows.

## Available Tools

The DinCoder MCP server provides 26 tools organized by phase:

### Project Setup
- `specify_start` - Initialize .dincoder/ directory structure
- `prereqs_check` - Verify Node.js, npm, git availability
- `constitution_create` - Define project principles and constraints

### Specification Phase (WHAT)
- `specify_describe` - Create detailed specification
- `spec_validate` - Check quality (4 validation rules)
- `spec_refine` - Update specific sections
- `clarify_add` / `clarify_resolve` / `clarify_list` - Manage ambiguities

### Planning Phase (HOW)
- `plan_create` - Generate technical implementation plan
- `artifacts_analyze` - Verify spec-plan alignment

### Task Management
- `tasks_generate` - Create actionable task list
- `tasks_visualize` - Mermaid/Graphviz/ASCII dependency graphs
- `tasks_filter` - Smart presets (next, frontend, backend, ready, cleanup)
- `tasks_search` - Fuzzy search with Levenshtein distance
- `tasks_stats` - Progress analytics with charts
- `tasks_tick` - Mark single task complete
- `tasks_tick_range` - Batch completion (T001-T005 syntax)

### Quality & Research
- `quality_format` / `quality_lint` / `quality_test`
- `research_append` - Log technical decisions

## Workflow Commands

Use MCP prompts as workflows:

```bash
# Initialize new project
codex "use /mcp.dincoder.start_project my-app"

# Create specification
codex "use /mcp.dincoder.create_spec 'Build a REST API for task management'"

# Generate plan
codex "use /mcp.dincoder.generate_plan"

# Create tasks
codex "use /mcp.dincoder.create_tasks"

# Review progress
codex "use /mcp.dincoder.review_progress"
```

## Spec-Driven Methodology

1. **Specify** - Define requirements
   - What are we building?
   - Who is it for?
   - What does success look like?

2. **Plan** - Design solution
   - How will we build it?
   - What's the architecture?
   - What are the milestones?

3. **Execute** - Implement tasks
   - Break down into atomic tasks
   - Track dependencies
   - Monitor progress

4. **Validate** - Ensure quality
   - Validate spec before planning
   - Verify plan-spec alignment
   - Track task completion

## File Structure

```
.dincoder/
├── spec.md          # Requirements (WHAT)
├── plan.md          # Architecture (HOW)
├── tasks.md         # Actionable items
├── research.md      # Technical decisions
└── constitution.json # Project principles
```

## Task Metadata Format

Tasks support metadata for advanced filtering:

```markdown
- [ ] Task description (phase: setup, type: backend, depends: T001, priority: high, effort: 3)
```

**Metadata fields:**
- `phase`: setup | implementation | testing | polish
- `type`: frontend | backend | devops | testing | docs
- `depends`: Comma-separated task IDs (T001, T002)
- `priority`: high | medium | low
- `effort`: Estimated hours (1-8)
- `tags`: Custom tags for filtering

## Best Practices

**Specifications:**
- Focus on WHAT, not HOW
- Include testable acceptance criteria (when/then statements)
- Flag assumptions as clarifications
- Be explicit about out-of-scope items

**Plans:**
- Document architectural decisions with rationale
- Include trade-off analysis
- Phase work for iterative delivery
- Log key decisions to research.md

**Tasks:**
- Keep atomic (completable in one session)
- Add metadata for filtering
- Use dependencies to enforce order
- Update status regularly

**Progress:**
- Run `tasks_stats` regularly
- Focus on unblocked tasks
- Visualize dependencies before starting
- Celebrate completed milestones
```

### Setup Instructions

**CLI Installation:**
```bash
# Add DinCoder MCP server
codex mcp add dincoder -- npx -y mcp-dincoder@latest

# Verify installation
codex mcp list
```

**IDE Extension:**
```bash
# In VS Code/Cursor/Windsurf:
# 1. Click gear icon in Codex panel
# 2. Select "MCP settings > Open config.toml"
# 3. Add dincoder server configuration
# 4. Restart Codex
```

### Benefits

✅ **CLI and IDE support** - Works in both environments
✅ **Shared config** - Same setup for CLI and extension
✅ **Prompt support** - MCP prompts as workflow commands
✅ **OAuth support** - For future cloud integrations

### Deliverables

1. ✅ Create config.toml template
2. ✅ Write .codex/instructions.md
3. ✅ Add Codex setup guide to README
4. ✅ Test with Codex CLI and IDE extension
5. ✅ Document approval modes

---

## Strategy E: Project Templates

**Status:** 🎁 **Easiest for End Users**
**Effort:** 2-3 days
**Hosting:** Separate template repositories

### Description

Create GitHub template repositories pre-configured with DinCoder for different platforms (Claude Code, VS Code, universal).

### Repository Structure

**dincoder/template-claude:**
```
template-claude/
├── .claude/
│   ├── CLAUDE.md (DinCoder methodology docs)
│   └── settings.json (auto-enable dincoder plugin)
├── .github/
│   └── workflows/ (optional CI/CD)
├── .gitignore
├── README.md (project-specific)
└── package.json (optional)
```

**dincoder/template-vscode:**
```
template-vscode/
├── .vscode/
│   ├── mcp.json (dincoder server config)
│   └── settings.json (Copilot MCP settings)
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/ (optional CI/CD)
├── .gitignore
├── README.md
└── package.json (optional)
```

**dincoder/template-universal:**
```
template-universal/
├── .dincoder/
│   └── README.md (placeholder, explains workflow)
├── .mcp.json (generic MCP config)
├── DINCODER.md (methodology documentation)
├── .gitignore
├── README.md
└── package.json (optional)
```

### Usage

**Create from template:**
```bash
# GitHub CLI
gh repo create my-project --template dincoder/template-claude

# GitHub Web UI
# Use template → dincoder/template-claude

cd my-project
claude  # or code . or codex
> /spec  # Start immediately
```

### Benefits

✅ **Zero configuration** - Pre-configured for specific platform
✅ **Instant start** - Create and go
✅ **Best practices** - Templates include recommended setup
✅ **Multiple platforms** - Different templates for different tools

### Deliverables

1. ✅ Create template-claude repository
2. ✅ Create template-vscode repository
3. ✅ Create template-universal repository
4. ✅ Mark as GitHub templates
5. ✅ Add usage docs to main README

---

## Implementation Roadmap

### Phase 1: Universal Foundation (Week 1)

**Strategy A: MCP Prompts** ⭐ **HIGHEST PRIORITY**

- [ ] Day 1-2: Implement prompt handlers in createServer.ts
  - [ ] ListPromptsRequestSchema handler
  - [ ] GetPromptRequestSchema handler
  - [ ] 7 workflow prompts (start_project, create_spec, generate_plan, create_tasks, review_progress, validate_spec, next_tasks)
- [ ] Day 2-3: Testing
  - [ ] Test with Claude Desktop
  - [ ] Test with VS Code Copilot
  - [ ] Test with OpenAI Codex
- [ ] Day 3: Documentation
  - [ ] Update README with prompt examples
  - [ ] Add to CLAUDE.md
  - [ ] Create prompt usage guide
- [ ] Day 3: Release
  - [ ] Bump version to 0.3.1 or 0.4.0
  - [ ] Update CHANGELOG.md
  - [ ] Publish to npm

**Outcome:** All MCP-compatible assistants get discoverable workflows

---

### Phase 2: Platform-Specific Integration (Week 2-3)

**Strategy C: VS Code Integration** (Week 2, Days 1-3)

- [ ] Day 1: Create templates
  - [ ] .vscode/mcp.json template
  - [ ] .vscode/settings.json template
  - [ ] .github/copilot-instructions.md
- [ ] Day 2: Documentation
  - [ ] VS Code setup guide
  - [ ] Video tutorial
- [ ] Day 3: Testing
  - [ ] Test with Copilot Free/Pro/Enterprise
  - [ ] Verify tool discovery
  - [ ] Test prompt slash commands

**Strategy D: OpenAI Codex Integration** (Week 2, Days 4-5)

- [ ] Day 4: Create templates
  - [ ] config.toml template
  - [ ] .codex/instructions.md
- [ ] Day 5: Documentation & Testing
  - [ ] Codex setup guide
  - [ ] Test CLI and IDE extension
  - [ ] Verify approval modes

**Outcome:** Native integration for VS Code and Codex users

---

### Phase 3: Premium Experience (Week 3-4)

**Strategy B: Claude Code Plugin** (Week 3-4)

- [ ] Week 3, Days 1-2: Repository setup
  - [ ] Create dincoder/claude-plugin repo
  - [ ] Set up directory structure
  - [ ] Create plugin.json
- [ ] Week 3, Days 3-5: Commands
  - [ ] Write spec.md command
  - [ ] Write plan.md command
  - [ ] Write tasks.md command
  - [ ] Write progress.md command
  - [ ] Write validate.md command
  - [ ] Write next.md command
- [ ] Week 4, Days 1-2: Agents
  - [ ] Write spec-writer.md agent
  - [ ] Write plan-architect.md agent
  - [ ] Write task-manager.md agent
- [ ] Week 4, Day 3: Documentation
  - [ ] Write comprehensive CLAUDE.md
  - [ ] Create README.md
  - [ ] Add usage examples
- [ ] Week 4, Days 4-5: Testing & Release
  - [ ] Test installation flow
  - [ ] Test all commands and agents
  - [ ] Publish to plugin marketplace
  - [ ] Update main repo README

**Outcome:** Premium bundled experience for Claude Code users

---

### Phase 4: Templates & Distribution (Week 5)

**Strategy E: Project Templates**

- [ ] Days 1-2: Create templates
  - [ ] template-claude
  - [ ] template-vscode
  - [ ] template-universal
- [ ] Day 3: Documentation
  - [ ] Template usage guides
  - [ ] README files
- [ ] Days 4-5: Marketing
  - [ ] Blog post: "Getting Started with DinCoder"
  - [ ] Video tutorials
  - [ ] Social media announcements

**Outcome:** Multiple entry points for new users

---

## Cross-Platform Comparison

| Feature | Claude Code | VS Code Copilot | OpenAI Codex | Universal |
|---------|-------------|-----------------|--------------|-----------|
| **MCP Server** | ✅ Native | ✅ Native | ✅ Native | ✅ Via config |
| **MCP Prompts** | ✅ `/mcp__dincoder__*` | ✅ `/mcp.dincoder.*` | ✅ `/mcp.dincoder.*` | ✅ Platform-specific |
| **Slash Commands** | ✅ Plugin | ✅ Built-in | ✅ Built-in | ❌ N/A |
| **Agents** | ✅ Plugin | ❌ N/A | ❌ N/A | ❌ N/A |
| **CLAUDE.md** | ✅ Auto-load | ❌ Manual | ❌ Manual | ✅ Custom file |
| **Workspace Config** | ✅ .claude/ | ✅ .vscode/ | ✅ .codex/ | ✅ .mcp.json |
| **Installation** | `/plugin install` | Manual .vscode/ | `codex mcp add` | Manual config |
| **Discoverability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## Success Metrics

### Adoption Metrics
- npm downloads of mcp-dincoder
- Plugin installs (Claude Code)
- GitHub template uses
- MCP prompt invocations

### Engagement Metrics
- Average tools used per session
- Spec → Plan → Tasks completion rate
- Task completion velocity
- Quality gate pass rate

### Quality Metrics
- Spec validation pass rate
- Plan-spec alignment score
- Task dependency graph health
- User-reported issues

---

## Next Steps

1. **Immediate (This Week):**
   - Implement Strategy A (MCP Prompts)
   - Test across platforms
   - Publish v0.3.1 or v0.4.0

2. **Short-term (Next 2 Weeks):**
   - Document VS Code and Codex integration
   - Create setup guides
   - Record video tutorials

3. **Medium-term (Next Month):**
   - Build Claude Code plugin
   - Create project templates
   - Publish to marketplaces

4. **Long-term (Next Quarter):**
   - Gather user feedback
   - Iterate on workflows
   - Add platform-specific optimizations

---

## Appendix

### MCP Prompts Specification

**Reference:** https://modelcontextprotocol.io/specification/2025-06-18/server/prompts

**Key Points:**
- Prompts are templates that become slash commands
- Support arguments with descriptions and required flags
- Return messages in user/assistant format
- Can embed resources for rich context
- Validated and discoverable through protocol

### Claude Code Plugin Specification

**Reference:** https://docs.claude.com/en/docs/claude-code/plugins

**Key Points:**
- Bundle commands, agents, MCP servers, hooks
- Install with `/plugin install owner/repo`
- Distribution via marketplaces
- Version-locked dependencies

### VS Code MCP Integration

**Reference:** https://code.visualstudio.com/docs/copilot/customization/mcp-servers

**Key Points:**
- Configuration in .vscode/mcp.json
- Autodiscovery from other apps
- Tool limit of 128 concurrent
- Trust confirmation dialogs

### OpenAI Codex MCP Integration

**Reference:** https://developers.openai.com/codex/mcp/

**Key Points:**
- Config in ~/.codex/config.toml
- Shared between CLI and IDE
- OAuth support via experimental flag
- Approval modes (agent, chat, full-access)

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-16
**Maintainer:** DinCoder Team
**License:** MIT
