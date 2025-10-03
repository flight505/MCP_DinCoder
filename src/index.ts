/**
 * MCP DinCoder - Spec-Driven MCP Orchestrator
 * Main entry point for the MCP server
 */

import { McpHttpServer } from './http/server.js';
import { TransportMode } from './http/transport.js';
import { createServer } from './server/createServer.js';
import { z } from 'zod';

export const VERSION = '0.1.9';

// Export for library usage
export { McpHttpServer, createServer, TransportMode };

/**
 * Configuration schema for Smithery deployments
 */
export const configSchema = z.object({
  apiKey: z.string().optional().describe('Optional API key for authentication'),
  originWhitelist: z.string().optional().describe('Comma-separated list of allowed origins'),
  transportMode: z.enum(['stateless', 'stateful']).default('stateless').describe('Transport mode'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info').describe('Logging level'),
  workspacePath: z.string().optional().describe('Default workspace path for spec operations'),
});

/**
 * Default export for Smithery TypeScript runtime
 * Returns the MCP server instance (server.server property)
 */
export default function createSmitheryServer({ config }: { config?: z.infer<typeof configSchema> }) {
  // Create the MCP server instance
  const mcpServer = createServer({
    name: 'mcp-dincoder',
    version: VERSION,
  });

  // Store config in environment for tools to access
  if (config?.workspacePath) {
    process.env.WORKSPACE_PATH = config.workspacePath;
  }
  if (config?.apiKey) {
    process.env.API_KEY = config.apiKey;
  }
  if (config?.originWhitelist) {
    process.env.ORIGIN_WHITELIST = config.originWhitelist;
  }
  if (config?.logLevel) {
    process.env.LOG_LEVEL = config.logLevel;
  }

  // Return the McpServer instance (not the wrapper)
  // Smithery will handle HTTP transport and port binding
  return mcpServer;
}

// Only start server if this is the main module being run directly
// This prevents auto-start when imported as a module
if (import.meta.url === `file://${process.argv[1]}` || process.env.START_SERVER === 'true') {
  console.error('===== MCP DinCoder Server Startup =====');
  console.error(`Version: ${VERSION}`);
  console.error(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.error(`Transport: ${process.env.MCP_TRANSPORT || 'not set'}`);

  const port = parseInt(process.env.PORT || '8123', 10);
  const mode = process.env.TRANSPORT_MODE === 'stateful' 
    ? TransportMode.STATEFUL 
    : TransportMode.STATELESS;

  console.error(`Configuration:`);
  console.error(`  Port: ${port}`);
  console.error(`  Mode: ${mode}`);
  console.error(`  Host: ${process.env.MCP_HOST || '0.0.0.0'}`);

  const server = new McpHttpServer({
    port,
    transportMode: mode,
    logging: {
      level: (process.env.LOG_LEVEL as any) || 'info',
    },
    security: {
      apiKey: process.env.API_KEY,
      originWhitelist: process.env.ORIGIN_WHITELIST?.split(','),
    },
  });

  console.error('Starting HTTP server...');
  server.start(port).then(() => {
    console.error('✅ Server started successfully');
    console.error('Ready to accept connections');
  }).catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}