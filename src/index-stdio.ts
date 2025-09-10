#!/usr/bin/env node
/**
 * MCP DinCoder Server - STDIO Transport Entry Point
 * 
 * This is the main entry point for running the server with stdio transport.
 * Used when installed via npm and run through npx or Claude Code.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server/createServer.js';

async function main() {
  try {
    // Create the MCP server
    const server = createServer({
      name: 'DinCoder',
      version: '0.1.3',
      capabilities: {
        tools: true,
        resources: false,
        prompts: false,
      },
    });

    // Create stdio transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    // Log to stderr (stdout is used for communication)
    console.error('MCP DinCoder Server started (stdio transport)');
    console.error('Ready to receive requests...');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.error('\nShutting down...');
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('\nShutting down...');
      await server.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };