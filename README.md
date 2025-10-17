<div align="center">
  <img width="320" alt="Image@0 5x" src="https://github.com/user-attachments/assets/defd2ef0-5804-431c-8549-618eb3434aee" />
</div>

[![smithery badge](https://smithery.ai/badge/@flight505/mcp_dincoder)](https://smithery.ai/server/@flight505/mcp_dincoder)

**D**riven **I**ntent **N**egotiation — **C**ontract-**O**riented **D**eterministic **E**xecutable **R**untime

> *The MCP implementation of GitHub's Spec Kit methodology — transforming specifications into executable artifacts*

---

## Table of Contents

- [What is DinCoder?](#-what-is-dincoder)
- [Installation](#-installation)
- [Quickstart](#-quickstart)
- [MCP Prompts (AI Workflow Orchestration)](#-mcp-prompts-ai-workflow-orchestration)
- [Complete Workflow](#-complete-workflow-guide)
- [Available Tools](#-available-tools)
- [Examples](#-examples)
- [Why Spec-Driven Development?](#-why-spec-driven-development)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## 🎯 What is DinCoder?

**An official Model Context Protocol server implementing GitHub's Spec-Driven Development (SDD) methodology**

DinCoder brings the power of [GitHub Spec Kit](https://github.com/github/spec-kit) to any AI coding agent through the Model Context Protocol. It transforms the traditional "prompt-then-code-dump" workflow into a systematic, specification-driven process where **specifications don't serve code—code serves specifications**.

### What's New in v0.4.0 (Integration & Discovery Update)

#### 🎯 MCP Prompts - AI Workflow Orchestration ✨

- **7 workflow prompts** that guide AI agents through complex tasks
- **Automatic discovery**: AI agents find and use prompts programmatically
- **Built-in guidance**: Each prompt includes comprehensive workflow instructions
- **Works everywhere**: Claude Code, VS Code Copilot, OpenAI Codex, Cursor
- **Natural language**: Just describe what you want - AI uses appropriate prompts automatically

**Available Prompts:**
- `start_project` - Initialize new spec-driven project
- `create_spec` - Create feature specification
- `generate_plan` - Generate implementation plan
- `create_tasks` - Break down into actionable tasks
- `review_progress` - Generate progress report
- `validate_spec` - Check specification quality
- `next_tasks` - Show actionable tasks

**Note:** These are NOT slash commands you type. They're workflow templates that your AI agent uses automatically when you describe your goals!

#### 🧬 Constitution Tool - Define Your Project's DNA

- **New command:** `constitution_create`
- Set project-wide principles, constraints, and preferences
- Ensures consistency across all AI-generated code

#### ❓ Clarification Tracking - Systematic Q&A Management

- **New commands:** `clarify_add`, `clarify_resolve`, `clarify_list`
- Track ambiguities with unique IDs (CLARIFY-001, CLARIFY-002, etc.)
- Resolve uncertainties with rationale and audit trail

---

## 📦 Installation

### Prerequisites

- Node.js >= 20.0.0
- npm or pnpm
- An MCP-compatible coding assistant with automatic workspace binding (Cursor, Claude Code, Codex, etc.)

### Installing via Smithery

To install DinCoder automatically via [Smithery](https://smithery.ai/server/@flight505/mcp_dincoder):

```bash
npx -y @smithery/cli install @flight505/mcp_dincoder
```

### Claude Code / VS Code Users

```bash
claude mcp add dincoder -- npx -y mcp-dincoder@latest
```

### Cursor

Configure the MCP server inside Cursor's MCP settings; once you select a project, Cursor injects the workspace path automatically.

### Other MCP Clients

Install globally:
```bash
npm install -g mcp-dincoder@latest
```

> **Recommended clients:** DinCoder expects the MCP client to bind the active project directory automatically so generated specs, plans, and tasks land in the repo you are working on. Cursor, Claude Code, and Codex do this for every request. Claude Desktop's chat UI does not, so commands default to the server's own install directory; only use Claude Desktop if you plan to pass `workspacePath` manually on each call.

### 📁 Where Files Are Created

**Important:** DinCoder creates all files in your **current working directory** (where you run your AI agent from).

```bash
your-project/
├── specs/                    # Created automatically
│   ├── 001-feature-name/    # Feature directory (auto-numbered)
│   │   ├── constitution.md  # Project principles (optional, recommended first step)
│   │   ├── spec.md          # Requirements & user stories
│   │   ├── plan.md          # Technical implementation plan
│   │   ├── tasks.md         # Executable task list
│   │   ├── research.md      # Technical decisions & research
│   │   ├── clarifications.json  # Q&A tracking
│   │   └── contracts/       # API contracts, data models
│   └── 002-next-feature/
└── .dincoder/               # Backward compatibility (legacy)
```

**Tip:** Launch your MCP client from the project root so every tool writes into the correct repo.

---

## 🚀 Quickstart

### The Spec Kit Workflow

Transform ideas into production-ready code through three powerful commands:

#### 1️⃣ `/specify` — Transform Ideas into Specifications

```bash
/specify Build a team productivity platform with Kanban boards and real-time collaboration
```

**What happens:**
- Automatic feature numbering (001, 002, 003...)
- Branch creation with semantic names
- Template-based specification generation
- Structured requirements with user stories
- Explicit uncertainty markers `[NEEDS CLARIFICATION]`

**Output:** A comprehensive PRD focusing on WHAT users need and WHY—never HOW to implement.

#### 2️⃣ `/plan` — Map Specifications to Technical Decisions

```bash
/plan Use Next.js with Prisma and PostgreSQL, WebSockets for real-time updates
```

**What happens:**
- Analyzes feature specification
- Ensures constitutional compliance (architectural principles)
- Translates requirements to technical architecture
- Generates data models, API contracts, test scenarios
- Documents technology rationale

**Output:** Complete implementation plan with every decision traced to requirements.

#### 3️⃣ `/tasks` — Generate Executable Task Lists

```bash
/tasks
```

**What happens:**
- Analyzes plan and contracts
- Converts specifications into granular tasks
- Marks parallelizable work `[P]`
- Orders tasks by dependencies
- Creates test-first implementation sequence

**Output:** Numbered task list ready for systematic implementation.

### Real-World Example: Building a Chat System

<details>
<summary><strong>See how SDD transforms traditional development (click to expand)</strong></summary>

#### Traditional Approach (12+ hours of documentation)
```text
1. Write PRD in document (2-3 hours)
2. Create design documents (2-3 hours)
3. Set up project structure (30 minutes)
4. Write technical specs (3-4 hours)
5. Create test plans (2 hours)
```

#### SDD with DinCoder (15 minutes total)

```bash
# Step 1: Create specification (5 minutes)
/specify Real-time chat with message history, user presence, and typing indicators

# Automatically creates:
# - Branch "003-real-time-chat"
# - specs/003-real-time-chat/spec.md with:
#   • User stories and personas
#   • Acceptance criteria
#   • [NEEDS CLARIFICATION] markers for ambiguities

# Step 2: Generate implementation plan (5 minutes)
/plan WebSocket for real-time, PostgreSQL for history, Redis for presence

# Generates:
# - plan.md with phased implementation
# - data-model.md (Message, User, Channel schemas)
# - contracts/websocket-events.json
# - contracts/rest-api.yaml
# - research.md with library comparisons

# Step 3: Create task list (5 minutes)
/tasks

# Produces executable tasks:
# 1. [P] Create WebSocket contract tests
# 2. [P] Create REST API contract tests
# 3. Set up PostgreSQL schema
# 4. Implement message persistence
# 5. Add Redis presence tracking
# ... (numbered, ordered, parallelizable)
```

**Result:** Complete, executable specifications ready for any AI agent to implement.

</details>

---

## 🎯 MCP Prompts (AI Workflow Orchestration)

**New in v0.4.0:** DinCoder includes 7 MCP prompts that provide guided workflows for AI agents. These are **NOT slash commands** you type—they're workflow templates that your AI agent (Claude, Copilot, etc.) automatically discovers and uses to help you.

### How MCP Prompts Work

MCP prompts are **invisible to users** but powerful for AI agents:

1. **AI Discovery**: When DinCoder is connected, your AI agent automatically discovers available prompts via the MCP protocol
2. **AI Invocation**: The AI agent invokes prompts programmatically when they're relevant to your task
3. **Workflow Guidance**: Each prompt includes comprehensive instructions for multi-step workflows
4. **Tool Orchestration**: Prompts guide the AI to call multiple DinCoder tools in the correct sequence

**You don't "run" these prompts directly.** Just describe what you want in natural language, and your AI agent will use the appropriate prompt workflow automatically!

### Available Workflow Prompts

| Prompt Name | When AI Uses It | What It Does |
|-------------|-----------------|--------------|
| `start_project` | You ask to "start a new project" | Initializes .dincoder/, creates spec template |
| `create_spec` | You describe a feature to build | Generates comprehensive specification |
| `generate_plan` | You ask for implementation plan | Creates technical architecture from spec |
| `create_tasks` | You ask to break down work | Generates executable task list from plan |
| `review_progress` | You ask "how's it going?" | Shows statistics, charts, next actions |
| `validate_spec` | You ask to check spec quality | Runs quality gates before implementation |
| `next_tasks` | You ask "what's next?" | Shows unblocked, actionable tasks |

### Example: How Prompts Guide AI Workflows

**You say:** "Let's start a new task manager project"

**AI thinks:** *This matches the `start_project` prompt. Let me follow its workflow...*

**AI does:**
1. Calls `specify_start` tool with projectName="task-manager"
2. Explains the .dincoder/ structure created
3. Asks what you want to build
4. Calls `specify_describe` with your requirements
5. Validates spec with `spec_validate`
6. Suggests next steps

**You don't see:** The prompt invocation—just the AI following the workflow naturally!

<details>
<summary><strong>See detailed prompt workflows (click to expand)</strong></summary>

#### 1. `start_project` - Initialize New Spec-Driven Project

**AI receives this workflow when you want to start a project:**

```
1. Call `specify_start` with projectName and agent type
2. Explain .dincoder/ directory structure to user
3. Explain spec-driven workflow: Specify → Plan → Execute
4. Ask what they want to build
5. Guide through specification creation
```

**Example conversation:**
- You: "I want to start a new e-commerce project"
- AI: *Invokes start_project prompt, follows workflow*
- AI: "I'll initialize a new spec-driven project. What features should the e-commerce platform have?"

---

#### 2. `create_spec` - Create Feature Specification

**AI receives this workflow when you describe a feature:**

```
1. Check if .dincoder/ exists (run specify_start if not)
2. Gather requirements by asking:
   - What problem does this solve?
   - Who are the users?
   - What are success criteria?
   - What's out of scope?
3. Call `specify_describe` with complete specification
4. Call `spec_validate` to check quality
5. Address validation issues with `spec_refine`
6. Confirm spec is complete
```

**Example conversation:**
- You: "Build a real-time chat feature with typing indicators"
- AI: *Invokes create_spec prompt, asks clarifying questions*
- AI: "Let me create a specification. Should the chat support file attachments?"

---

#### 3. `generate_plan` - Generate Implementation Plan

**AI receives this workflow when planning is needed:**

```
1. Verify spec exists (guide user to create if missing)
2. Run `spec_validate` if not already validated
3. Call `plan_create` with technical constraints
4. Call `artifacts_analyze` to verify spec-plan alignment
5. Present plan structure to user
6. Ask if ready for task generation
```

**Example conversation:**
- You: "How should we implement this?"
- AI: *Invokes generate_plan prompt*
- AI: "I'll create a technical plan. What's your preferred tech stack? (Next.js, Python/FastAPI, etc.)"

---

#### 4. `create_tasks` - Break Down into Actionable Tasks

**AI receives this workflow for task generation:**

```
1. Verify plan exists (guide to create if missing)
2. Call `tasks_generate` with granular scope
3. Call `tasks_visualize` to show dependency graph
4. Call `tasks_stats` to show effort estimates
5. Call `tasks_filter` with preset:"next" for actionable items
6. Guide user to start first task
```

**Example conversation:**
- You: "Let's break this down into tasks"
- AI: *Invokes create_tasks prompt*
- AI: "I've generated 23 tasks. Here's the dependency graph... Ready to start with T001?"

---

#### 5. `review_progress` - Generate Progress Report

**AI receives this workflow for progress checks:**

```
1. Call `tasks_stats` with charts and blockers
2. Call `tasks_filter` preset:"next" for actionable items
3. Call `tasks_search` for in-progress tasks
4. Summarize in structured format:
   - Overall completion %
   - Recent accomplishments
   - Current work
   - Next actions (unblocked)
   - Blockers
   - Recommendations
5. Include visual progress charts
```

**Example conversation:**
- You: "How's the project coming along?"
- AI: *Invokes review_progress prompt*
- AI: "We're 67% complete (15/23 tasks). 3 tasks in progress, 2 blocked. Next up: authentication tests."

---

#### 6. `validate_spec` - Check Specification Quality

**AI receives this workflow for validation:**

```
1. Call `spec_validate` with all checks enabled
2. Check for:
   - Completeness (all required sections)
   - Acceptance criteria (testable when/then)
   - Clarifications (no unresolved markers)
   - Implementation leakage (no HOW in WHAT)
3. Call `clarify_list` for pending questions
4. If validation fails:
   - List specific issues
   - Call `spec_refine` to fix
   - Re-validate
5. If passes: suggest `plan_create` next
```

**Example conversation:**
- You: "Is the spec ready for implementation?"
- AI: *Invokes validate_spec prompt*
- AI: "Validation found 2 issues: missing edge cases section, 1 unresolved clarification. Let me fix these..."

---

#### 7. `next_tasks` - Show Next Actionable Tasks

**AI receives this workflow when you ask what's next:**

```
1. Call `tasks_filter` with preset:"next" and priority sorting
2. For each task display:
   - Task ID and description
   - Metadata (phase, type, priority, effort)
   - Why it's actionable
3. Recommend which task to start based on:
   - Priority level
   - Dependencies completed
   - Effort estimate
4. Offer task details on request
```

**Example conversation:**
- You: "What should I work on next?"
- AI: *Invokes next_tasks prompt*
- AI: "Top priority: T007 (Implement user authentication, effort: 5). It's unblocked and high priority. Want to start?"

</details>

### Platform Compatibility

MCP prompts work across all MCP-compatible clients:

| Client | How It Works |
|--------|--------------|
| **Claude Code** | Prompts auto-discovered; AI uses them automatically when relevant |
| **VS Code Copilot** | Prompts available in agent mode; AI invokes based on context |
| **OpenAI Codex** | Prompts accessible via MCP protocol; AI uses for complex workflows |
| **Cursor** | MCP prompts integrated into agent workflows |

### The Key Difference: MCP Prompts vs Slash Commands

**Important distinction:**

- **MCP Prompts** (DinCoder workflows): AI agents use these programmatically. You don't type them.
- **Slash Commands** (Native): User-typed commands like `/help`, `/clear` in Claude Code
- **Custom Commands** (`.claude/commands/`): Project-specific slash commands you create

**In practice:** You describe what you want in natural language ("Let's start a new project"), and your AI agent automatically uses the appropriate MCP prompt workflow!

---

## 🔌 Claude Code Plugin (Premium Experience)

**New in v0.5.0:** For the best Claude Code experience, install the **DinCoder Plugin** which bundles slash commands, specialized agents, and the MCP server into a single package.

### Installation

```bash
# In Claude Code
/plugin install dincoder/claude-plugin
```

After installation, restart Claude Code to activate the plugin.

### What's Included

✨ **Slash Commands** - Quick access without memorizing tool names
- `/spec` - Create or refine specification
- `/plan` - Generate implementation plan
- `/tasks` - Break down into actionable tasks
- `/progress` - View progress report
- `/validate` - Check spec quality
- `/next` - Show next actionable tasks

🤖 **Specialized Agents** - Expert assistance for each phase
- `@spec-writer` - Expert at creating validated specifications
- `@plan-architect` - Expert at designing technical plans
- `@task-manager` - Expert at managing tasks and progress

🔧 **Automatic MCP Server** - Installs and configures `mcp-dincoder` automatically

📝 **Built-in Documentation** - CLAUDE.md loads automatically with methodology guide

### Plugin vs MCP Server Only

| Feature | Plugin | MCP Server Only |
|---------|--------|-----------------|
| **Slash Commands** | ✅ `/spec`, `/plan`, etc. | ❌ Use tool names directly |
| **Specialized Agents** | ✅ `@spec-writer`, etc. | ❌ Not available |
| **Documentation** | ✅ Auto-loaded CLAUDE.md | ❌ Manual reference |
| **Installation** | ✅ One command | ⚠️ Manual MCP config |
| **Updates** | ✅ Version-locked | ⚠️ Manual upgrade |

**Recommendation:** Use the plugin for the best experience. Only use the MCP server directly if you're on VS Code, Codex, or another MCP client.

**Plugin Repository:** [dincoder/claude-plugin](https://github.com/dincoder/claude-plugin)

---

## 🚦 Complete Workflow Guide

This is your end-to-end guide for using DinCoder with any AI agent (Claude, Copilot, Gemini, Cursor).

### Step-by-Step: From Idea to Implementation

#### 0️⃣ **Define Project Constitution** (Optional but Recommended, 2-3 minutes)

```typescript
// In your AI agent's chat:
"Use constitution_create to define principles for 'task-manager' with these details:

Principles:
- Prefer functional programming over OOP
- Write tests before implementation (TDD)
- Keep bundle size under 500KB

Constraints:
- Node.js >= 20.0.0 required
- Maximum 3 external dependencies for core functionality

Preferences:
- Libraries: React Query over Redux, Zod for validation
- Patterns: Repository pattern for data access"

// What happens:
// ✓ Creates specs/001-task-manager/ directory
// ✓ Generates constitution.md with structured principles
// ✓ All future specs/plans will respect these constraints
```

**Why use this:** Constitution ensures consistency across your entire project. AI agents will reference these principles when generating specs and plans.

#### 1️⃣ **Start a New Project** (1 minute)

```typescript
"Use specify_start to initialize a new project called 'task-manager' with claude agent"

// What happens:
// ✓ Creates specs/001-task-manager/ directory
// ✓ Generates spec.md template
// ✓ Creates contracts/ folder
// ✓ Initializes research.md
```

#### 2️⃣ **Describe What You Want** (2-5 minutes)

```typescript
"Use specify_describe with this description:
Build a task management system where users can:
- Create tasks with titles, descriptions, and due dates
- Organize tasks into projects
- Mark tasks as complete
- Filter by status and project
- Get daily summary emails"

// What happens:
// ✓ Updates spec.md with user stories
// ✓ Adds acceptance criteria
// ✓ Marks uncertainties with [NEEDS CLARIFICATION]
// ✓ Separates WHAT from HOW
```

**Pro tip**: Be specific about user needs, not implementation. Focus on **what users want** and **why they need it**.

#### 3️⃣ **Track Clarifications** (Optional)

```typescript
// If you notice ambiguities while writing specs:
"Use clarify_add with this question:
'Should task due dates support time zones or just dates?'
with context 'Task scheduling requirements'"

// Later, when you have an answer:
"Use clarify_resolve for CLARIFY-001 with resolution:
'Use UTC timestamps with user timezone preference.'"

// Check all clarifications:
"Use clarify_list to see all pending clarifications"
```

#### 4️⃣ **Generate Technical Plan** (2-5 minutes)

```typescript
"Use plan_create with these constraints:
- Next.js 14 with App Router
- PostgreSQL with Prisma ORM
- tRPC for type-safe APIs
- Tailwind CSS for styling"

// What happens:
// ✓ Creates plan.md with phased approach
// ✓ Generates data-model.md (Task, Project, User schemas)
// ✓ Updates research.md with architecture decisions
// ✓ Enforces constitutional compliance
```

#### 5️⃣ **Create Implementation Tasks** (2-5 minutes)

```typescript
"Use tasks_generate with scope 'MVP - core task management'"

// What happens:
// ✓ Creates tasks.md with numbered, ordered tasks
// ✓ Marks parallelizable tasks with [P]
// ✓ Orders by dependency (contracts → tests → implementation)
```

#### 6️⃣ **Implement Systematically**

```typescript
// Start with first task
"Let's implement T001 - Create Prisma schema for Task model"

// After completing a task
"Use tasks_tick with taskId 'T001'"

// See what's next
"Use artifacts_read with artifactType 'tasks'"
```

### 🎯 Best Practices

1. **Start Small**: Begin with MVP scope, add features iteratively
2. **Follow the Order**: Specify → Plan → Tasks → Implement
3. **Review Specs**: Always read the generated spec.md and refine it
4. **Track Progress**: Use tasks_tick consistently
5. **Document Decisions**: Use research_append for architecture choices

---

## 🛠 Available Tools

### 🎯 Core Spec-Driven Development Tools

DinCoder implements the complete Spec Kit workflow through these MCP tools:

#### Phase 1: SPECIFY — Create Living Specifications

| Tool | Purpose | Usage Example |
|------|---------|---------------|
| `specify_start` | **Initialize project** | `{"projectName": "taskify", "agent": "claude"}` |
| `specify_describe` | **Generate PRD** | `{"description": "Build a photo organizer with albums"}` |
| `constitution_create` | **Define project DNA** | `{"principles": [...], "constraints": [...]}` |
| `clarify_add` | **Track ambiguities** | `{"question": "Auth method?", "context": "Security"}` |
| `clarify_resolve` | **Resolve uncertainties** | `{"clarificationId": "CLARIFY-001", "resolution": "..."}` |
| `spec_validate` | **Check spec quality** | `{"checks": {"completeness": true, "acceptanceCriteria": true}}` |
| `research_append` | **Document findings** | `{"content": "WebSocket benchmarks show..."}` |

#### Phase 2: PLAN — Map Specifications to Architecture

| Tool | Purpose | Usage Example |
|------|---------|---------------|
| `plan_create` | **Technical planning** | `{"constraintsText": "Next.js, Prisma, PostgreSQL"}` |
| `spec_refine` | **Update specs** | `{"section": "requirements", "changes": "..."}` |
| `artifacts_analyze` | **Verify alignment** | `{"artifacts": ["spec", "plan"]}` |

#### Phase 3: TASKS — Generate Executable Work Items

| Tool | Purpose | Usage Example |
|------|---------|---------------|
| `tasks_generate` | **Create task list** | `{"scope": "MVP"}` |
| `tasks_tick` | **Track completion** | `{"taskId": "T001"}` |
| `tasks_tick_range` | **Bulk completion** | `{"taskIds": ["T001-T005"]}` |
| `tasks_filter` | **Show actionable items** | `{"preset": "next", "limit": 5}` |
| `tasks_search` | **Find tasks** | `{"query": "authentication", "fuzzy": true}` |
| `tasks_visualize` | **Dependency graphs** | `{"format": "mermaid"}` |
| `tasks_stats` | **Progress analytics** | `{"groupBy": "phase", "includeCharts": true}` |

#### Phase 4: IMPLEMENT — Build With Validation

| Tool | Purpose | Usage Example |
|------|---------|---------------|
| `git_create_branch` | **Feature isolation** | `{"branchName": "feature/chat-system"}` |
| `quality_format` | **Code formatting** | `{"fix": true}` |
| `quality_lint` | **Static analysis** | `{"fix": true}` |
| `quality_test` | **Execute tests** | `{"coverage": true}` |
| `quality_security_audit` | **Check vulnerabilities** | `{"fix": false}` |

---

## 📚 Examples

### Connect with TypeScript Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/transport/streamable-http.js';

const transport = new StreamableHTTPClientTransport({
  url: new URL('http://localhost:3000/mcp'),
});

const client = new Client({
  name: 'my-client',
  version: '1.0.0',
});

await client.connect(transport);

// Use tools
const result = await client.callTool('specify_describe', {
  description: 'A task management API',
});
```

See [examples/](examples/) for complete examples:
- `local-client.ts` - Connect to local server
- `spec-workflow.md` - Complete spec-driven workflow

---

## 💡 Why Spec-Driven Development?

**TL;DR:** Specifications are executable contracts that generate consistent, maintainable code. Change the spec → regenerate the implementation. No more "vibe coding."

For decades, code has been king. Specifications were scaffolding—built, used, then discarded. **Spec-Driven Development inverts this power structure:**

- **Specifications Generate Code**: The PRD isn't a guide—it's the source that produces implementation
- **Executable Specifications**: Precise, complete specs that eliminate the gap between intent and implementation
- **Code as Expression**: Code becomes the specification's expression in a particular language/framework
- **Living Documentation**: Maintain software by evolving specifications, not manually updating code

This transformation is possible because AI can understand complex specifications and implement them systematically. But raw AI generation without structure produces chaos. DinCoder provides that structure through GitHub's proven Spec Kit methodology.

### Why This Matters Now

Three converging trends make SDD essential:

1. **AI Threshold**: LLMs can reliably translate natural language specifications to working code
2. **Complexity Growth**: Modern systems integrate dozens of services—manual alignment becomes impossible
3. **Change Velocity**: Requirements change rapidly—pivots are expected, not exceptional

Traditional development treats changes as disruptions. SDD transforms them into systematic regenerations. Change a requirement → update affected plans → regenerate implementation.

**Read the full philosophy:** [Why Spec-Driven Development?](docs/WHY_SDD.md)

---

## 🗺 Roadmap

DinCoder is actively evolving! We're at **v0.4.0** with **28/36 stories complete (78%)**.

**Current Phase:** Phase 3 - Advanced Task Management (In Progress)

**Upcoming Features:**
- Advanced task management (filtering, search, statistics)
- Multi-feature project support
- Enhanced collaboration features
- External integrations (Jira, Linear, GitHub Issues)

**Vote on features and view the complete roadmap:** [ROADMAP.md](ROADMAP.md)

---

## 🤝 Contributing

We welcome contributions from the community! Whether you have:

- **Feature ideas or requests** - Share your vision for new Spec Kit tools
- **Bug reports** - Help us identify and fix issues
- **Template improvements** - Enhance the Spec Kit templates
- **Tool enhancements** - Extend the MCP server capabilities
- **Documentation updates** - Improve guides and examples

**Get Started:**
1. [Open an issue](https://github.com/flight505/mcp-dincoder/issues) to discuss your idea
2. Fork the repository and create a feature branch
3. For development: `git clone`, `npm install`, `npm run build`, `npm test`
4. Submit a pull request with your improvements

We appreciate all contributions, big or small!

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 📚 References

- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Spec Kit Documentation](https://github.com/github/spec-kit)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## 🙏 Acknowledgments

- [Model Context Protocol](https://github.com/modelcontextprotocol) by Anthropic
- [Spec Kit](https://github.com/spec-kit) for spec-driven development methodology

---
