# MCP DinCoder 🚀

A spec-driven development orchestrator that exposes Spec Kit tools through the Model Context Protocol (MCP), enabling AI assistants to drive systematic software development workflows.

## Features

- **Spec-Driven Development**: Full Spec Kit integration (specify → plan → tasks → implement)
- **MCP Streamable HTTP**: Protocol Revision 2025-03-26 compliant implementation
- **Smithery Ready**: Designed for deployment on Smithery platform (WebSocket hosting)
- **Quality Assurance**: Built-in tools for formatting, linting, testing, and security audits
- **Multi-Agent Support**: Works with Claude Code, GitHub Copilot, and Gemini CLI
- **Session Management**: Stateless and stateful operation modes with UUID-based sessions

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm or pnpm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-dincoder.git
cd mcp-dincoder

# Install dependencies
npm install

# Build the project
npm run build
```

### Running Locally

```bash
# Start the MCP server
npm run start:local

# The server will be available at http://localhost:3000/mcp
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

### Spec Kit Tools

| Tool | Description |
|------|-------------|
| `specify.start` | Initialize a new spec-driven project |
| `specify.describe` | Create project specification |
| `plan.create` | Generate technical plan from specification |
| `tasks.generate` | Generate actionable tasks from plan |
| `tasks.tick` | Mark a task as complete |
| `artifacts.read` | Read normalized JSON for spec/plan/tasks |
| `research.append` | Append to research document |
| `git.create_branch` | Create a working branch for a feature |

### Quality Tools

| Tool | Description |
|------|-------------|
| `quality.format` | Run Prettier code formatter |
| `quality.lint` | Run ESLint linter |
| `quality.test` | Run tests with optional coverage |
| `quality.security_audit` | Run npm security audit |
| `quality.deps_update` | Check for dependency updates |
| `quality.license_check` | Check dependency licenses |

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