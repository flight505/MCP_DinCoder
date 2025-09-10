import request from 'supertest';
import { McpHttpServer } from './src/http/server.js';
import { TransportMode } from './src/http/transport.js';

async function test() {
  const server = new McpHttpServer({ 
    port: 8127, 
    transportMode: TransportMode.STATELESS
  });
  
  const app = server.app;
  await server.start();
  
  // Test invalid request (no jsonrpc field)
  const response = await request(app)
    .post('/mcp')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json, text/event-stream')
    .send({
      id: 1,
      method: 'tools/list',
      params: {}
    });
  
  console.log('Response status:', response.status);
  console.log('Response headers content-type:', response.headers['content-type']);
  console.log('Response body:', JSON.stringify(response.body, null, 2));
  console.log('Response text:', response.text);
  
  await server.stop();
  process.exit(0);
}

test().catch(console.error);
