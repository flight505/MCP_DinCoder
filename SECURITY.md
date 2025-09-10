# Security Policy

## Overview

MCP DinCoder implements multiple layers of security to ensure safe operation in various deployment scenarios. This document outlines the security features, threat model, and best practices.

## Threat Model

### Identified Threats

1. **Unauthorized Access**
   - Risk: Malicious actors accessing MCP tools
   - Mitigation: API key authentication, origin validation

2. **Command Injection**
   - Risk: Arbitrary command execution through tool inputs
   - Mitigation: Input validation with Zod schemas, command timeouts, path sandboxing

3. **Path Traversal**
   - Risk: Access to files outside workspace
   - Mitigation: Path normalization, restricted directory list, workspace validation

4. **Denial of Service (DoS)**
   - Risk: Resource exhaustion through excessive requests
   - Mitigation: Rate limiting, request size limits, timeouts

5. **DNS Rebinding**
   - Risk: Cross-origin attacks via DNS manipulation
   - Mitigation: Origin validation, CORS controls

6. **Information Disclosure**
   - Risk: Leaking sensitive data in logs or responses
   - Mitigation: Structured logging, error sanitization, no secrets in logs

## Security Features

### Authentication

**API Key Authentication** (Optional)
```bash
# Enable via environment variable
export ENABLE_AUTH=true
export API_KEY=your-secret-key-here

# Use in requests
curl -H "Authorization: Bearer your-secret-key-here" \
     http://localhost:3000/mcp
```

**Session Management**
- UUID-based session IDs (cryptographically secure)
- Configurable session timeout
- Automatic session cleanup

### Authorization

**Origin Validation**
```bash
# Configure allowed origins
export ALLOWED_ORIGINS="http://localhost:*,https://*.smithery.ai"
```

- Wildcard support for development
- Exact match for production
- Pattern matching for flexible deployment

### Input Validation

**Zod Schema Validation**
- All tool inputs validated against strict schemas
- Type checking and constraint validation
- Clear error messages for invalid inputs

**Path Sandboxing**
```typescript
// Restricted system directories
const restrictedPaths = ['/etc', '/usr', '/bin', '/sbin', '/var', '/tmp'];

// All file operations restricted to workspace
validateWorkspacePath(workspacePath);
```

### Rate Limiting

**Token Bucket Algorithm**
```bash
# Configure rate limiting
export RATE_LIMIT_ENABLED=true
export RATE_LIMIT_WINDOW=60000    # 1 minute
export RATE_LIMIT_MAX=100          # 100 requests per window
```

- Per-IP or per-session limiting
- Configurable window and threshold
- Automatic bucket cleanup

### Security Headers

The server sets the following security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | XSS protection (legacy) |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer info |
| Content-Security-Policy | default-src 'self' | Restrict resource loading |

### Command Execution Safety

**Timeout Protection**
```typescript
const { stdout, stderr } = await execAsync(command, {
  cwd: resolvedPath,
  timeout: 30000, // 30 seconds max
});
```

**Environment Isolation**
```typescript
// Clean environment for command execution
env: { ...process.env, CI: 'true' }
```

## Configuration

### Environment Variables

```bash
# Security Configuration
ENABLE_AUTH=true                   # Enable API key auth
API_KEY=your-secret-key            # API key for authentication
ALLOWED_ORIGINS=https://app.com    # Allowed CORS origins

# Rate Limiting
RATE_LIMIT_ENABLED=true            # Enable rate limiting
RATE_LIMIT_WINDOW=60000            # Window in milliseconds
RATE_LIMIT_MAX=100                 # Max requests per window

# Logging
LOG_LEVEL=info                     # debug|info|warn|error
```

### Smithery Deployment

For Smithery deployments, configuration is passed via base64-encoded query parameter:

```javascript
const config = {
  allowedOrigins: ['https://*.smithery.ai'],
  enableAuth: true,
  apiKey: process.env.SMITHERY_API_KEY,
  workspacePath: '/app/workspace',
};

const configBase64 = Buffer.from(JSON.stringify(config)).toString('base64');
const url = `https://server.smithery.ai/mcp-dincoder/mcp?config=${configBase64}`;
```

## Best Practices

### Deployment

1. **Always use HTTPS in production**
   - Encrypts API keys and sensitive data in transit
   - Prevents man-in-the-middle attacks

2. **Restrict origins in production**
   ```bash
   export ALLOWED_ORIGINS="https://yourdomain.com"
   ```

3. **Enable authentication for public deployments**
   ```bash
   export ENABLE_AUTH=true
   export API_KEY=$(openssl rand -hex 32)
   ```

4. **Use rate limiting**
   ```bash
   export RATE_LIMIT_ENABLED=true
   ```

5. **Run with minimal privileges**
   - Use non-root user in Docker
   - Restrict file system permissions
   - Use read-only file systems where possible

### Development

1. **Use different API keys for dev/staging/prod**
2. **Never commit secrets to version control**
3. **Regularly update dependencies**
   ```bash
   npm audit fix
   npm outdated
   ```

4. **Review security advisories**
   ```bash
   npm audit
   ```

## Incident Response

### Suspected Compromise

1. **Immediately rotate API keys**
2. **Review access logs**
3. **Check for unauthorized file modifications**
4. **Update and patch all dependencies**

### Reporting Vulnerabilities

Please report security vulnerabilities to:
- Email: security@example.com
- PGP Key: [public key]

**Do not** create public GitHub issues for security vulnerabilities.

## Security Checklist

Before deployment, ensure:

- [ ] HTTPS is configured
- [ ] API key authentication is enabled
- [ ] Origins are properly restricted
- [ ] Rate limiting is configured
- [ ] Latest security patches applied
- [ ] Logs do not contain secrets
- [ ] File permissions are restrictive
- [ ] Docker image uses non-root user
- [ ] Environment variables are secured
- [ ] Regular backups are configured

## Compliance

### GDPR Considerations

- No personal data is stored by default
- Session IDs are temporary and anonymous
- Logs can be configured to exclude sensitive data
- All data processing is transparent

### Security Standards

The implementation follows:
- OWASP Top 10 mitigation strategies
- Principle of least privilege
- Defense in depth
- Secure by default configuration

## Updates

This security policy is reviewed and updated regularly. Check the repository for the latest version.

**Last Updated**: 2025-09-10
**Version**: 1.0.0