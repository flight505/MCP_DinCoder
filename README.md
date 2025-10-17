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
- [MCP Prompts (Slash Commands)](#-mcp-prompts-slash-commands)
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

#### 🎯 MCP Prompts - Universal Slash Commands ✨

- **7 workflow prompts** that work across all MCP clients
- **Slash command format**: `/mcp__dincoder__start_project`, `/mcp__dincoder__create_spec`, etc.
- **Built-in guidance**: Each prompt includes comprehensive workflow instructions
- **Works everywhere**: Claude Code, VS Code Copilot, OpenAI Codex, Cursor
- **Zero configuration**: Auto-discovered by MCP clients

**Available Prompts:**
- `/mcp__dincoder__start_project` - Initialize new spec-driven project
- `/mcp__dincoder__create_spec` - Create feature specification
- `/mcp__dincoder__generate_plan` - Generate implementation plan
- `/mcp__dincoder__create_tasks` - Break down into actionable tasks
- `/mcp__dincoder__review_progress` - Generate progress report
- `/mcp__dincoder__validate_spec` - Check specification quality
- `/mcp__dincoder__next_tasks` - Show actionable tasks

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

## 🎯 MCP Prompts (Slash Commands)

**New in v0.4.0:** DinCoder includes 7 MCP prompts that provide guided workflows with comprehensive instructions built-in. These are automatically discovered by all MCP-compatible clients.

### How to Access MCP Prompts

MCP prompts are **workflow templates** exposed via the MCP protocol. Different clients surface them in different ways:

#### **Claude Code** (claude.ai/code)
Type `@` to open the prompt picker, then select:
```
@mcp__dincoder__start_project
@mcp__dincoder__create_spec
@mcp__dincoder__generate_plan
@mcp__dincoder__create_tasks
@mcp__dincoder__review_progress
@mcp__dincoder__validate_spec
@mcp__dincoder__next_tasks
```

**Note:** In Claude Code, MCP prompts use `@` (not `/`). The `/` slash is reserved for native slash commands.

#### **VS Code Copilot**
In agent mode, use slash commands:
```
/mcp.dincoder.start_project
/mcp.dincoder.create_spec
/mcp.dincoder.generate_plan
/mcp.dincoder.create_tasks
/mcp.dincoder.review_progress
/mcp.dincoder.validate_spec
/mcp.dincoder.next_tasks
```

#### **OpenAI Codex**
Explicitly invoke with `use` keyword:
```
use /mcp.dincoder.start_project
use /mcp.dincoder.create_spec
use /mcp.dincoder.generate_plan
```

### What Are MCP Prompts?

MCP prompts are **workflow orchestrators** that:

1. **Guide the AI** through multi-step processes
2. **Include comprehensive instructions** for each workflow phase
3. **Call multiple MCP tools** in the correct sequence
4. **Provide context** on available tools and best practices

When you invoke an MCP prompt, the AI receives detailed instructions and then uses DinCoder's tools to complete the workflow.

<details>
<summary><strong>See detailed prompt descriptions (click to expand)</strong></summary>

#### 1. `/start_project` - Initialize New Spec-Driven Project

**Purpose:** Set up a new project with DinCoder's spec-driven workflow

**Arguments:**
- `projectName` (required): Name of your project
- `agent` (optional): AI agent type (`claude`, `copilot`, `gemini`)

**Example:**
```
/mcp__dincoder__start_project projectName="task-manager" agent="claude"
```

#### 2. `/create_spec` - Create Feature Specification

**Purpose:** Generate a comprehensive specification document

**Arguments:**
- `description` (required): Brief description of what you want to build

**Example:**
```
/mcp__dincoder__create_spec description="Build a task management system with projects and due dates"
```

#### 3. `/generate_plan` - Generate Implementation Plan

**Purpose:** Create technical implementation plan from specification

**Arguments:**
- `specPath` (optional): Path to spec.md file (auto-detected if omitted)

**Example:**
```
/mcp__dincoder__generate_plan
```

#### 4. `/create_tasks` - Break Down into Actionable Tasks

**Purpose:** Generate executable task list from implementation plan

**Arguments:**
- `planPath` (optional): Path to plan.md file (auto-detected if omitted)

**Example:**
```
/mcp__dincoder__create_tasks
```

#### 5. `/review_progress` - Generate Progress Report

**Purpose:** Show project status with statistics and charts

**Example:**
```
/mcp__dincoder__review_progress
```

#### 6. `/validate_spec` - Check Specification Quality

**Purpose:** Validate specification before moving to implementation

**Arguments:**
- `specPath` (optional): Path to spec.md file (auto-detected if omitted)

**Example:**
```
/mcp__dincoder__validate_spec
```

#### 7. `/next_tasks` - Show Next Actionable Tasks

**Purpose:** Display unblocked tasks ready to start

**Arguments:**
- `limit` (optional): Maximum number of tasks to show (default: 5)

**Example:**
```
/mcp__dincoder__next_tasks limit="10"
```

</details>

### Cross-Platform Quick Reference

| Client | Access Method | Prefix | Example |
|--------|--------------|--------|---------|
| **Claude Code** | Type `@` | `@mcp__dincoder__` | `@mcp__dincoder__start_project` |
| **VS Code Copilot** | Type `/` in agent mode | `/mcp.dincoder.` | `/mcp.dincoder.start_project` |
| **OpenAI Codex** | Type `use /` | `use /mcp.dincoder.` | `use /mcp.dincoder.create_spec` |

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
