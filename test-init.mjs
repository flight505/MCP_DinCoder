import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

const body = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-03-26',
    capabilities: {}
  }
};

console.log('Is init request:', isInitializeRequest(body));
console.log('Body method:', body.method);
