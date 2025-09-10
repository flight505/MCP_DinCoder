import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { McpHttpServer } from '../src/http/server.js';
import { TransportMode } from '../src/http/transport.js';

/**
 * Simple MCP Conformance Tests
 * 
 * Basic tests to verify MCP server functionality
 */

describe('Simple MCP Conformance', () => {
  let server: McpHttpServer;
  let app: any;
  const port = 8126;

  beforeAll(async () => {
    server = new McpHttpServer({ 
      port, 
      transportMode: TransportMode.STATELESS
    });
    app = (server as any).app;
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('Basic Endpoints', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/healthz');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
    });

    it('should have /mcp endpoint', async () => {
      const response = await request(app)
        .post('/mcp')
        .set('Content-Type', 'application/json')
        .send({}); // Send empty object to trigger validation
      
      // Should return 400 for invalid request, not 404
      expect(response.status).not.toBe(404);
    });

    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown');
      
      expect(response.status).toBe(404);
    });
  });

  describe('Stateless Mode Behavior', () => {
    it('should return 405 for GET /mcp in stateless mode', async () => {
      const response = await request(app)
        .get('/mcp');
      
      expect(response.status).toBe(405);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('stateless');
    });

    it('should return 405 for DELETE /mcp in stateless mode', async () => {
      const response = await request(app)
        .delete('/mcp');
      
      expect(response.status).toBe(405);
    });
  });

  describe('Content Type Validation', () => {
    it('should accept application/json', async () => {
      const response = await request(app)
        .post('/mcp')
        .set('Content-Type', 'application/json')
        .send('{}');
      
      // Should process the request (may return error for invalid JSON-RPC)
      expect(response.status).not.toBe(415); // Not Unsupported Media Type
    });

    it('should handle text/plain gracefully', async () => {
      const response = await request(app)
        .post('/mcp')
        .set('Content-Type', 'text/plain')
        .send('not json');
      
      expect(response.status).toBe(400); // 400 Bad Request for invalid JSON
    });
  });

  describe('Protocol Headers', () => {
    it('should return MCP-Protocol-Version header', async () => {
      const response = await request(app)
        .post('/mcp')
        .set('Content-Type', 'application/json')
        .send({});
      
      expect(response.headers).toHaveProperty('mcp-protocol-version');
      expect(response.headers['mcp-protocol-version']).toBe('2025-03-26');
    });
  });
});