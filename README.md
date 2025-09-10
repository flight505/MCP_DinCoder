# DinCoder 🚀

**D**riven **I**ntent **N**egotiation — **C**ontract-**O**riented **D**eterministic **E**xecutable **R**untime

> *The Spec-Driven MCP server for Intent → Contracts → Deterministic Execution*

**Transform "prompt-then-code-dump" workflows into systematic, specification-driven development**

DinCoder packages GitHub's Spec-Driven Development (SDD) methodology into a Model Context Protocol server, eliminating the guesswork that plagues AI-assisted coding. Through **intent negotiation**, **contract-oriented design**, and **deterministic execution**, this server ensures AI builds exactly what you intend—not what it guesses you might want.

## What is DinCoder?

DinCoder represents a paradigm shift in AI-assisted development:

- **Driven Intent Negotiation**: Your intent is captured through collaborative specification, not guessed from prompts
- **Contract-Oriented**: Every component has clear contracts—APIs, data models, and test scenarios defined upfront
- **Deterministic**: Same spec produces consistent, predictable results every time
- **Executable Runtime**: Specifications aren't just documents—they're executable artifacts that generate code

## Why Spec-Driven Development?

Most AI coding workflows fail because they leave thousands of details implicit. When you give an AI a vague prompt, it has to guess at requirements, leading to code that "looks right, but doesn't quite work." This **"vibe coding"** approach might work for quick prototypes, but fails for production systems.

**DinCoder eliminates that guesswork** by:
- 📋 **Making the spec a living artifact** - Your specification is the source of truth, not the code
- 🎯 **Separating "what" from "how"** - The spec defines what users need; the plan defines how to build it
- ✅ **Breaking work into testable units** - Tasks are small, reviewable, and validated incrementally
- 🔄 **Enabling iteration without rewrites** - Change the spec, regenerate the implementation

## Features

- **🎯 Spec-Driven Workflow**: Full Spec Kit integration (specify → plan → tasks → implement)
- **🔌 MCP Protocol**: Streamable HTTP (Protocol Revision 2025-03-26) compliant
- **☁️ Smithery Ready**: Designed for deployment on Smithery platform
- **✨ Quality First**: Built-in formatting, linting, testing, and security audits
- **🤖 Multi-Agent**: Works with Claude Code, GitHub Copilot, and Gemini CLI
- **🔄 Dual Mode**: Stateless and stateful operation with session management

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm or pnpm

### Installation

#### For Claude Code / VS Code Users

Install the server globally via npm:

```bash
npm install -g @dincoder/mcp-server
```

Then add it to Claude Code:

```bash
claude mcp add dincoder -- npx -y @dincoder/mcp-server
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
      "args": ["-y", "@dincoder/mcp-server"]
    }
  }
}
```

#### For Development

```bash
# Clone the repository
git clone https://github.com/flight505/mcp-dincoder.git
cd mcp-dincoder

# Install dependencies
npm install

# Build the project
npm run build

# Run with stdio transport (default)
npm start

# Run with HTTP transport
npm run start:http
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Available Tools

### 🎯 Core Spec-Driven Development Tools

These tools implement the four-phase SDD workflow that transforms specifications into working code:

#### Phase 1: SPECIFY - Create Living Specifications
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `specify.start` | **Initialize spec-driven project** | Starting a new feature or system from scratch |
| `specify.describe` | **Create comprehensive PRD** | Transform vague ideas into testable requirements |
| `research.append` | **Document research findings** | Capture technical constraints and decisions |

The **Specify phase** establishes your source of truth. Instead of letting AI guess at requirements, you create unambiguous specifications that capture WHAT users need and WHY. The spec becomes a living artifact that drives all subsequent development.

#### Phase 2: PLAN - Choose Technical Approach
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `plan.create` | **Generate architecture decisions** | Map requirements to concrete technical choices |
| `artifacts.read` | **Access spec/plan/task data** | Review and validate technical decisions |

The **Plan phase** transforms specifications into actionable technical strategies. Every technology choice is justified and traced back to specific requirements. This ensures your tech stack serves your business needs, not the other way around.

#### Phase 3: TASKS - Break Down Into Units
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `tasks.generate` | **Create granular work items** | Decompose plan into testable, reviewable chunks |
| `tasks.tick` | **Track task completion** | Mark progress and maintain workflow state |

The **Tasks phase** eliminates thousand-line code dumps. Work is broken into small, independently testable units that can be reviewed and validated in isolation. Each task has clear acceptance criteria derived from specifications.

#### Phase 4: IMPLEMENT - Build With Validation
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `git.create_branch` | **Create feature branches** | Isolate implementation work for each task |
| Implementation happens through your AI coding agent using the generated tasks as precise instructions |

The **Implement phase** produces code that serves the specification. Instead of reviewing massive code blocks, you validate focused changes that solve specific problems. The AI knows exactly what to build because the specification told it.

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

### 📊 The SDD Advantage

Traditional prompt-based workflows produce code through guesswork. Spec-Driven Development produces code through systematic validation:

```
Traditional: Vague Prompt → AI Guesses → "Looks Right" Code → Production Failures
SDD:         Clear Spec → Validated Plan → Testable Tasks → Quality Code
```

This structure is what improves quality versus "vibe coding" - the spec is your source of truth, the plan chooses the technical approach, and tasks break work into small, testable units.

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
- `smithery-client.ts` - Connect to Smithery deployment
- `spec-workflow.md` - Complete spec-driven workflow

## API Endpoints

### POST /mcp
Accepts JSON-RPC requests for tool execution.

**Headers:**
- `Content-Type: application/json`
- `Mcp-Session-Id: <uuid>` (for stateful mode)
- `MCP-Protocol-Version: 2025-03-26`

### GET /mcp
Opens SSE stream for server-initiated messages (stateful mode only).

### DELETE /mcp
Ends a session (stateful mode only).

### GET /healthz
Health check endpoint.

## Configuration

### Environment Variables

```bash
# Server configuration
PORT=3000                    # Server port
HOST=localhost              # Server host
MODE=stateless             # Operation mode (stateless|stateful)

