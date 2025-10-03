import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Server configuration schema
 */
export const ConfigSchema = z.object({
  // Server settings
  port: z.number().min(1).max(65535).default(3000),
  host: z.string().default('localhost'),
  mode: z.enum(['stateless', 'stateful']).default('stateless'),
  
  // Security settings
  allowedOrigins: z.array(z.string()).default(['*']),
  apiKey: z.string().optional(),
  enableAuth: z.boolean().default(false),
  
  // Rate limiting
  rateLimit: z.object({
    enabled: z.boolean().default(false),
    windowMs: z.number().default(60000), // 1 minute
    maxRequests: z.number().default(100),
  }).default({}),
  
  // Paths
  workspacePath: z.string().default(process.cwd()),
  
  // Session management
  sessionTimeout: z.number().default(3600000), // 1 hour
  
  // Logging
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Smithery-specific
  smitheryConfig: z.object({
    maxRetries: z.number().default(3),
    timeout: z.number().default(30000),
    allowedAgents: z.array(z.string()).default(['claude', 'copilot', 'gemini']),
  }).optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Parse configuration from environment variables
 */
export function loadConfigFromEnv(): Partial<Config> {
  const config: Partial<Config> = {};

  if (process.env.PORT) {
    config.port = parseInt(process.env.PORT, 10);
  }
  if (process.env.HOST) {
    config.host = process.env.HOST;
  }
  if (process.env.MODE) {
    config.mode = process.env.MODE as 'stateless' | 'stateful';
  }
  if (process.env.ALLOWED_ORIGINS) {
    config.allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim());
  }
  if (process.env.API_KEY) {
    config.apiKey = process.env.API_KEY;
  }
  if (process.env.ENABLE_AUTH) {
    config.enableAuth = process.env.ENABLE_AUTH === 'true';
  }
  if (process.env.WORKSPACE_PATH) {
    config.workspacePath = process.env.WORKSPACE_PATH;
  }
  if (process.env.SESSION_TIMEOUT) {
    config.sessionTimeout = parseInt(process.env.SESSION_TIMEOUT, 10);
  }
  if (process.env.LOG_LEVEL) {
    config.logLevel = process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error';
  }

  if (process.env.RATE_LIMIT_ENABLED) {
    config.rateLimit = {
      enabled: process.env.RATE_LIMIT_ENABLED === 'true',
      windowMs: process.env.RATE_LIMIT_WINDOW ? parseInt(process.env.RATE_LIMIT_WINDOW, 10) : 60000,
      maxRequests: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 100,
    };
  }

  return config;
}

/**
 * Parse configuration from base64-encoded query parameter (Smithery)
 */
export function parseSmitheryConfig(configBase64: string): Partial<Config> {
  try {
    const configJson = Buffer.from(configBase64, 'base64').toString('utf-8');
    const rawConfig = JSON.parse(configJson);
    
    // Map Smithery config to our schema
    return {
      smitheryConfig: rawConfig,
      // Override specific settings from Smithery config
      ...(rawConfig.maxRetries && { maxRetries: rawConfig.maxRetries }),
      ...(rawConfig.timeout && { timeout: rawConfig.timeout }),
      ...(rawConfig.workspacePath && { workspacePath: rawConfig.workspacePath }),
      ...(rawConfig.allowedOrigins && { allowedOrigins: rawConfig.allowedOrigins }),
    };
  } catch (error) {
    console.error('Failed to parse Smithery config:', error);
    return {};
  }
}

/**
 * Get configuration with priority:
 * 1. Runtime config (passed directly)
 * 2. Smithery config (from query param)
 * 3. Environment variables
 * 4. Defaults
 */
export function getConfig(
  runtimeConfig?: Partial<Config>,
  smitheryConfigBase64?: string
): Config {
  const envConfig = loadConfigFromEnv();
  const smitheryConfig = smitheryConfigBase64 ? parseSmitheryConfig(smitheryConfigBase64) : {};
  
  // Merge configs with priority
  const mergedConfig = {
    ...envConfig,
    ...smitheryConfig,
    ...runtimeConfig,
  };
  
  // Validate and apply defaults
  return ConfigSchema.parse(mergedConfig);
}

/**
 * Validate origin against allowed origins
 */
export function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) {return true;} // No origin header is allowed (same-origin)
  if (allowedOrigins.includes('*')) {return true;} // Wildcard allows all
  
  // Check exact match or pattern match
  return allowedOrigins.some(allowed => {
    if (allowed === origin) {return true;}
    
    // Support wildcard patterns like http://localhost:*
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(origin);
    }
    
    return false;
  });
}

/**
 * Token bucket for rate limiting
 */
export class TokenBucket {
  private tokens: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private windowMs: number,
    private maxRequests: number
  ) {}
  
  consume(key: string): boolean {
    const now = Date.now();
    const bucket = this.tokens.get(key);
    
    if (!bucket || bucket.resetTime <= now) {
      // New window
      this.tokens.set(key, {
        count: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }
    
    if (bucket.count > 0) {
      // Consume a token
      bucket.count--;
      return true;
    }
    
    // No tokens available
    return false;
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, bucket] of this.tokens.entries()) {
      if (bucket.resetTime <= now) {
        this.tokens.delete(key);
      }
    }
  }
}