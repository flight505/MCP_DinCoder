import { Request } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
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
    sessionId: string;
    isNew: boolean;
  } {
    const now = Date.now();
    
    if (sessionId && this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      session.lastAccess = now;
      return { 
        transport: session.transport, 
        sessionId,
        isNew: false,
      };
    }

    // Create new session
    const newSessionId = randomUUID();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => newSessionId,
    });
    
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
 */
export function createStatelessTransport(): StreamableHTTPServerTransport {
  return new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // No session management
  });
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
  try {
    return isInitializeRequest(body);
  } catch {
    return false;
  }
}

/**
 * Gets protocol version from request
 */
export function getProtocolVersion(req: Request): string {
  return (req.headers['mcp-protocol-version'] as string) || '2025-03-26';
}