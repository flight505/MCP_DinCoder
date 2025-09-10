import { Request, Response } from 'express';
import express from 'express';
import { createServer } from '../server/createServer.js';
import { getConfig, Config } from '../config/index.js';
import {
  corsMiddleware,
  authMiddleware,
  rateLimitMiddleware,
  securityHeadersMiddleware,
  validateRequestMiddleware,
  loggingMiddleware,
} from '../middleware/security.js';
import {
  // TransportMode,
  SessionManager,
  createStatelessTransport,
  getSessionIdFromRequest,
  isInitRequest,
  getProtocolVersion,
} from './transport.js';

/**
 * Enhanced MCP HTTP Server with full security and configuration
 */
export class EnhancedMcpHttpServer {
  private app: express.Express;
  private config: Config;
  private sessionManager?: SessionManager;
  private server?: any;

  constructor(runtimeConfig?: Partial<Config>) {
    // Get configuration from all sources
    const queryConfig = this.getQueryConfig();
    this.config = getConfig(runtimeConfig, queryConfig);
    
    // Create Express app
    this.app = express();
    
    // Apply middleware in order
    this.setupMiddleware();
    
    // Initialize session manager for stateful mode
    if (this.config.mode === 'stateful') {
      this.sessionManager = new SessionManager(this.config.sessionTimeout);
    }
    
    // Setup endpoints
    this.setupEndpoints();
  }

  /**
   * Get config from query parameter (Smithery support)
   */
  private getQueryConfig(): string | undefined {
    // In a real scenario, this would be extracted from the request
    // For now, we'll check environment variable
    return process.env.SMITHERY_CONFIG_BASE64;
  }

  /**
   * Setup middleware stack
   */
  private setupMiddleware(): void {
    // Body parsing (must be first for JSON parsing)
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Security headers
    this.app.use(securityHeadersMiddleware());
    
    // Logging
    this.app.use(loggingMiddleware(this.config));
    
    // CORS
    this.app.use(corsMiddleware(this.config));
    
    // Authentication
    this.app.use(authMiddleware(this.config));
    
    // Rate limiting
    this.app.use(rateLimitMiddleware(this.config));
    
    // Request validation
    this.app.use(validateRequestMiddleware());
  }

  /**
   * Setup MCP endpoints
   */
  private setupEndpoints(): void {
    // Health check
    this.app.get('/healthz', (_req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        version: process.env.npm_package_version || '0.0.1',
        mode: this.config.mode,
        timestamp: new Date().toISOString(),
      });
    });

    // POST /mcp - Main JSON-RPC endpoint
    this.app.post('/mcp', async (req: Request, res: Response): Promise<void> => {
      try {
        const protocolVersion = getProtocolVersion(req);
        res.setHeader('MCP-Protocol-Version', protocolVersion);
        
        // Parse Smithery config from query if present
        const configBase64 = req.query.config as string | undefined;
        if (configBase64) {
          // Update config with Smithery settings
          const smitheryConfig = getConfig(this.config, configBase64);
          Object.assign(this.config, smitheryConfig);
        }
        
        if (this.config.mode === 'stateless') {
          await this.handleStatelessRequest(req, res);
        } else {
          await this.handleStatefulRequest(req, res);
        }
      } catch (error) {
        console.error('Error handling MCP request:', error);
        
        // Return JSON-RPC error
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal error',
            data: this.config.logLevel === 'debug' ? error : undefined,
          },
          id: null,
        });
      }
    });

    // GET /mcp - SSE stream
    this.app.get('/mcp', async (req: Request, res: Response): Promise<void> => {
      try {
        const protocolVersion = getProtocolVersion(req);
        
        if (this.config.mode === 'stateless') {
          res.status(405).json({
            error: 'Method not allowed',
            message: 'SSE not supported in stateless mode',
          });
          return;
        }
        
        const sessionId = getSessionIdFromRequest(req);
        if (!sessionId) {
          res.status(400).json({
            error: 'Bad request',
            message: 'Session ID required for SSE',
          });
          return;
        }
        
        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('MCP-Protocol-Version', protocolVersion);
        
        // Send initial connection event
        res.write('data: {"type":"connected"}\n\n');
        
        // Keep alive with ping
        const interval = setInterval(() => {
          res.write(':ping\n\n');
        }, 30000);
        
        req.on('close', () => {
          clearInterval(interval);
          if (this.config.logLevel === 'debug') {
            console.log(`SSE connection closed for session: ${sessionId}`);
          }
        });
        
      } catch (error) {
        console.error('Error handling SSE request:', error);
        res.status(500).json({
          error: 'Internal server error',
        });
      }
    });

    // DELETE /mcp - End session
    this.app.delete('/mcp', async (req: Request, res: Response): Promise<void> => {
      try {
        if (this.config.mode === 'stateless') {
          res.status(405).json({
            error: 'Method not allowed',
            message: 'Session management not supported in stateless mode',
          });
          return;
        }
        
        const sessionId = getSessionIdFromRequest(req);
        if (!sessionId) {
          res.status(400).json({
            error: 'Bad request',
            message: 'Session ID required',
          });
          return;
        }
        
        // Remove session
        if (this.sessionManager) {
          this.sessionManager.removeSession(sessionId);
        }
        
        res.status(204).send();
      } catch (error) {
        console.error('Error handling DELETE request:', error);
        res.status(500).json({
          error: 'Internal server error',
        });
      }
    });

    // 404 handler
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not found',
        message: 'Endpoint not found',
      });
    });

    // Error handler
    this.app.use((err: any, _req: Request, res: Response, _next: any) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: err.message || 'An unexpected error occurred',
      });
    });
  }

  /**
   * Handle stateless request
   */
  private async handleStatelessRequest(req: Request, res: Response): Promise<void> {
    const server = createServer();
    const transport = createStatelessTransport();
    
    res.on('close', () => {
      transport.close();
      server.close();
    });
    
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }

  /**
   * Handle stateful request
   */
  private async handleStatefulRequest(req: Request, res: Response): Promise<void> {
    const isInit = isInitRequest(req.body);
    const requestSessionId = getSessionIdFromRequest(req);
    
    if (!isInit && !requestSessionId) {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Session ID required for non-initialization requests',
        },
        id: null,
      });
      return;
    }
    
    const { transport, sessionId, isNew } = this.sessionManager!.getSession(
      isInit ? undefined : requestSessionId
    );
    
    if (isInit && isNew) {
      res.setHeader('Mcp-Session-Id', sessionId);
    }
    
    if (isNew) {
      const server = createServer();
      await server.connect(transport);
    }
    
    await transport.handleRequest(req, res, req.body);
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      const port = this.config.port;
      const host = this.config.host;
      
      this.server = this.app.listen(port, host, () => {
        console.log(`MCP server running at http://${host}:${port}`);
        console.log(`Mode: ${this.config.mode}`);
        console.log(`Auth: ${this.config.enableAuth ? 'enabled' : 'disabled'}`);
        console.log(`Rate limiting: ${this.config.rateLimit.enabled ? 'enabled' : 'disabled'}`);
        console.log(`Protocol version: 2025-03-26`);
        resolve();
      });
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('MCP server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}