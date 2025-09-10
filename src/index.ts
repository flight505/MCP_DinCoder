/**
 * MCP DinCoder - Spec-Driven MCP Orchestrator
 * Main entry point for the MCP server
 */

import { McpHttpServer } from './http/server.js';
import { TransportMode } from './http/transport.js';
import { createServer } from './server/createServer.js';

export const VERSION = '0.1.4';

// Export for library usage
export { McpHttpServer, createServer, TransportMode };

// Default export for Smithery compatibility
export default function createSmitheryServer(config?: any) {
  const port = parseInt(config?.port || process.env.PORT || '8123', 10);
  const mode = config?.transportMode === 'stateful' 
    ? TransportMode.STATEFUL 
    : TransportMode.STATELESS;

  const server = new McpHttpServer({
    port,
    transportMode: mode,
    logging: {
      level: config?.logLevel || 'info',
    },
    security: {
      apiKey: config?.apiKey || process.env.API_KEY,
      originWhitelist: config?.originWhitelist?.split(',') || process.env.ORIGIN_WHITELIST?.split(','),
    },
  });

  // Return the server instance without starting it
  // Smithery will handle the startup
  return server;
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