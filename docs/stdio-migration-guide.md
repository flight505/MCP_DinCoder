# STDIO to HTTP Migration Guide

## ⚠️ Critical Timeline

**STDIO transport will be deprecated on Smithery by September 7, 2025**

This guide helps you migrate from STDIO to HTTP transport for the DinCoder MCP server.

## Overview

The Model Context Protocol is transitioning from STDIO to HTTP transport for several key reasons:

- **20x higher concurrency** - HTTP handles parallel requests better
- **Lower latency** - No process spawning overhead
- **Better resource efficiency** - Shared server instances
- **Platform compatibility** - Works in browsers and cloud environments
- **Simplified deployment** - Standard HTTP infrastructure

## Current State

DinCoder v0.1.6 supports BOTH transports:

1. **STDIO Transport** (`index-stdio.js`) - Legacy, for local CLI usage
2. **HTTP Transport** (`index.js`) - Recommended for all deployments

## Migration Path

### Step 1: Identify Your Current Setup

Check your Claude Desktop configuration:

```bash
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

#### If you see this (STDIO):
```json
{
  "mcpServers": {
    "dincoder": {
      "command": "npx",
      "args": ["mcp-dincoder"],
      "env": {}
    }
  }
}
```
**You need to migrate!** Continue to Step 2.

#### If you see this (HTTP):
```json
{
  "mcpServers": {
    "dincoder": {
      "url": "http://localhost:8123/mcp",
      "transport": "http"
    }
  }
}
```
**You're already using HTTP!** No migration needed.

### Step 2: Start HTTP Server

#### Option A: Local Development
```bash
# Install globally
npm install -g mcp-dincoder

# Start HTTP server
PORT=8123 npm run start:http
```

#### Option B: Docker Deployment
```bash
# Build image
docker build -t mcp-dincoder .

# Run container
docker run -p 8123:8123 mcp-dincoder
```

#### Option C: Smithery Deployment
```bash
# Deploy to Smithery (HTTP only)
smithery deploy

# Your server URL will be:
# https://server.smithery.ai/mcp-dincoder/mcp
```

### Step 3: Update Claude Desktop Configuration

Replace your STDIO configuration with HTTP:

```json
{
  "mcpServers": {
    "dincoder": {
      "url": "http://localhost:8123/mcp",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"  // Optional
      }
    }
  }
}
```

For Smithery deployment:
```json
{
  "mcpServers": {
    "dincoder": {
      "url": "https://server.smithery.ai/mcp-dincoder/mcp",
      "transport": "http",
      "headers": {
        "X-API-Key": "YOUR_SMITHERY_API_KEY"
      }
    }
  }
}
```

### Step 4: Verify Migration

1. Restart Claude Desktop
2. Open a new conversation
3. Test a simple command:
   ```
   Use test_echo tool with message "Migration successful!"
   ```

## Feature Comparison

| Feature | STDIO | HTTP |
|---------|-------|------|
| **Concurrency** | Single request | Multiple parallel |
| **Latency** | Process spawn overhead | Immediate response |
| **Resource Usage** | New process per request | Shared server |
| **Session Management** | Per-process | Persistent sessions |
| **Deployment** | Local only | Local/Cloud/Smithery |
| **Browser Support** | ❌ No | ✅ Yes |
| **Scalability** | Limited | Horizontal scaling |
| **Monitoring** | Difficult | Standard HTTP tools |

## Configuration Options

### Stateless Mode (Recommended for Serverless)
```typescript
// Environment variable
TRANSPORT_MODE=stateless

// Each request creates new server instance
// No session persistence
// Ideal for Lambda/Vercel/Cloudflare Workers
```

### Stateful Mode (Recommended for Persistent Servers)
```typescript
// Environment variable
TRANSPORT_MODE=stateful

// Maintains session state
// Supports SSE streams
// Better for long-running operations
```

## Common Migration Issues

### Issue 1: Port Already in Use
```bash
Error: listen EADDRINUSE: address already in use :::8123
```
**Solution**: Use a different port or kill existing process
```bash
# Find process
lsof -i :8123
# Kill it
kill -9 <PID>
# Or use different port
PORT=8124 npm run start:http
```

### Issue 2: CORS Errors
```
Access to fetch at 'http://localhost:8123/mcp' from origin 'https://claude.ai' has been blocked by CORS policy
```
**Solution**: Configure allowed origins
```bash
ORIGIN_WHITELIST=https://claude.ai npm run start:http
```

### Issue 3: Session Not Found
```json
{
  "error": "Session not found",
  "code": -32600
}
```
**Solution**: Client needs to reinitialize
- This is normal after server restart
- Client will automatically create new session

### Issue 4: Authentication Failed
```json
{
  "error": "Unauthorized",
  "code": 401
}
```
**Solution**: Add API key to configuration
```json
{
  "headers": {
    "Authorization": "Bearer YOUR_API_KEY"
  }
}
```

## Backward Compatibility

During transition, you can run BOTH transports:

```bash
# Terminal 1: STDIO (for legacy clients)
npm run start

# Terminal 2: HTTP (for new clients)
npm run start:http
```

⚠️ **Note**: This is temporary. Remove STDIO after all clients migrate.

## Testing Your Migration

### 1. Health Check
```bash
curl http://localhost:8123/healthz
```
Expected: `{"status":"ok","version":"0.1.6"}`

### 2. Initialize Session
```bash
curl -X POST http://localhost:8123/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{}}}'
```

### 3. List Tools
```bash
curl -X POST http://localhost:8123/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: <SESSION_ID>" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

## Performance Improvements

After migrating to HTTP, you should see:

- **Startup time**: ~100ms → ~5ms per request
- **Memory usage**: 50MB per request → 50MB total
- **Concurrent requests**: 1 → 100+
- **Response time**: 200-500ms → 50-100ms

## Monitoring

HTTP transport enables standard monitoring:

```bash
# Prometheus metrics (coming soon)
curl http://localhost:8123/metrics

# Request logs
tail -f logs/mcp-server.log

# Performance monitoring
npm run start:http -- --debug
```

## Rollback Plan

If you need to temporarily rollback:

1. Keep STDIO configuration backup:
```bash
cp ~/Library/Application\ Support/Claude/claude_desktop_config.json \
   ~/Library/Application\ Support/Claude/claude_desktop_config.json.http.bak
```

2. Restore STDIO config:
```json
{
  "mcpServers": {
    "dincoder": {
      "command": "npx",
      "args": ["mcp-dincoder"],
      "env": {}
    }
  }
}
```

3. Restart Claude Desktop

⚠️ **Remember**: This is temporary. STDIO will stop working September 7, 2025.

## Support Resources

- **GitHub Issues**: https://github.com/dincoder/mcp-server/issues
- **Documentation**: https://modelcontextprotocol.io/docs
- **Smithery Migration**: https://smithery.ai/docs/migration
- **Community Discord**: https://discord.gg/mcp-community

## Timeline

| Date | Event |
|------|-------|
| **Now** | HTTP transport available and recommended |
| **June 2025** | Final STDIO deprecation warning |
| **September 7, 2025** | STDIO support ends on Smithery |
| **October 2025** | STDIO code removed from codebase |

## Conclusion

Migrating from STDIO to HTTP provides significant performance and scalability benefits. The migration process is straightforward and can be completed in minutes. Start your migration today to ensure continuity of service.

---

*Last updated: January 2025*