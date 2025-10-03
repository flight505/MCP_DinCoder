<div align="center">
  <img width="320" alt="Image@0 5x" src="https://github.com/user-attachments/assets/defd2ef0-5804-431c-8549-618eb3434aee" />
</div>

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


## Available Tools

### 🎯 Core Spec-Driven Development Tools

DinCoder implements the complete Spec Kit workflow through these MCP tools:

#### Phase 1: SPECIFY — Create Living Specifications

| Tool | Purpose | Usage Example | Output |
|------|---------|---------------|--------|
| `specify_start` | **Initialize project** | `{"projectName": "taskify", "agent": "claude"}` | Creates `.dincoder/` structure, templates |
| `specify_describe` | **Generate PRD** | `{"description": "Build a photo organizer with albums"}` | Comprehensive spec.md with user stories |
| `research_append` | **Document findings** | `{"content": "WebSocket benchmarks show..."}` | Updates research.md with decisions |

**How it works**: The Specify phase uses templates that force focus on WHAT and WHY, explicitly preventing HOW. Every ambiguity becomes a `[NEEDS CLARIFICATION]` marker, ensuring no hidden assumptions. The generated specification includes:
- User personas and journeys
- Functional requirements with acceptance criteria
- Non-functional requirements (performance, security)
- Edge cases and error scenarios
- Explicit uncertainties for refinement

#### Phase 2: PLAN — Map Specifications to Architecture

| Tool | Purpose | Usage Example | Output |
|------|---------|---------------|--------|
| `plan_create` | **Technical planning** | `{"constraintsText": "Next.js, Prisma, PostgreSQL"}` | plan.md with phased implementation |
| `artifacts_read` | **Review artifacts** | `{"format": "json"}` | Structured view of all specifications |

**How it works**: The Plan phase enforces constitutional compliance through gates:
```markdown
Phase -1: Pre-Implementation Gates
✓ Simplicity Gate: ≤3 projects
✓ Anti-Abstraction Gate: Direct framework usage
✓ Integration-First Gate: Real environments over mocks
```

Every technical decision traces to requirements. The plan generates:
- Phased implementation approach
- Data models (`data-model.md`)
- API contracts (`contracts/`)
- Technology rationale (`research.md`)
- Quickstart validation scenarios

#### Phase 3: TASKS — Generate Executable Work Items

| Tool | Purpose | Usage Example | Output |
|------|---------|---------------|--------|
| `tasks_generate` | **Create task list** | `{"scope": "MVP"}` | Numbered, ordered task list |
| `tasks_tick` | **Track completion** | `{"taskId": "3", "status": "done"}` | Updates task status in tasks.md |

**How it works**: Tasks are derived from contracts and specifications:
1. Contract tests come first (API, WebSocket, etc.)
2. Integration tests before unit tests
3. Implementation follows test creation
4. Tasks marked `[P]` can run in parallel

Example generated tasks:
```markdown
1. [P] Create REST API contract tests
2. [P] Create WebSocket event contract tests
3. Set up PostgreSQL schema (depends on 1)
4. Implement user authentication (depends on 1,3)
5. Add real-time message broadcasting (depends on 2,4)
```

#### Phase 4: IMPLEMENT — Build With Validation

| Tool | Purpose | Usage Example | Output |
|------|---------|---------------|--------|
| `git_create_branch` | **Feature isolation** | `{"featureName": "chat-system"}` | Creates git branch |

**How it works**: Implementation follows the task list systematically. Each task is small enough to review in isolation. The AI agent has precise instructions from specifications, eliminating guesswork. Code generation is deterministic—same spec produces functionally equivalent implementations.

### 🔧 Quality Assurance Tools

Ensure code meets specifications and production standards:

| Tool | Purpose | Best Practice |
|------|---------|---------------|
| `quality.format` | **Code formatting with Prettier** | Run before commits to maintain consistency |
| `quality.lint` | **Static analysis with ESLint** | Catch issues early in development |
| `quality.test` | **Execute test suites** | Validate code against specifications |
| `quality.security_audit` | **Check for vulnerabilities** | Run before deployments |
| `quality.deps_update` | **Dependency management** | Keep dependencies current and secure |
| `quality.license_check` | **License compliance** | Ensure legal compatibility |

### 📊 The SDD Advantage: From Vibe Coding to Systematic Development

Traditional AI coding suffers from the **specification gap**—the chasm between what you want and what the AI builds. This gap exists because:

1. **Implicit Requirements**: Thousands of details left unspecified
2. **Hidden Assumptions**: AI guesses at your intent
3. **Monolithic Generation**: Massive code dumps impossible to review
4. **No Traceability**: Can't trace code back to requirements

**Spec-Driven Development eliminates this gap entirely:**

```
Traditional Workflow (Vibe Coding):
Vague Prompt → AI Guesses → "Looks Right" Code → Hidden Bugs → Production Failures

SDD Workflow (Systematic):
Clear Spec → Validated Plan → Testable Tasks → Quality Code → Production Success
```

### Why This Matters

**For Product Teams**: Requirements become executable. Change the spec, regenerate the implementation. No more telephone game between product and engineering.

**For Engineers**: Focus on architecture and design, not translation. The specification captures intent; you guide technical excellence.

**For Organizations**: Consistency across teams. Every project follows the same disciplined process, producing maintainable, documented systems.

**For AI Agents**: Clear instructions eliminate hallucination. The AI knows exactly what to build because the specification tells it.

### The Compound Effect

When specifications drive development:
- **Changes are systematic**: Update spec → regenerate affected code
- **Quality is built-in**: Test-first, contract-first, validation-first
- **Knowledge persists**: Specifications document the "why" forever
- **Iteration is cheap**: Try multiple implementations from one spec
- **Onboarding is instant**: New developers read specs, not code

This isn't incremental improvement—it's a fundamental rethinking of how we build software in the age of AI.

## Examples

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
const result = await client.callTool('specify.describe', {
  description: 'A task management API',
});
```

See [examples/](examples/) for complete examples:
- `local-client.ts` - Connect to local server
- `spec-workflow.md` - Complete spec-driven workflow

## Contributing

We welcome contributions from the community! Whether you have:

- **Feature ideas or requests** - Share your vision for new Spec Kit tools or workflow improvements
- **Bug reports** - Help us identify and fix issues
- **Template improvements** - Enhance the Spec Kit templates for better LLM guidance
- **Tool enhancements** - Extend the MCP server capabilities
- **Documentation updates** - Improve guides and examples

**Get Started:**
1. [Open an issue](https://github.com/flight505/mcp-dincoder/issues) to discuss your idea
2. Fork the repository and create a feature branch
3. For development: `git clone`, `npm install`, `npm run build`, `npm test`
4. Submit a pull request with your improvements

We appreciate all contributions, big or small!

## License

MIT License - see [LICENSE](LICENSE) file for details.

## References

- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Spec Kit Documentation](https://github.com/github/spec-kit)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## Acknowledgments

- [Model Context Protocol](https://github.com/modelcontextprotocol) by Anthropic
- [Spec Kit](https://github.com/spec-kit) for spec-driven development methodology

---
