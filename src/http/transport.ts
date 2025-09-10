import { Request } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { randomUUID } from 'node:crypto';

/**
 * Transport mode configuration
 */
export enum TransportMode {
  STATELESS = 'stateless',
  STATEFUL = 'stateful',
}

/**
 * Transport configuration
 */
export interface TransportConfig {
  mode: TransportMode;
  sessionTimeout?: number; // milliseconds
}

/**
 * Session manager for stateful mode
 */
export class SessionManager {
  private sessions: Map<string, {
    transport: StreamableHTTPServerTransport;
    server?: any; // MCP Server instance
    lastAccess: number;
  }> = new Map();
  
  private sessionTimeout: number;

  constructor(sessionTimeout: number = 30 * 60 * 1000) { // 30 minutes default
    this.sessionTimeout = sessionTimeout;
    
    // Clean up expired sessions periodically
    setInterval(() => this.cleanupSessions(), 60 * 1000); // every minute
  }

  /**
   * Get or create a session
   */
  getSession(sessionId?: string): { 
    transport: StreamableHTTPServerTransport;
    server?: any; 
    sessionId: string;
    isNew: boolean;
  } {
    const now = Date.now();
    
    if (sessionId && this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      session.lastAccess = now;
      return { 
        transport: session.transport,
        server: session.server, 
        sessionId,
        isNew: false,
      };
    }

    // Create new session with a generated ID
    const newSessionId = randomUUID();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => newSessionId,
      enableJsonResponse: true, // Enable JSON responses
    });

    // Apply same Content-Type fix and notification handling as stateless transport
    const originalHandleRequest = transport.handleRequest.bind(transport);
    transport.handleRequest = async function(req: any, res: any, parsedBody?: unknown) {
      // Check if this is a notification (no id field)
      const isNotification = parsedBody && typeof parsedBody === 'object' && 
                            'jsonrpc' in parsedBody && !('id' in parsedBody);
      
      const originalWriteHead = res.writeHead;
      res.writeHead = function(statusCode: number, headers?: any) {
        // For notifications, change 202 to 204 per MCP spec
        if (isNotification && statusCode === 202) {
          return originalWriteHead.call(this, 204, headers);
        }
        
        if (statusCode >= 400 && statusCode < 600) {
          if (!headers || !headers['Content-Type']) {
            return originalWriteHead.call(this, statusCode, {
              ...headers,
              'Content-Type': 'application/json'
            });
          }
        }
        return originalWriteHead.call(this, statusCode, headers);
      };
      return originalHandleRequest(req, res, parsedBody);
    };
    
    this.sessions.set(newSessionId, {
      transport,
      lastAccess: now,
    });
    
    return { 
      transport, 
      sessionId: newSessionId,
      isNew: true,
    };
  }

  /**
   * Set server for a session
   */
  setSessionServer(sessionId: string, server: any): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.server = server;
    }
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.transport.close();
      this.sessions.delete(sessionId);
      return true;
    }
    return false;
  }

  /**
   * Clean up expired sessions
   */
  private cleanupSessions(): void {
    const now = Date.now();
    const expired: string[] = [];
    
    for (const [id, session] of this.sessions) {
      if (now - session.lastAccess > this.sessionTimeout) {
        expired.push(id);
      }
    }
    
    for (const id of expired) {
      console.error(`Cleaning up expired session: ${id}`);
      this.deleteSession(id);
    }
  }

  /**
   * Close all sessions
   */
  closeAll(): void {
    for (const [id] of this.sessions) {
      this.deleteSession(id);
    }
  }
}

/**
 * Creates a stateless transport (new instance per request)
 * Wraps the transport to ensure proper Content-Type headers
 */
export function createStatelessTransport(): StreamableHTTPServerTransport {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // No session management
    enableJsonResponse: true, // Enable JSON responses for simple request/response
  });

  // Monkey-patch handleRequest to ensure Content-Type is set and handle notifications properly
  const originalHandleRequest = transport.handleRequest.bind(transport);
  transport.handleRequest = async function(req: any, res: any, parsedBody?: unknown) {
    // Check if this is a notification (no id field)
    const isNotification = parsedBody && typeof parsedBody === 'object' && 
                          'jsonrpc' in parsedBody && !('id' in parsedBody);
    
    // Intercept writeHead to ensure Content-Type is set for JSON responses
    const originalWriteHead = res.writeHead;
    res.writeHead = function(statusCode: number, headers?: any) {
      // For notifications, change 202 to 204 per MCP spec
      if (isNotification && statusCode === 202) {
        return originalWriteHead.call(this, 204, headers);
      }
      
      // If sending an error status and no Content-Type set, add it
      if (statusCode >= 400 && statusCode < 600) {
        if (!headers || !headers['Content-Type']) {
          return originalWriteHead.call(this, statusCode, {
            ...headers,
            'Content-Type': 'application/json'
          });
        }
      }
      return originalWriteHead.call(this, statusCode, headers);
    };

    return originalHandleRequest(req, res, parsedBody);
  };

  return transport;
}

/**
 * Validates session ID format
 * Must contain only visible ASCII characters (0x21 to 0x7E)
 */
export function isValidSessionId(sessionId: string): boolean {
  if (!sessionId || sessionId.length === 0) {
    return false;
  }
  
  for (let i = 0; i < sessionId.length; i++) {
    const code = sessionId.charCodeAt(i);
    if (code < 0x21 || code > 0x7E) {
      return false;
    }
  }
  
  return true;
}

/**
 * Extracts session ID from request headers
 */
export function getSessionIdFromRequest(req: Request): string | undefined {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  
  if (sessionId && !isValidSessionId(sessionId)) {
    throw new Error('Invalid session ID format');
  }
  
  return sessionId;
}

/**
 * Checks if request is an initialization request
 */
export function isInitRequest(body: unknown): boolean {
  // Simple check - just look for method === 'initialize'
  // The SDK's isInitializeRequest is too strict and requires clientInfo
  if (body && typeof body === 'object' && 'method' in body) {
    return (body as any).method === 'initialize';
  }
  return false;
}

/**
 * Gets protocol version from request
 */
export function getProtocolVersion(req: Request): string {
  return (req.headers['mcp-protocol-version'] as string) || '2025-03-26';
}