<div align="center">
  <img width="320" alt="Image@0 5x" src="https://github.com/user-attachments/assets/defd2ef0-5804-431c-8549-618eb3434aee" />
</div>

[![smithery badge](https://smithery.ai/badge/@flight505/mcp_dincoder)](https://smithery.ai/server/@flight505/mcp_dincoder)

**D**riven **I**ntent **N**egotiation — **C**ontract-**O**riented **D**eterministic **E**xecutable **R**untime

> *The MCP implementation of GitHub's Spec Kit methodology — transforming specifications into executable artifacts*

**An official Model Context Protocol server implementing GitHub's Spec-Driven Development (SDD) methodology**

DinCoder brings the power of [GitHub Spec Kit](https://github.com/github/spec-kit) to any AI coding agent through the Model Context Protocol. It transforms the traditional "prompt-then-code-dump" workflow into a systematic, specification-driven process where **specifications don't serve code—code serves specifications**.

## 🌟 The Power Inversion: A New Development Paradigm

For decades, code has been king. Specifications were scaffolding—built, used, then discarded once "real work" began. PRDs guided development, design docs informed implementation, but these were always subordinate to code. Code was truth. Everything else was, at best, good intentions.

**Spec-Driven Development inverts this power structure:**

- **Specifications Generate Code**: The PRD isn't a guide—it's the source that produces implementation
- **Executable Specifications**: Precise, complete specs that eliminate the gap between intent and implementation  
- **Code as Expression**: Code becomes the specification's expression in a particular language/framework
- **Living Documentation**: Maintain software by evolving specifications, not manually updating code

This transformation is possible because AI can understand complex specifications and implement them systematically. But raw AI generation without structure produces chaos. DinCoder provides that structure through GitHub's proven Spec Kit methodology.

## 🎯 What is DinCoder?

DinCoder is an MCP server that implements GitHub's Spec-Driven Development methodology, providing:

- **Driven Intent Negotiation**: Collaborative specification refinement through structured dialogue
- **Contract-Oriented Design**: APIs, data models, and test scenarios defined before implementation
- **Deterministic Execution**: Same spec produces consistent, predictable results every time
- **Executable Runtime**: Specifications that directly generate working implementations

## 🚀 The Spec Kit Workflow

The workflow transforms ideas into production-ready code through three powerful commands:

### 1️⃣ `/specify` — Transform Ideas into Specifications

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

### 2️⃣ `/plan` — Map Specifications to Technical Decisions

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

### 3️⃣ `/tasks` — Generate Executable Task Lists

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

## 💡 Why Spec-Driven Development Matters Now

Three converging trends make SDD essential:

1. **AI Threshold**: LLMs can reliably translate natural language specifications to working code
2. **Complexity Growth**: Modern systems integrate dozens of services—manual alignment becomes impossible
3. **Change Velocity**: Requirements change rapidly—pivots are expected, not exceptional

Traditional development treats changes as disruptions. SDD transforms them into systematic regenerations. Change a requirement → update affected plans → regenerate implementation. Engineering velocity maintained through inevitable changes.

## 📚 Real-World Example: Building a Chat System

See how SDD transforms traditional development:

### Traditional Approach (12+ hours of documentation)
```text
1. Write PRD in document (2-3 hours)
2. Create design documents (2-3 hours)  
3. Set up project structure (30 minutes)
4. Write technical specs (3-4 hours)
5. Create test plans (2 hours)
```

### SDD with DinCoder (15 minutes total)

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

## 🎨 Template-Driven Quality: How Structure Constrains LLMs

DinCoder's templates don't just save time—they guide LLMs toward higher-quality specifications through sophisticated constraints:

### 1. **Preventing Premature Implementation**
Templates enforce separation of concerns:
```markdown
✅ Focus on WHAT users need and WHY
❌ Avoid HOW to implement (no tech stack in specs)
```

### 2. **Forcing Explicit Uncertainties**
No more hidden assumptions:
```markdown
[NEEDS CLARIFICATION: Auth method not specified - OAuth, SAML, or custom?]
```

### 3. **Constitutional Compliance**
Architectural principles as gates:
```markdown
#### Simplicity Gate (Article VII)
- [ ] Using ≤3 projects?
- [ ] No future-proofing?
```

### 4. **Test-First Thinking**
Enforced implementation order:
```markdown
1. Create contracts/
2. Create tests (contract → integration → e2e)
3. Create source files to make tests pass
```

These constraints transform LLMs from creative writers into disciplined specification engineers, producing consistently high-quality, executable specifications.

## 🔧 Features

### Real Spec Kit Integration (v0.1.7+)
- **Authentic SDD**: Generates real Spec Kit markdown documents
- **Template-Based**: Uses official GitHub Spec Kit templates
- **Dual Directory Support**: Works with `.dincoder/` and `specs/`
- **Cross-Agent Ready**: Compatible with Claude, Copilot, Gemini, Cursor

### Core Capabilities
- **🎯 Complete Workflow**: Full specify → plan → tasks → implement pipeline
- **🔌 MCP Protocol**: Streamable HTTP (2025-03-26) compliant
- **✨ Quality Tools**: Formatting, linting, testing, security audits
- **🔄 Flexible Modes**: Stateless and stateful operation

## 🤝 For Spec Kit Developers

DinCoder is a complete MCP implementation of the Spec Kit methodology, making it available to any MCP-compatible AI agent. Here's how we've implemented your vision:

### Implementation Details

**Template Fidelity**: We use the official Spec Kit templates from `github/spec-kit`, ensuring consistency with the canonical implementation:
- `spec-template.md` for feature specifications
- `plan-template.md` for implementation plans  
- `tasks-template.md` for task generation

**Constitutional Enforcement**: The nine articles of development are enforced through:
- Pre-implementation gates in planning phase
- Test-first task ordering
- Library-first architecture
- CLI interface requirements

**Directory Structure**: Maintains Spec Kit conventions:
```
.dincoder/
├── specs/
│   ├── 001-feature-name/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   ├── data-model.md
│   │   ├── contracts/
│   │   └── research.md
```

### MCP Tool Mapping

| Spec Kit Command | MCP Tool | Parameters |
|-----------------|----------|------------|
| `/specify` | `specify_start`, `specify_describe` | `projectName`, `description` |
| `/plan` | `plan_create` | `constraintsText` |
| `/tasks` | `tasks_generate` | `scope` |
| Additional | `tasks_tick`, `research_append` | Task tracking & research |

### Integration Points

**For Tool Developers**: Extend DinCoder by:
1. Adding tools in `src/tools/` following our schema patterns
2. Registering in `src/server/createServer.ts`
3. Maintaining template compatibility

**For Template Authors**: Custom templates can be added to `templates/speckit/` and will be automatically used by the generation tools.

**For Methodology Researchers**: The MCP protocol provides telemetry and observability into the SDD process, enabling data-driven improvements to the methodology.

### Contributing Back

We welcome contributions that enhance the Spec Kit methodology:
- **Template Improvements**: Refine constraint patterns for better LLM guidance
- **Constitutional Amendments**: Propose architectural principles based on real-world usage
- **Workflow Optimizations**: Suggest command enhancements or new workflow patterns

Submit issues and PRs to [github/spec-kit](https://github.com/github/spec-kit) for methodology improvements, or to our repository for MCP-specific enhancements.

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm or pnpm

### Installation

#### For Claude Code / VS Code Users

Install the server globally via npm:

```bash
npm install -g mcp-dincoder
```

Then add it to Claude Code:

```bash
claude mcp add dincoder -- npx -y mcp-dincoder
```

Or configure manually in your Claude Code config:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "dincoder": {
      "command": "npx",
      "args": ["-y", "mcp-dincoder"]
    }
  }
}
```

### Installing via Smithery

To install DinCoder automatically via [Smithery](https://smithery.ai/server/@flight505/mcp_dincoder):

```bash
npx -y @smithery/cli install @flight505/mcp_dincoder
```

## 🚦 Complete Workflow Guide

This is your end-to-end guide for using DinCoder with any AI agent (Claude, Copilot, Gemini, Cursor).

### Step-by-Step: From Idea to Implementation

#### 1️⃣ **Start a New Project** (1 minute)

```typescript
// In your AI agent's chat:
"Use specify_start to initialize a new project called 'task-manager' with claude agent"

// What happens:
// ✓ Creates specs/001-task-manager/ directory
// ✓ Generates spec.md template
// ✓ Creates contracts/ folder
// ✓ Initializes research.md
```

**When to use**: First step for any new feature or project.

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

#### 3️⃣ **Refine the Specification** (Optional, 5-10 minutes)

```typescript
// Read the generated spec
"Use artifacts_read with artifactType 'spec'"

// Add research findings
"Use research_append to document:
Reviewed task management UX patterns. Best practices suggest:
- Keyboard shortcuts for power users
- Drag-and-drop for task reordering
- Smart filters (Today, Upcoming, Overdue)"
```

**When to use**: When you need to document technical research or clarify ambiguities.

#### 4️⃣ **Generate Technical Plan** (2-5 minutes)

```typescript
"Use plan_create with these constraints:
- Next.js 14 with App Router
- PostgreSQL with Prisma ORM
- tRPC for type-safe APIs
- Tailwind CSS for styling
- NextAuth for authentication"

// What happens:
// ✓ Creates plan.md with phased approach
// ✓ Generates data-model.md (Task, Project, User schemas)
```
