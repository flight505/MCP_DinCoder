#!/usr/bin/env tsx
/**
 * Example: Connect to Smithery-hosted MCP server
 * 
 * This demonstrates how to connect to an MCP server hosted on Smithery
 * using the Streamable HTTP transport with configuration support.
 * 
 * Note: Replace <your-package> with your actual Smithery package name
 * 
 * Usage:
 *   export SMITHERY_API_KEY="your-api-key"  # If auth required
 *   tsx examples/smithery-client.ts
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/transport/streamable-http.js';

// Configuration for Smithery deployment
const SMITHERY_CONFIG = {
  // Base configuration
  maxRetries: 3,
  timeout: 30000,
  
  // Tool-specific settings
  defaultWorkspace: process.cwd(),
  allowedAgents: ['claude', 'copilot', 'gemini'],
};

async function main() {
  // Get package name from environment or use placeholder
  const packageName = process.env.SMITHERY_PACKAGE || 'mcp-dincoder';
  const apiKey = process.env.SMITHERY_API_KEY;
  
  console.log(`🔗 Connecting to Smithery MCP server: ${packageName}\n`);
  
  // Encode configuration as base64
  const configBase64 = Buffer.from(JSON.stringify(SMITHERY_CONFIG)).toString('base64');
  
  // Create transport for Smithery server
  const transport = new StreamableHTTPClientTransport({
    url: new URL(`https://server.smithery.ai/${packageName}/mcp?config=${configBase64}`),
    fetch: fetch,
    headers: apiKey ? {
      'Authorization': `Bearer ${apiKey}`,
    } : undefined,
  });
  
  // Create client
  const client = new Client({
    name: 'smithery-example-client',
    version: '1.0.0',
  });
  
  try {
    // Connect to server
    await client.connect(transport);
    console.log('✅ Connected to Smithery successfully!\n');
    
    // Get server info
    const serverInfo = await client.getServerInfo();
    console.log('📋 Server Information:');
    console.log(`  - Name: ${serverInfo.name}`);
    console.log(`  - Version: ${serverInfo.version}`);
    console.log(`  - Protocol: ${serverInfo.protocolVersion}`);
    console.log();
    
    // List available tools
    const tools = await client.listTools();
    console.log(`📦 Available tools (${tools.tools.length} total):`);
    
    // Group tools by category
    const toolCategories: Record<string, typeof tools.tools> = {};
    tools.tools.forEach(tool => {
      const category = tool.name.split('.')[0];
      if (!toolCategories[category]) {
        toolCategories[category] = [];
      }
      toolCategories[category].push(tool);
    });
    
    // Display tools by category
    Object.entries(toolCategories).forEach(([category, categoryTools]) => {
      console.log(`\n  ${category}:`);
      categoryTools.forEach(tool => {
        const toolName = tool.name.split('.').slice(1).join('.');
        console.log(`    - ${toolName}: ${tool.description}`);
      });
    });
    console.log();
    
    // Example workflow: Initialize a spec-driven project
    console.log('📝 Example Workflow: Spec-Driven Development\n');
    
    // Step 1: Describe the project
    console.log('Step 1: Creating project specification...');
    const specResult = await client.callTool('specify.describe', {
      description: 'A real-time collaborative markdown editor with WebSocket sync',
      workspacePath: SMITHERY_CONFIG.defaultWorkspace
    });
    const specData = JSON.parse(specResult.content?.[0]?.text || '{}');
    console.log(`  ✓ Spec created: ${specData.details?.filename}`);
    
    // Step 2: Generate technical plan
    console.log('\nStep 2: Generating technical plan...');
    const planResult = await client.callTool('plan.create', {
      constraintsText: 'TypeScript, React, Socket.io, PostgreSQL for persistence',
      specPath: specData.specPath,
      workspacePath: SMITHERY_CONFIG.defaultWorkspace
    });
    const planData = JSON.parse(planResult.content?.[0]?.text || '{}');
    console.log(`  ✓ Plan created: ${planData.details?.planName}`);
    console.log(`  ✓ Data model: ${planData.files?.dataModel ? 'Generated' : 'Not generated'}`);
    console.log(`  ✓ Contracts: ${planData.files?.contracts ? 'Generated' : 'Not generated'}`);
    
    // Step 3: Generate tasks
    console.log('\nStep 3: Generating implementation tasks...');
    const tasksResult = await client.callTool('tasks.generate', {
      scope: 'Real-time collaborative editor MVP',
      planPath: planData.files?.plan,
      workspacePath: SMITHERY_CONFIG.defaultWorkspace
    });
    const tasksData = JSON.parse(tasksResult.content?.[0]?.text || '{}');
    console.log(`  ✓ Tasks generated: ${tasksData.details?.totalTasks || 0} tasks`);
    console.log(`  ✓ Story points: ${tasksData.details?.totalStoryPoints || 0} points`);
    
    // Step 4: Read all artifacts
    console.log('\nStep 4: Reading all artifacts...');
    const artifactsResult = await client.callTool('artifacts.read', {
      artifactType: 'all',
      workspacePath: SMITHERY_CONFIG.defaultWorkspace
    });
    const artifactsData = JSON.parse(artifactsResult.content?.[0]?.text || '{}');
    console.log(`  ✓ Artifacts retrieved: ${Object.keys(artifactsData.artifacts || {}).join(', ')}`);
    
    console.log('\n✨ Spec-driven workflow completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Tip: Make sure the server is deployed to Smithery');
        console.log('   Run: npm run deploy:smithery');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        console.log('\n💡 Tip: Check your SMITHERY_API_KEY environment variable');
      }
    }
  } finally {
    // Close connection
    await client.close();
    console.log('\n👋 Connection closed');
  }
}

// Run the example
main().catch(console.error);