# Smithery STDIO to Streamable HTTP Migration Guide

## Overview

Smithery is deprecating STDIO transport support for remotely hosted servers on **September 7, 2025**. This guide provides comprehensive migration steps from STDIO to Streamable HTTP transport.

## Why Migrate?

### Benefits of Streamable HTTP over STDIO
- **20x Higher Concurrency**: Handle multiple client connections simultaneously
- **Lower Latency**: Direct HTTP communication without process overhead
- **Better Resource Efficiency**: Reduced memory and CPU usage
- **Future-Proofing**: Alignment with MCP Protocol Revision 2025-03-26

## Migration Timeline

- **Now - September 6, 2025**: Migration period
- **September 7, 2025**: STDIO transport discontinued on Smithery
- **After September 7, 2025**: Only Streamable HTTP transport supported

## Migration Approaches

### 1. TypeScript with Smithery CLI (Recommended)

This is the simplest migration path for TypeScript projects.

#### Step 1: Install Smithery CLI
```bash
npm install -g @smithery/cli
```

#### Step 2: Create smithery.yaml
```yaml
runtime: "typescript"
```

#### Step 3: Update package.json
```json
{
  "name": "your-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "module": "src/index.ts",
  "scripts": {
    "build": "npx @smithery/cli build",
    "dev": "npx @smithery/cli dev"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.17.5",
    "zod": "^3.25.76"
  }
}
```

#### Step 4: Restructure Server Code

Convert from STDIO transport:
```typescript
// OLD: STDIO transport
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({ name: "server", version: "1.0.0" });
const transport = new StdioServerTransport();
await server.connect(transport);
```

To Smithery-compatible structure:
```typescript
// NEW: Smithery HTTP transport
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Optional configuration schema
export const configSchema = z.object({
  apiKey: z.string().optional().describe("API key for external services"),
  timeout: z.number().default(30000).describe("Request timeout in ms")
});

// Main server factory function
export default function createServer({ config }) {
  const server = new McpServer({
    name: "your-server-name",
    version: "1.0.0",
  });

  // Register your tools here
  server.tool("example_tool", {
    description: "Example tool",
    inputSchema: z.object({
      input: z.string()
    })
  }, async ({ input }) => {
    return {
      content: [{
        type: "text",
        text: `Processed: ${input}`
      }]
    };
  });

  // Return the server instance
  return server.server;
}
```

#### Step 5: Deploy to Smithery
1. Push code to GitHub
2. Connect GitHub repository to Smithery
3. Navigate to Deployments tab
4. Click Deploy

### 2. TypeScript Custom Container

For projects requiring custom middleware or complex dependencies.

#### Create Dockerfile
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

#### Update server to handle HTTP endpoints
```typescript
import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode
    enableJsonResponse: true
  });
  
  const server = createServer();
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(3000);
```

### 3. Python with FastMCP

For Python projects, use FastMCP with custom container deployment.

## Using the Migration Guide MCP Server

Smithery provides an MCP server to help with migration:

### Install the Migration Guide
```bash
claude mcp add migration-guide -- npx @smithery-ai/migration-guide-mcp
```

### Available Migration Tools

1. **get_migration_overview**: Get comprehensive migration requirements
2. **validate_smithery_yaml**: Validate your Smithery configuration
3. **validate_package_json**: Check package.json compatibility
4. **create_migration_template**: Generate migration templates
5. **generate_smithery_yaml**: Create configuration file

### Usage Example
```
"Use the migration guide to check my current configuration"
"Generate a migration template for TypeScript with Smithery CLI"
"Validate my smithery.yaml file"
```

## Key Differences: STDIO vs Streamable HTTP

### STDIO Transport
- Single client connection
- Process-based communication
- Uses stdin/stdout
- Synchronous message handling
- Local execution only

### Streamable HTTP Transport
- Multiple concurrent connections
- HTTP-based communication
- RESTful endpoints
- Asynchronous with SSE support
- Remote deployment capable

## Testing Your Migration

### Local Testing
```bash
# Run development server
npm run dev

# Test with curl
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}'
```

### Smithery Testing
After deployment, use the Smithery playground to test your server's functionality.

## Common Migration Issues

### Issue 1: Configuration Parsing
**Problem**: Server doesn't receive configuration
**Solution**: Ensure `configSchema` is exported and properly typed with Zod

### Issue 2: Session Management
**Problem**: Session IDs not working
**Solution**: Use crypto.randomUUID() and ensure IDs contain only visible ASCII

### Issue 3: Transport Errors
**Problem**: "Transport already started" errors
**Solution**: Don't call transport.start() - server.connect() handles this

### Issue 4: Missing Content-Type
**Problem**: Responses have no Content-Type header
**Solution**: Wrap transport to add headers for error responses

## Rollback Plan

If issues arise post-migration:
1. Keep STDIO version tagged in git
2. Maintain parallel deployments during transition
3. Use feature flags to switch between transports
4. Monitor error rates and performance metrics

## Support Resources

- [Smithery Documentation](https://smithery.ai/docs)
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-03-26)
- [Migration Guide MCP Server](https://smithery.ai/server/@smithery-ai/migration-guide-mcp)
- [GitHub Issues](https://github.com/smithery-ai/cli/issues)

## Checklist

- [ ] Review current STDIO implementation
- [ ] Choose migration approach (CLI, Custom Container, or Python)
- [ ] Install necessary dependencies
- [ ] Create smithery.yaml configuration
- [ ] Restructure server code for HTTP transport
- [ ] Test locally with development server
- [ ] Deploy to Smithery
- [ ] Verify deployment with Smithery playground
- [ ] Update client configurations
- [ ] Monitor for issues post-migration
- [ ] Remove STDIO code after successful migration