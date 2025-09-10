# Spec-Driven Development Workflow via MCP

This guide demonstrates how to use the MCP DinCoder tools to implement a complete spec-driven development workflow.

## Prerequisites

1. Start the MCP server:
```bash
npm run start:local
```

2. In another terminal, connect your MCP client (Claude Code, Copilot, or custom client).

## Complete Workflow Example

### Project: Building a Task Management API

Let's build a RESTful task management API using spec-driven development.

### Step 1: Initialize the Project

```typescript
// Using MCP tool: specify.start
await callTool('specify.start', {
  projectName: 'task-api',
  agent: 'claude',  // or 'copilot' or 'gemini'
  workspacePath: '/path/to/workspace'
});
```

**Expected Output:**
- Creates `task-api/` directory
- Generates `scripts/` and `templates/` directories
- Returns project path and initialization summary

### Step 2: Create the Specification

```typescript
// Using MCP tool: specify.describe
await callTool('specify.describe', {
  description: `
    RESTful API for task management with the following features:
    - CRUD operations for tasks (create, read, update, delete)
    - Task categories and tags
    - Due dates and priority levels
    - User assignment and collaboration
    - Search and filtering capabilities
    - Real-time updates via WebSocket
    
    Target users: Development teams needing task tracking
    Performance: Support 1000+ concurrent users
    Security: JWT authentication, role-based access
  `,
  workspacePath: '/path/to/workspace/task-api'
});
```

**Generated File:** `specs/spec-YYYY-MM-DD.md`

The specification will include:
- User journeys
- Acceptance scenarios
- Edge cases
- Questions needing clarification

### Step 3: Generate Technical Plan

```typescript
// Using MCP tool: plan.create
await callTool('plan.create', {
  constraintsText: `
    Technical constraints:
    - Language: TypeScript
    - Framework: Express.js
    - Database: PostgreSQL with Prisma ORM
    - Authentication: JWT with refresh tokens
    - Real-time: Socket.io
    - Testing: Jest + Supertest
    - Deployment: Docker + Kubernetes
    - CI/CD: GitHub Actions
    
    Non-functional requirements:
    - Response time < 200ms for API calls
    - 99.9% uptime SLA
    - Horizontal scalability
    - GDPR compliance
  `,
  specPath: 'specs/spec-YYYY-MM-DD.md',
  workspacePath: '/path/to/workspace/task-api'
});
```

**Generated Files:**
- `specs/plans/plan-YYYY-MM-DD.md` - Technical architecture
- `specs/plans/data-model-YYYY-MM-DD.ts` - Zod schemas
- `specs/plans/contracts-YYYY-MM-DD.ts` - Interface definitions

### Step 4: Generate Implementation Tasks

```typescript
// Using MCP tool: tasks.generate
await callTool('tasks.generate', {
  scope: 'Task Management API MVP - Phase 1',
  planPath: 'specs/plans/plan-YYYY-MM-DD.md',
  workspacePath: '/path/to/workspace/task-api'
});
```

**Generated Files:**
- `specs/tasks/tasks-YYYY-MM-DD.md` - Human-readable task list
- `specs/tasks/tasks-YYYY-MM-DD.json` - Machine-readable tasks

**Sample Tasks Generated:**
```json
[
  {
    "id": "TASK-001",
    "title": "Environment Setup",
    "description": "Set up development environment and install dependencies",
    "status": "pending",
    "dependencies": [],
    "storyPoints": 1
  },
  {
    "id": "TASK-002",
    "title": "Create Project Structure",
    "description": "Initialize project structure with required directories",
    "status": "pending",
    "dependencies": ["TASK-001"],
    "storyPoints": 1
  },
  {
    "id": "TASK-003",
    "title": "Database Schema Design",
    "description": "Design and implement Prisma schema for tasks",
    "status": "pending",
    "dependencies": ["TASK-002"],
    "storyPoints": 3
  }
]
```

### Step 5: Create Feature Branch

```typescript
// Using MCP tool: git.create_branch
await callTool('git.create_branch', {
  branchName: 'feature/task-api-mvp',
  fromBranch: 'main',
  workspacePath: '/path/to/workspace/task-api'
});
```

### Step 6: Track Implementation Progress

As you implement features, mark tasks as complete:

```typescript
// Using MCP tool: tasks.tick
await callTool('tasks.tick', {
  taskId: 'TASK-001',
  workspacePath: '/path/to/workspace/task-api'
});
```

### Step 7: Document Research & Decisions

Record important decisions and research findings:

```typescript
// Using MCP tool: research.append
await callTool('research.append', {
  topic: 'Database Selection',
  content: `
    Decision: PostgreSQL over MongoDB
    
    Rationale:
    - Strong ACID compliance needed for task assignments
    - Complex queries required for filtering and search
    - Relational data model fits task-user-project relationships
    - Better support for transactions in collaborative scenarios
    
    Trade-offs:
    - Less flexible schema (mitigated by JSONB columns for metadata)
    - Vertical scaling limitations (addressed by read replicas)
  `,
  workspacePath: '/path/to/workspace/task-api'
});
```

### Step 8: Quality Checks

Run quality checks throughout development:

