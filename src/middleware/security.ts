import { Request, Response, NextFunction } from 'express';
import { Config, isOriginAllowed, TokenBucket } from '../config/index.js';

/**
 * Security middleware for MCP server
 */

/**
 * CORS middleware
 */
export function corsMiddleware(config: Config) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin as string | undefined;
    
    if (isOriginAllowed(origin, config.allowedOrigins)) {
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version');
      res.setHeader('Access-Control-Max-Age', '86400');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
      }
    } else {
      // Origin not allowed
      res.status(403).json({
        error: 'Forbidden',
        message: `Origin ${origin} not allowed`,
      });
      return;
    }
    
    next();
  };
}

/**
 * API key authentication middleware
 */
export function authMiddleware(config: Config) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip auth if not enabled
    if (!config.enableAuth || !config.apiKey) {
      next();
      return;
    }
    
    // Skip auth for health check
    if (req.path === '/healthz') {
      next();
      return;
    }
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization header required',
      });
      return;
    }
    
    // Check Bearer token
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match || match[1] !== config.apiKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key',
      });
      return;
    }
    
    next();
  };
}

/**
 * Rate limiting middleware
 */
export function rateLimitMiddleware(config: Config) {
  if (!config.rateLimit.enabled) {
    return (_req: Request, _res: Response, next: NextFunction): void => {
      next();
    };
  }
  
  const bucket = new TokenBucket(
    config.rateLimit.windowMs,
    config.rateLimit.maxRequests
  );
  
  // Clean up old buckets periodically
  setInterval(() => bucket.cleanup(), config.rateLimit.windowMs);
  
  return (req: Request, res: Response, next: NextFunction): void => {
    // Use IP address or session ID as key
    const key = req.ip || req.headers['mcp-session-id'] as string || 'unknown';
    
    if (!bucket.consume(key)) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
      });
      return;
    }
    
    next();
  };
}

/**
 * Security headers middleware
 */
export function securityHeadersMiddleware() {
  return (_req: Request, res: Response, next: NextFunction): void => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    // Remove server header
    res.removeHeader('X-Powered-By');
    
    next();
  };
}

/**
 * Request validation middleware
 */
export function validateRequestMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Validate Content-Type for POST requests
    if (req.method === 'POST' && req.path === '/mcp') {
      const contentType = req.headers['content-type'];
      
      // Skip validation if no content-type (will be handled by body parser)
      // or if it includes application/json (with or without charset)
      if (contentType && !contentType.includes('application/json')) {
        res.status(406).json({
          error: 'Not Acceptable',
          message: 'Content-Type must be application/json',
        });
        return;
      }
    }
    
    // Validate request size (prevent DoS)
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (contentLength > maxSize) {
      res.status(413).json({
        error: 'Payload Too Large',
        message: `Request size exceeds limit of ${maxSize} bytes`,
      });
      return;
    }
    
    next();
  };
}

/**
 * Logging middleware
 */
export function loggingMiddleware(config: Config) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.path;
    const ip = req.ip;
    
    if (config.logLevel === 'debug') {
      console.error(`[${timestamp}] ${method} ${path} from ${ip}`);
      console.error('Headers:', req.headers);
      if (req.body) {
        console.error('Body:', JSON.stringify(req.body, null, 2));
      }
    } else if (config.logLevel === 'info') {
      console.error(`[${timestamp}] ${method} ${path}`);
    }
    
    next();
  };
}