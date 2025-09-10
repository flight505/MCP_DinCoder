import request from 'supertest';
import { McpHttpServer } from './src/http/server.js';
import { TransportMode } from './src/http/transport.js';

const server = new McpHttpServer({ 
  port: 8999, 
  transportMode: TransportMode.STATELESS
});

const app = server.app;
await server.start();

const response = await request(app)
  .post('/mcp')
  .set('Content-Type', 'application/json')
  .set('MCP-Protocol-Version', '2025-03-26')
  .send({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-03-26',
      capabilities: {}
    }
  });

console.log('Status:', response.status);
console.log('Content-Type header sent:', response.request.header['Content-Type']);
console.log('Response headers:', response.headers);
console.log('Body:', response.body);

await server.stop();
process.exit(0);