```typescript
// Format code
await callTool('quality.format', {
  fix: true,
  workspacePath: '/path/to/workspace/task-api'
});

// Run linter
await callTool('quality.lint', {
  fix: true,
  workspacePath: '/path/to/workspace/task-api'
});

// Run tests
await callTool('quality.test', {
  coverage: true,
  workspacePath: '/path/to/workspace/task-api'
});

// Security audit
await callTool('quality.security_audit', {
  workspacePath: '/path/to/workspace/task-api'
});

// Check licenses
await callTool('quality.license_check', {
  allowedLicenses: ['MIT', 'Apache-2.0', 'BSD-3-Clause'],
  workspacePath: '/path/to/workspace/task-api'
});
```

### Step 9: View Progress

Check overall progress at any time:

```typescript
// Using MCP tool: artifacts.read
const artifacts = await callTool('artifacts.read', {
  artifactType: 'all',
  workspacePath: '/path/to/workspace/task-api'
});

// Parse response
const data = JSON.parse(artifacts.content[0].text);

// Access spec, plan, and tasks
console.log('Specification:', data.artifacts.spec);
console.log('Technical Plan:', data.artifacts.plan);
console.log('Tasks:', data.artifacts.tasks);

// Check task completion
const tasks = data.artifacts.tasks;
const completed = tasks.filter(t => t.status === 'completed').length;
const total = tasks.length;
console.log(`Progress: ${completed}/${total} tasks (${Math.round(completed/total * 100)}%)`);
```

## Advanced Patterns

### Pattern 1: Iterative Refinement

Specs can be refined as you learn more:

```typescript
// Add clarifications after user feedback
await callTool('research.append', {
  topic: 'Specification Clarifications',
  content: 'User feedback: Need bulk operations for tasks...',
  workspacePath: '/path/to/workspace/task-api'
});

// Generate additional tasks for new requirements
await callTool('tasks.generate', {
  scope: 'Bulk Operations Feature',
  workspacePath: '/path/to/workspace/task-api'
});
```

### Pattern 2: Multi-Phase Development

Break large projects into phases:

```typescript
// Phase 1: Core CRUD
await callTool('tasks.generate', {
  scope: 'Phase 1: Core CRUD Operations',
  workspacePath: '/path/to/workspace/task-api'
});

// Phase 2: Real-time features
await callTool('tasks.generate', {
  scope: 'Phase 2: WebSocket Real-time Updates',
  workspacePath: '/path/to/workspace/task-api'
});

// Phase 3: Advanced features
await callTool('tasks.generate', {
  scope: 'Phase 3: Analytics and Reporting',
  workspacePath: '/path/to/workspace/task-api'
});
```

### Pattern 3: Automated Quality Gates

Set up quality gates before marking tasks complete:

```typescript
async function completeTaskWithQuality(taskId: string, workspace: string) {
  // Run all quality checks
  const formatResult = await callTool('quality.format', { workspacePath: workspace });
  const lintResult = await callTool('quality.lint', { workspacePath: workspace });
  const testResult = await callTool('quality.test', { workspacePath: workspace });
  
  // Parse results
  const format = JSON.parse(formatResult.content[0].text);
  const lint = JSON.parse(lintResult.content[0].text);
  const test = JSON.parse(testResult.content[0].text);
  
  // Only mark complete if all checks pass
  if (format.success && lint.success && test.success) {
    await callTool('tasks.tick', {
      taskId: taskId,
      workspacePath: workspace
    });
    console.log(`✅ Task ${taskId} completed with all quality checks passed`);
  } else {
    console.log(`❌ Task ${taskId} has quality issues - fix before marking complete`);
  }
}
```

## Tips for Effective Spec-Driven Development

1. **Start Small**: Begin with a minimal spec and iterate
2. **Be Specific**: Include concrete acceptance criteria
3. **Track Unknowns**: Use "Needs Clarification" sections liberally
4. **Document Decisions**: Use research.append for important choices
5. **Maintain Quality**: Run quality tools frequently, not just at the end
6. **Review Regularly**: Periodically review specs against implementation
7. **Collaborate**: Share artifacts.read output with stakeholders

## Integration with AI Assistants

### With Claude Code

```markdown
/specify describe "Build a task management API with real-time updates"
/plan create --constraints "TypeScript, Express, PostgreSQL"
/tasks generate --scope "MVP Phase 1"
/tasks tick TASK-001
```

### With GitHub Copilot

Use Copilot Chat with MCP tools:
```
@mcp specify.describe "Task management API"
@mcp plan.create 
@mcp tasks.generate
```

### With Custom Clients

See `examples/local-client.ts` and `examples/smithery-client.ts` for programmatic usage.

## Troubleshooting

### Common Issues

1. **Path Sandboxing Errors**
   - Ensure workspacePath is within allowed directories
   - Avoid system directories (/etc, /usr, /bin)

2. **Tool Timeout**
   - Large projects may need increased timeouts
   - Break into smaller scopes for task generation

3. **Git Branch Issues**
   - Commit or stash changes before creating branches
   - Ensure you're in a git repository

4. **Missing Dependencies**
   - Run `npm install` in your project directory
   - Ensure `specify` CLI is installed for specify.start tool

## Conclusion

The spec-driven development workflow ensures:
- Clear requirements before coding
- Structured technical planning
- Trackable implementation progress
- Maintained code quality
- Documentation of decisions

This systematic approach reduces rework, improves communication, and produces more maintainable software.