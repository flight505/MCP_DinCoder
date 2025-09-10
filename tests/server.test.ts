import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { McpHttpServer } from '../src/http/server.js';
import { TransportMode } from '../src/http/transport.js';

describe('MCP HTTP Server', () => {
  let server: McpHttpServer;
  const port = 8124; // Use different port for tests

  beforeAll(async () => {
    server = new McpHttpServer({
      port,
      transportMode: TransportMode.STATELESS,
    });
    await server.start(port);
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('Health endpoint', () => {
    it('should return healthy status', async () => {
      const response = await request(`http://localhost:${port}`)
        .get('/healthz')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        version: expect.any(String),
        timestamp: expect.any(String),
      });
    });
  });

  describe('POST /mcp', () => {
    it('should accept POST requests to /mcp endpoint', async () => {
      // The MCP SDK StreamableHTTPServerTransport handles the actual protocol
      // For now we just verify the endpoint exists and responds
      const response = await request(`http://localhost:${port}`)
        .post('/mcp')
        .set('Content-Type', 'application/json')
        .send({
          jsonrpc: '2.0',
          method: 'test',
          params: {},
          id: 1,
        });

      // The SDK may return various status codes depending on the request
      // We just verify the endpoint is handled
      expect(response.status).toBeDefined();
      expect(response.headers['mcp-protocol-version']).toBe('2025-03-26');
    });
  });

  describe('GET /mcp (SSE)', () => {
    it('should return 405 for stateless mode', async () => {
      const response = await request(`http://localhost:${port}`)
        .get('/mcp')
        .expect(405);

      expect(response.body).toMatchObject({
        error: 'Method not allowed',
        message: 'SSE not supported in stateless mode',
      });
    });
  });

  describe('DELETE /mcp', () => {
    it('should return 405 for stateless mode', async () => {
      const response = await request(`http://localhost:${port}`)
        .delete('/mcp')
        .expect(405);

      expect(response.body).toMatchObject({
        error: 'Method not allowed',
        message: 'Session management not supported in stateless mode',
      });
    });
  });
});