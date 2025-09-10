#!/usr/bin/env tsx
/**
 * Example: Connect to local MCP server using SDK client
 * 
 * This demonstrates how to connect to a locally running MCP server
 * and execute tools via the Streamable HTTP transport.
 * 
 * Usage:
 *   npm run start:local  # In one terminal
 *   tsx examples/local-client.ts  # In another terminal
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/transport/streamable-http.js';

async function main() {
  console.log('🔗 Connecting to local MCP server...\n');
  
  // Create transport for local server
  const transport = new StreamableHTTPClientTransport({
    url: new URL('http://localhost:3000/mcp'),
    fetch: fetch,
  });
  
  // Create client
  const client = new Client({
    name: 'example-client',
    version: '1.0.0',
  });
  
  try {
    // Connect to server
    await client.connect(transport);
    console.log('✅ Connected successfully!\n');
    
    // List available tools
    const tools = await client.listTools();
    console.log('📦 Available tools:');
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log();
    
    // Example 1: Echo test
    console.log('📝 Example 1: Echo test');
    const echoResult = await client.callTool('test.echo', {
      message: 'Hello from local client!'
    });
    console.log('Response:', echoResult.content?.[0]?.text);
    console.log();
    
    // Example 2: Quality check
    console.log('📝 Example 2: License check');
    const licenseResult = await client.callTool('quality.license_check', {
      workspacePath: process.cwd()
    });
    const licenseData = JSON.parse(licenseResult.content?.[0]?.text || '{}');
    console.log('License check result:');
    console.log(`  - Total packages: ${licenseData.details?.totalPackages || 0}`);
    console.log(`  - All compatible: ${licenseData.success ? 'Yes' : 'No'}`);
    console.log();
    
    // Example 3: Research append
    console.log('📝 Example 3: Append research note');
    const researchResult = await client.callTool('research.append', {
      topic: 'MCP Client Connection',
      content: 'Successfully connected to local MCP server using StreamableHTTPClientTransport.',
      workspacePath: process.cwd()
    });
    const researchData = JSON.parse(researchResult.content?.[0]?.text || '{}');
    console.log('Research note added:', researchData.success ? 'Success' : 'Failed');
    console.log();
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close connection
    await client.close();
    console.log('👋 Connection closed');
  }
}

// Run the example
main().catch(console.error);