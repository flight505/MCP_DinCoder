# Project Constitution: API Service

## Project Principles

### 1. API-First Design
- Design APIs before implementation
- Use OpenAPI/Swagger for documentation
- Version APIs explicitly (v1, v2)
- Maintain backward compatibility

### 2. RESTful Best Practices
- Use HTTP verbs correctly (GET, POST, PUT, DELETE, PATCH)
- Return appropriate status codes
- Implement proper error responses
- Use consistent URL naming conventions

### 3. Performance & Scalability
- Design for horizontal scaling
- Implement caching strategies
- Optimize database queries (N+1 prevention)
- Monitor response times (p95 < 200ms)

### 4. Security First
- Implement authentication and authorization
- Validate and sanitize all inputs
- Use rate limiting and throttling
- Follow OWASP API Security Top 10

### 5. Observability
- Log all requests and errors
- Implement health checks and metrics
- Use distributed tracing
- Monitor resource usage

## Technical Constraints

### Platform Requirements
- **Node.js**: >= 20.0.0 LTS or **Python**: >= 3.11
- **Database**: PostgreSQL 15+ or MongoDB 6+
- **Cache**: Redis 7+
- **Message Queue**: RabbitMQ or AWS SQS (if needed)

### Performance Targets
- **Response Time**: p95 < 200ms, p99 < 500ms
- **Throughput**: 1000 req/s minimum
- **Availability**: 99.9% uptime SLA
- **Database Queries**: < 50ms average

### API Standards
- **Format**: JSON (primary), optional GraphQL
- **Versioning**: URL-based (/api/v1/)
- **Pagination**: Cursor-based for large datasets
- **Rate Limiting**: 100 req/min per IP, 1000 req/min per user

## Library Preferences

### Node.js Stack
- **Framework**: Express.js 4+ or Fastify 4+
- **TypeScript**: 5.0+ with strict mode
- **ORM**: Prisma 5+ or TypeORM
- **Validation**: Zod or Joi
- **Authentication**: Passport.js or jose (JWT)

### Python Stack
- **Framework**: FastAPI 0.100+ or Django REST Framework
- **ORM**: SQLAlchemy 2+ or Django ORM
- **Validation**: Pydantic v2
- **Authentication**: python-jose (JWT)
- **Testing**: pytest with pytest-asyncio

### Database & Caching
- **SQL**: PostgreSQL with connection pooling
- **NoSQL**: MongoDB with replica sets
- **Cache**: Redis with pub/sub support
- **Search**: Elasticsearch (if full-text search needed)

### Monitoring & Logging
- **Logging**: Winston (Node) or structlog (Python)
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry or Jaeger
- **Error Tracking**: Sentry

## Code Style Preferences

### Architecture
- **Pattern**: Clean Architecture or Hexagonal Architecture
- **Structure**: Feature-based modules
- **Separation**: Controllers → Services → Repositories
- **Dependency Injection**: Use DI containers

### Error Handling
- Use custom error classes
- Return consistent error responses
- Log errors with context
- Provide actionable error messages

### Database Access
- Use repositories/DAOs for data access
- Implement query builders or ORMs
- Use transactions for multi-step operations
- Implement connection pooling

## Testing Strategy

- **Unit Tests**: 80%+ coverage, test business logic
- **Integration Tests**: Test API endpoints with real DB (test containers)
- **Contract Tests**: Validate API contracts with Pact or similar
- **Load Tests**: k6 or Apache JMeter for performance testing

---

*Reference this constitution when creating API specifications and plans.*
