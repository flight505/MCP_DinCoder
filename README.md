# MCP DinCoder

Spec-Driven MCP Orchestrator with Streamable HTTP transport for AI-assisted software development.

## Overview

MCP DinCoder implements a Model Context Protocol server that exposes Spec Kit tools (specify, plan, tasks) to enable spec-driven development workflows. Built with TypeScript and supporting the latest Streamable HTTP transport (Protocol Revision 2025-03-26).

## Features

- 🚀 Streamable HTTP transport (replaces legacy SSE)
- 📝 Spec Kit integration for structured development
- 🔧 Quality assurance tools (lint, test, format)
- 🌐 Smithery deployment ready
- 🔒 Secure session management
- ⚡ Stateless and stateful operation modes

## Requirements

- Node.js >= 20
- npm or yarn

## Installation

```bash
npm install mcp-dincoder
```

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start:local
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Configuration

The server supports configuration via environment variables or the `?config=<base64>` query parameter (Smithery-compatible).

### Environment Variables

```bash
PORT=8080                    # Server port (default: 8123)
LOG_LEVEL=info              # Logging level (debug|info|warn|error)
ORIGIN_WHITELIST=*          # Allowed origins (comma-separated)
```

## MCP Tools

### Spec Kit Tools

- `specify.start` - Initialize a new spec-driven project
- `specify.describe` - Create project specifications
- `plan.create` - Generate technical plans
- `tasks.generate` - Create actionable task lists
- `tasks.tick` - Mark tasks as complete

### Quality Tools

- `quality.format` - Run code formatter
- `quality.lint` - Run linter
- `quality.test` - Run tests with coverage
- `quality.security_audit` - Check for vulnerabilities

## Deployment

### Smithery

Deploy to Smithery using the GitHub integration:

1. Connect your repository to Smithery
2. Configure using `smithery.json`
3. Deploy via the Smithery dashboard

### NPM

```bash
npm publish
```

## Protocol Support

- **Streamable HTTP**: Full support (2025-03-26 revision)
- **Session Management**: UUID-based sessions with Mcp-Session-Id header
- **Protocol Version**: MCP-Protocol-Version header negotiation

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT - See [LICENSE](LICENSE) for details.

## References

- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Spec Kit Documentation](https://github.com/github/spec-kit)
- [Smithery Platform](https://smithery.ai)