# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Spec-Driven MCP Orchestrator** that implements a Model Context Protocol server with Streamable HTTP transport. The server exposes Spec Kit tools (specify, plan, tasks) to enable AI-assisted spec-driven development workflows.

## Critical Requirements

- **Protocol**: MCP Streamable HTTP (Protocol Revision 2025-03-26)
- **TypeScript SDK**: @modelcontextprotocol/sdk v1.17.5+ 
- **Node.js**: >=20
- **Transport**: HTTP only (STDIO deprecated Sept 7, 2025 on Smithery)
- **TypeScript Config**: MUST use module/moduleResolution: "NodeNext"

## Development Commands

Once bootstrapped (see plan.md Story 2):

```bash
# Development
npm run dev          # Start development server with hot-reload
npm run build        # Build TypeScript to dist/
npm run start:local  # Start production server locally

# Quality
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Deployment
npm pack             # Create tarball for inspection
npm publish          # Publish to NPM (after version bump)
```

## Architecture

### Core Components

1. **HTTP Transport Layer** (`src/http/`)
   - `app.ts`: Express application setup
   - `transport.ts`: StreamableHTTPServerTransport wrapper
   - Handles `/mcp` endpoint with POST/GET/DELETE methods
   - Session management via Mcp-Session-Id headers

2. **MCP Server** (`src/server/`)
   - `createServer.ts`: Factory for McpServer instances
   - Registers tools, resources, and prompts
   - **CRITICAL**: For stateless deployments, create new server/transport per request

3. **Spec Kit Tools** (`src/tools/`)
   - `specify.ts`: /specify command integration
   - `plan.ts`: /plan command integration
   - `tasks.ts`: /tasks command integration
   - `quality.ts`: Code quality tools (lint, test, format)

4. **Configuration** (`src/config/`)
   - `schema.ts`: Zod schemas for validation
   - Handles Smithery ?config=<base64> parameter

5. **Security** (`src/security/`)
   - `origin.ts`: Origin validation middleware
   - `auth.ts`: Bearer token/API key authentication

## Session Management Patterns

### Stateless Mode (Serverless/Lambda)
```typescript
// Create new instances per request
app.post('/mcp', async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ 
    sessionIdGenerator: undefined 
  });
  // Handle request...
});
```

### Stateful Mode (Persistent Server)
```typescript
// Maintain session map
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
// Use crypto.randomUUID() for session IDs
```

## Error Handling

- Use `McpError` class with `ErrorCode` enum for protocol errors
- All diagnostic output to `stderr` only (never stdout)
- Wrap handlers in try-catch blocks
- Return valid JSON-RPC error responses

## Testing Strategy

- Unit tests for each tool handler
- Integration tests for HTTP endpoints
- SSE stream tests for event framing
- Session management tests
- Coverage requirement: 90% statements

## Deployment

### Smithery
- Create `smithery.json` with registry metadata
- Add `Dockerfile` for container deployment
- Use GitHub integration for deployment
- Test with Smithery client after deployment

### NPM
- Ensure proper package.json exports
- Build with tsup for ESM output
- Include type definitions

## Project Plan

Refer to `plan.md` for the complete 23-story implementation checklist. Each story contains granular 1-point tasks that can be completed independently.

## Known Pitfalls to Avoid

1. **Request ID Collisions**: Always create new transport instances in stateless mode
2. **Session ID Format**: Must be visible ASCII (0x21-0x7E) only
3. **Timeout Issues**: Send progress updates for long-running operations (>60s)
4. **Browser Compatibility**: Test session management in both Node.js and browser
5. **STDIO Logging**: Never log to stdout when STDIO transport is active

## Reference Implementations

- invariantlabs-ai/mcp-streamable-http
- ferrants/mcp-streamable-http-typescript-server
- modelcontextprotocol/typescript-sdk examples