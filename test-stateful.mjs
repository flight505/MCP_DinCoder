import request from 'supertest';
import { McpHttpServer } from './src/http/server.js';
import { TransportMode } from './src/http/transport.js';

async function test() {
  const server = new McpHttpServer({ 
    port: 8127, 
    transportMode: TransportMode.STATEFUL
  });
  
  const app = server.app;
  await server.start();
  
  console.log('Testing stateful mode...');
  
  // First try tools/list without initialization
  console.log('\n1. tools/list without initialization:');
  let response = await request(app)
    .post('/mcp')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json, text/event-stream')
    .send({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    });
  
  console.log('Response status:', response.status);
  console.log('Response body:', JSON.stringify(response.body, null, 2));
  
  // Now initialize
  console.log('\n2. Initialize:');
  response = await request(app)
    .post('/mcp')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json, text/event-stream')
    .send({
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      },
      id: 2
    });
  
  console.log('Response status:', response.status);
  console.log('Response headers Mcp-Session-Id:', response.headers['mcp-session-id']);
  console.log('Response body:', JSON.stringify(response.body, null, 2));
  
  const sessionId = response.headers['mcp-session-id'];
  
  // Now try tools/list with session ID
  console.log('\n3. tools/list with session ID:');
  response = await request(app)
    .post('/mcp')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json, text/event-stream')
    .set('Mcp-Session-Id', sessionId)
    .send({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/list',
      params: {}
    });
  
  console.log('Response status:', response.status);
  console.log('Response body:', JSON.stringify(response.body, null, 2));
  
  await server.stop();
  process.exit(0);
}

test().catch(console.error);
