const request = require('supertest');
const { McpHttpServer } = require('./dist/http/server.js');
const { TransportMode } = require('./dist/http/transport.js');

async function test() {
  const server = new McpHttpServer({ 
    port: 8127, 
    transportMode: TransportMode.STATELESS
  });
  
  const app = server.app;
  await server.start();
  
  console.log('Server started, sending test request...');
  
  const response = await request(app)
    .post('/mcp')
    .set('Content-Type', 'application/json')
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
      id: 1
    });
  
  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);
  console.log('Response body:', JSON.stringify(response.body, null, 2));
  
  await server.stop();
  process.exit(0);
}

test().catch(console.error);
