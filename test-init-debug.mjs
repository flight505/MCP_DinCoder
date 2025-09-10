import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './src/server/createServer.js';

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => 'test-session',
  enableJsonResponse: true
});

const server = createServer();
await server.connect(transport);

// Create mock req/res
const req = {
  body: {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-03-26',
      capabilities: {}
    }
  },
  headers: {
    'accept': 'application/json, text/event-stream',
    'content-type': 'application/json'
  }
};

const res = {
  headers: {},
  statusCode: null,
  setHeader(key, value) {
    this.headers[key] = value;
  },
  writeHead(status, headers) {
    this.statusCode = status;
    Object.assign(this.headers, headers);
  },
  write(data) {
    console.log('Write:', data);
  },
  end(data) {
    console.log('End:', data);
    console.log('Status:', this.statusCode);
    console.log('Headers:', this.headers);
  }
};

try {
  await transport.handleRequest(req, res, req.body);
} catch (error) {
  console.error('Error:', error);
}

process.exit(0);
