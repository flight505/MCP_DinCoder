import express, { Express, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * App configuration schema
 */
export const AppConfigSchema = z.object({
  port: z.number().default(8123),
  cors: z.object({
    enabled: z.boolean().default(true),
    origins: z.array(z.string()).default(['*']),
  }).default({}),
  security: z.object({
    originWhitelist: z.array(z.string()).optional(),
    apiKey: z.string().optional(),
  }).default({}),
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  }).default({}),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

/**
 * Creates and configures an Express application
 */
export function createApp(config: Partial<AppConfig> = {}): Express {
  const validatedConfig = AppConfigSchema.parse(config);
  const app = express();

  // Basic middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS middleware
  if (validatedConfig.cors.enabled) {
    app.use((req: Request, res: Response, next: NextFunction): void => {
      const origin = req.headers.origin || '*';
      
      if (validatedConfig.cors.origins.includes('*') || 
          validatedConfig.cors.origins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 
          'Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version');
      }
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
      }
      
      next();
    });
  }

  // Origin validation middleware
  if (validatedConfig.security.originWhitelist) {
    app.use((req: Request, res: Response, next: NextFunction): void => {
      const origin = req.headers.origin;
      
      if (origin && !validatedConfig.security.originWhitelist?.includes(origin)) {
        console.error(`Rejected request from unauthorized origin: ${origin}`);
        res.status(403).json({
          error: 'Forbidden',
          message: 'Origin not allowed',
        });
        return;
      }
      
      next();
    });
  }

  // API key authentication middleware (optional)
  if (validatedConfig.security.apiKey) {
    app.use((req: Request, res: Response, next: NextFunction): void => {
      if (req.path === '/healthz') {
        next();
        return;
      }
      
      const authHeader = req.headers.authorization;
      const providedKey = authHeader?.replace('Bearer ', '');
      
      if (providedKey !== validatedConfig.security.apiKey) {
        console.error('Invalid or missing API key');
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or missing API key',
        });
        return;
      }
      
      next();
    });
  }

  // Request logging middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const level = validatedConfig.logging.level;
    if (level === 'debug' || level === 'info') {
      console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health check endpoint
  app.get('/healthz', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      version: process.env.npm_package_version || '0.0.1',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}