# Security
ALLOWED_ORIGINS=http://localhost:*,https://*.smithery.ai
API_KEY=your-secret-key    # Optional API key authentication

# Paths
WORKSPACE_PATH=/path/to/workspace  # Default workspace directory
```

### Smithery Deployment

The server supports configuration via base64-encoded query parameter:

```
https://server.smithery.ai/mcp-dincoder/mcp?config=<base64>
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   AI Assistant  │────▶│   MCP Server    │────▶│   Spec Kit     │
│  (Claude/Copilot)│     │  (Express+MCP)  │     │    Tools       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         │                       ▼                        │
         │              ┌─────────────────┐              │
         └─────────────▶│  HTTP/SSE       │◀─────────────┘
                        │  Transport       │
                        └─────────────────┘
```

### Operation Modes

**Stateless Mode** (default):
- New server instance per request
- No session management required
- Ideal for serverless deployments

**Stateful Mode**:
- Persistent server instances
- Session management with UUIDs
- Supports SSE streams

## Development

### Project Structure

```
mcp-dincoder/
├── src/
│   ├── server/         # MCP server implementation
│   ├── http/           # HTTP/SSE transport
│   ├── tools/          # Tool implementations
│   └── index.ts        # Entry point
├── tests/              # Test suites
├── examples/           # Usage examples
├── docs/               # Documentation
└── specs/              # Generated specifications
```

### Adding New Tools

1. Create tool implementation in `src/tools/`:
```typescript
export const MyToolSchema = z.object({
  param: z.string(),
});

export async function myTool(params: z.infer<typeof MyToolSchema>) {
  // Implementation
  return { success: true, result: 'data' };
}
```

2. Register in `src/server/createServer.ts`:
```typescript
server.tool(
  'category.my_tool',
  'Tool description',
  MyToolSchema.shape,
  async (params) => {
    const result = await myTool(MyToolSchema.parse(params));
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  }
);
```

### Testing

Write tests in `tests/` directory:
```typescript
describe('My Tool', () => {
  it('should execute successfully', async () => {
    const result = await myTool({ param: 'value' });
    expect(result.success).toBe(true);
  });
});
```

## Security

- **Path Sandboxing**: All file operations restricted to workspace directory
- **Origin Validation**: CORS protection with configurable allowed origins
- **API Key Authentication**: Optional Bearer token authentication
- **Rate Limiting**: Token bucket rate limiting per session
- **Input Validation**: Zod schemas for all tool inputs
- **Command Timeouts**: Automatic timeout for long-running commands

## Protocol Support

- **Streamable HTTP**: Full support (2025-03-26 revision)
- **Session Management**: UUID-based sessions with Mcp-Session-Id header
- **Protocol Version**: MCP-Protocol-Version header negotiation
- **SSE Streams**: Server-sent events for real-time updates
- **JSON-RPC 2.0**: Complete implementation

## Troubleshooting

### Common Issues

**Server won't start:**
- Check port availability: `lsof -i :3000`
- Verify Node version: `node --version` (must be >= 20)

**Tools timing out:**
- Increase timeout in tool implementation
- Check system resources

**Path access denied:**
- Ensure workspace path is not in restricted directories
- Check file permissions

**Session errors in stateless mode:**
- Don't send `Mcp-Session-Id` header in stateless mode
- Use stateful mode for session-based workflows

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Workflow

```bash
# Run in development mode
npm run dev

# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm test
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## References

- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Spec Kit Documentation](https://github.com/github/spec-kit)
- [Smithery Platform](https://smithery.ai)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## Acknowledgments

- [Model Context Protocol](https://github.com/modelcontextprotocol) by Anthropic
- [Spec Kit](https://github.com/spec-kit) for spec-driven development
- [Smithery](https://smithery.ai) for MCP hosting platform

---

Built with ❤️ for the AI-assisted development community