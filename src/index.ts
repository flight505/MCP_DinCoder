/**
 * MCP DinCoder - Spec-Driven MCP Orchestrator
 * Main entry point for the MCP server
 */

import { McpHttpServer } from './http/server.js';
import { TransportMode } from './http/transport.js';
import { createServer } from './server/createServer.js';

export const VERSION = '0.0.1';

// Export for library usage
export { McpHttpServer, createServer, TransportMode };

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || '8123', 10);
  const mode = process.env.TRANSPORT_MODE === 'stateful' 
    ? TransportMode.STATEFUL 
    : TransportMode.STATELESS;
  
  console.error(`MCP DinCoder v${VERSION} - Starting...`);
  console.error(`Port: ${port}, Mode: ${mode}`);
  
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
  
  server.start(port).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}