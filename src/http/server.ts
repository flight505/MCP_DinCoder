import { Request, Response } from 'express';
import { createServer } from '../server/createServer.js';
import { createApp, AppConfig } from './app.js';
import {
  TransportMode,
  SessionManager,
  createStatelessTransport,
  getSessionIdFromRequest,
  isInitRequest,
  getProtocolVersion,
} from './transport.js';

/**
 * Server configuration
 */
export interface ServerConfig extends AppConfig {
  transportMode: TransportMode;
  sessionTimeout?: number;
}

/**
 * MCP HTTP Server
 */
export class McpHttpServer {
  private app;
  private config: ServerConfig;
  private sessionManager?: SessionManager;
  private server?: any;

  constructor(config: Partial<ServerConfig> = {}) {
    this.config = {
      port: 8123,
      transportMode: TransportMode.STATELESS,
      ...config,
    } as ServerConfig;
    
    this.app = createApp(this.config);
    
    // Initialize session manager for stateful mode
    if (this.config.transportMode === TransportMode.STATEFUL) {
      this.sessionManager = new SessionManager(this.config.sessionTimeout);
    }
    
    // Setup MCP endpoints
    this.setupEndpoints();
  }

  /**
   * Setup MCP endpoints
   */
  private setupEndpoints(): void {
    // POST /mcp - Handle JSON-RPC requests
    this.app.post('/mcp', async (req: Request, res: Response) => {
      try {
        const protocolVersion = getProtocolVersion(req);
        res.setHeader('MCP-Protocol-Version', protocolVersion);
        
        if (this.config.transportMode === TransportMode.STATELESS) {
          await this.handleStatelessRequest(req, res);
        } else {
          await this.handleStatefulRequest(req, res);
        }
      } catch (error) {
        console.error('Error handling MCP POST request:', error);
        
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal server error',
              data: error instanceof Error ? error.message : 'Unknown error',
            },
            id: null,
          });
        }
      }
    });

    // GET /mcp - SSE stream for server-initiated messages
    this.app.get('/mcp', async (req: Request, res: Response): Promise<void> => {
      try {
        const protocolVersion = getProtocolVersion(req);
        
        if (this.config.transportMode === TransportMode.STATELESS) {
          // Stateless mode doesn't support SSE
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
        
        // TODO: Implement SSE stream handling
        res.write('data: {"type":"connected"}\n\n');
        
        // Keep connection alive
        const interval = setInterval(() => {
          res.write(':ping\n\n');
        }, 30000);
        
        req.on('close', () => {
          clearInterval(interval);
          console.error(`SSE connection closed for session: ${sessionId}`);
        });
        
      } catch (error) {
        console.error('Error handling MCP GET request:', error);
        
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
        return;
      }
    });

    // DELETE /mcp - End session
    this.app.delete('/mcp', (req: Request, res: Response): void => {
      try {
        if (this.config.transportMode === TransportMode.STATELESS) {
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
        
        const deleted = this.sessionManager?.deleteSession(sessionId);
        
        if (deleted) {
          res.status(204).send();
        } else {
          res.status(404).json({
            error: 'Not found',
            message: 'Session not found',
          });
        }
      } catch (error) {
        console.error('Error handling MCP DELETE request:', error);
        
        res.status(500).json({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }

  /**
   * Handle stateless request
   */
  private async handleStatelessRequest(req: Request, res: Response): Promise<void> {
    const server = createServer();
    const transport = createStatelessTransport();
    
    // Clean up on response close
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
    
    // Non-init requests must have session ID
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
    
    // Set session ID header for new sessions
    if (isInit && isNew) {
      res.setHeader('Mcp-Session-Id', sessionId);
    }
    
    // Connect server if new session
    if (isNew) {
      const server = createServer();
      await server.connect(transport);
    }
    
    await transport.handleRequest(req, res, req.body);
  }

  /**
   * Start the server
   */
  async start(port?: number): Promise<void> {
    const listenPort = port || this.config.port || 8123;
    
    return new Promise((resolve) => {
      this.server = this.app.listen(listenPort, () => {
        console.error(`MCP server running at http://localhost:${listenPort}`);
        console.error(`Transport mode: ${this.config.transportMode}`);
        console.error(`Protocol version: 2025-03-26`);
        resolve();
      });
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    if (this.sessionManager) {
      this.sessionManager.closeAll();
    }
    
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.error('MCP server stopped');
          resolve();
        });
      });
    }
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.error('\nReceived SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\nReceived SIGTERM, shutting down gracefully...');
  process.exit(0);
});