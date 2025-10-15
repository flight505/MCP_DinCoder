# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Spec-Driven MCP Orchestrator** that implements a Model Context Protocol server with Streamable HTTP transport. The server exposes Spec Kit tools (specify, plan, tasks) to enable AI-assisted spec-driven development workflows.

## Critical Requirements

- **Protocol**: MCP Streamable HTTP (Protocol Revision 2025-03-26)
- **TypeScript SDK**: @modelcontextprotocol/sdk v1.17.5+ 
- **Node.js**: >=20
- **Transport**: HTTP only (STDIO deprecated Sept 7, 2025 on Smithery)
  - Migration benefits: 20x higher concurrency, lower latency, better resource efficiency
- **TypeScript Config**: MUST use module/moduleResolution: "NodeNext"

## Development Commands

Once bootstrapped (see plan.md Story 2):

```bash
# Development
npm run dev          # Start development server with hot-reload
npm run build        # Build TypeScript to dist/
npm run start:local  # Start production server locally

# Quality
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Deployment
npm pack             # Create tarball for inspection
npm publish          # Publish to NPM (after version bump)
```

## Architecture

### Core Components

1. **HTTP Transport Layer** (`src/http/`)
   - `app.ts`: Express application setup
   - `transport.ts`: StreamableHTTPServerTransport wrapper
   - Handles `/mcp` endpoint with POST/GET/DELETE methods
   - Session management via Mcp-Session-Id headers

2. **MCP Server** (`src/server/`)
   - `createServer.ts`: Factory for McpServer instances
   - Registers tools, resources, and prompts
   - **CRITICAL**: For stateless deployments, create new server/transport per request

3. **Spec Kit Tools** (`src/tools/`)
   - Core workflow: `specify.ts`, `plan.ts`, `tasks.ts`
   - Phase 1 additions: `constitution.ts`, `clarify.ts`, `validate.ts`, `refine.ts`, `prereqs.ts`
   - Phase 2 additions: `visualize.ts`, `filter.ts`, `batch.ts`, `search.ts`, `stats.ts`
   - Quality tools: `quality.ts` (lint, test, format, security, deps, license)
   - Supporting tools: `artifacts.ts`, `research.ts`, `git.ts`, `workspace.ts`

4. **Spec Kit Modules** (`src/speckit/`)
   - `detector.ts`: Document type detection (spec, plan, tasks)
   - `parser.ts`: Markdown parsing and section manipulation
   - `templates.ts`: Official Spec Kit markdown templates
   - `validators.ts`: Quality checking (completeness, acceptance, clarifications, implementation)
   - `taskParser.ts`: Task parsing and dependency graph analysis (Phase 2)

5. **Configuration** (`src/config/`)
   - `schema.ts`: Zod schemas for validation
   - Handles Smithery ?config=<base64> parameter

6. **Security** (`src/security/`)
   - `origin.ts`: Origin validation middleware
   - `auth.ts`: Bearer token/API key authentication

## Session Management Patterns

### Stateless Mode (Serverless/Lambda)
```typescript
// Create new instances per request
app.post('/mcp', async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ 
    sessionIdGenerator: undefined 
  });
  // Handle request...
});
```

### Stateful Mode (Persistent Server)
```typescript
// Maintain session map
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
// Use crypto.randomUUID() for session IDs
```

## Error Handling

- Use `McpError` class with `ErrorCode` enum for protocol errors
- All diagnostic output to `stderr` only (never stdout)
- Wrap handlers in try-catch blocks
- Return valid JSON-RPC error responses

## Testing Strategy

- Unit tests for each tool handler
- Integration tests for HTTP endpoints
- SSE stream tests for event framing
- Session management tests
- Coverage requirement: 90% statements

## Deployment

### Smithery (Recommended: ts-smithery-cli approach)

#### Configuration Files
1. **smithery.yaml** (not json):
```yaml
runtime: "typescript"
```

2. **package.json** updates:
```json
{
  "scripts": {
    "build": "npx @smithery/cli build",
    "dev": "npx @smithery/cli dev"
  }
}
```

3. **Server Structure** (`src/index.ts`):
```typescript
export default function createServer({ config }) {
  const server = new McpServer({ /* ... */ });
  return server.server;
}

export const configSchema = z.object({
  // Optional configuration schema
});
```

#### Deployment Process
- Push code to GitHub
- Connect GitHub to Smithery
- Navigate to Deployments tab
- Click Deploy

#### Migration Tools
- Use @smithery-ai/migration-guide-mcp for guided migration
- Tools available: validate_smithery_yaml, validate_package_json, create_migration_template

### NPM
- Ensure proper package.json exports
- Build with tsup for ESM output
- Include type definitions

## Project Plan

Refer to [plan.md](plan.md) for the complete roadmap:
- **Total Stories:** 28 across 4 phases
- **Current Status:** 27/28 complete (96%) - Phase 1 & 2 COMPLETE! 🎉🚀
- **Current Version:** v0.3.0 (Phase 2 release)
- Each story contains granular 1-point tasks that can be completed independently

## Version History & Lessons Learned

### v0.3.0 - Phase 2 Complete! 🎉🚀 (2025-10-16)

**Milestone:** Advanced task management for large-scale projects (50+ tasks)!

**Features Added:**
- **Task Visualization** (`tasks_visualize`): Mermaid, Graphviz, ASCII dependency graphs
- **Task Filtering** (`tasks_filter`): Smart presets (next, frontend, backend, ready, cleanup)
- **Batch Operations** (`tasks_tick_range`): Range expansion, 10x efficiency for bulk completion
- **Task Search** (`tasks_search`): Fuzzy matching with Levenshtein distance algorithm
- **Task Statistics** (`tasks_stats`): Progress charts, blocker analysis, phase/type/priority breakdown

**Testing:**
- 52 tests passing (22 skipped edge cases)
- 100% pass rate for enabled tests
- Full MCP protocol conformance validated

**Impact:**
- 26 total MCP tools (21 Phase 1 + 5 Phase 2)
- Advanced task management capabilities
- Scalable for projects with 50+ tasks
- Visual dependency analysis
- Real-time progress tracking

### v0.2.0 - Phase 1 Complete! 🎉 (2025-10-16)

**Milestone:** 100% GitHub Spec Kit command parity for AI coding workflows!

**Features Added:**
- **Constitution Tool** (`constitution_create`): Project principles, constraints, and preferences
- **Clarification Tracking** (`clarify_add`, `clarify_resolve`, `clarify_list`): Flag and resolve spec ambiguities
- **Spec Validation** (`spec_validate`, `artifacts_analyze`): 4 validation rules for quality gates
- **Spec Refinement** (`spec_refine`): Section-based iterative improvement
- **Prerequisites Check** (`prereqs_check`): Environment validation (Node, npm, git, custom commands)

**Testing:**
- 52 tests passing (22 skipped edge cases)
- 100% pass rate for enabled tests
- Full MCP protocol conformance validated

**Impact:**
- All critical Spec Kit gaps identified in FEATURE_ANALYSIS.md are now addressed
- Living documents that improve iteratively through AI workflows
- Quality gates prevent incomplete specs from reaching implementation
- Full parity with GitHub Spec Kit's CLI commands, optimized for MCP agents

### v0.1.7 - Real Spec Kit Integration

**Critical Features:**
- Transformed from mock to authentic Spec-Driven Development
- Created detector.ts, parser.ts, templates.ts for real markdown generation
- CI/CD fix: Resolved smoke test failure by setting PORT=3000
- Smithery deployment ready with base64 config support

**Achievements:**
- Published to NPM as mcp-dincoder
- Complete CI/CD pipeline with GitHub Actions
- Cached official Spec Kit templates locally
- Backward compatibility (JSON + Markdown)
- Full integration with Claude Desktop confirmed

## Known Pitfalls to Avoid

1. **Tool Naming Validation** ⚠️ CRITICAL: Tool names must match pattern `^[a-zA-Z0-9_-]{1,64}$` - no periods allowed
2. **External Dependencies**: MCP tools should be self-contained, not rely on external CLI tools
3. **Request ID Collisions**: Always create new transport instances in stateless mode
4. **Session ID Format**: Must be visible ASCII (0x21-0x7E) only
5. **Timeout Issues**: Send progress updates for long-running operations (>60s)
6. **Browser Compatibility**: Test session management in both Node.js and browser
7. **STDIO Logging**: Never log to stdout when STDIO transport is active
8. **Migration Deadline**: STDIO transport will be discontinued on Smithery by September 7, 2025
9. **Transport Choice**: Always use Streamable HTTP for remote deployments (not STDIO)
10. **Directory Structure**: Use consistent .dincoder/ directory for all generated artifacts

## Session Recovery & Progress Tracking

### Git-First Workflow (No TODO.md)

**Philosophy:** Use frequent, atomic Git commits as the primary progress tracking mechanism. This eliminates redundancy and ensures session recovery is always reliable.

### Why No TODO.md?

- ✅ **plan.md** contains complete roadmap with all story tasks
- ✅ **Git commits** track actual progress (more reliable than manual TODO updates)
- ✅ **CHANGELOG.md** summarizes what shipped in each release
- ✅ **Pre-commit hooks** ensure quality before each commit
- ❌ **TODO.md was redundant** - everything in it was already in plan.md

### Commit Frequency Guidelines

**CRITICAL:** Commit frequently during development to ensure session recovery works.

#### When to Commit (Atomic Milestones)

Commit after completing each discrete unit of work:

```bash
# ✅ Created a new file
git add src/speckit/validators.ts
git commit -m "feat(validate): add validators module with 4 validation rules"

# ✅ Completed a function
git commit -am "feat(validate): implement checkCompleteness validator"

# ✅ Wrote tests
git add tests/tools/validate.test.ts
git commit -m "test(validate): add 3 tests for completeness check"

# ✅ Registered tool
git commit -am "feat(validate): register spec_validate tool in server"

# ✅ Updated docs
git commit -am "docs(validate): add validation examples to README"

# ✅ Fixed a bug
git commit -am "fix(validate): handle missing sections correctly"
```

**Don't wait** to commit! Small, frequent commits are BETTER for recovery.

#### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding/updating tests
- `refactor`: Code refactoring
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes

**Scopes:** `validate`, `refine`, `clarify`, `prereqs`, `server`, etc.

**Examples:**
```bash
# Simple feature
git commit -m "feat(validate): add spec_validate tool"

# Feature with context
git commit -m "feat(validate): add checkAcceptanceCriteria validator

Validates that every feature has testable when/then criteria.
Warns if acceptance section exists but has no bullets/criteria."

# Feature with decision rationale
git commit -m "feat(validate): use Zod for validation schemas

DECISION: Use Zod instead of JSON Schema
RATIONALE: Better TypeScript integration, already used in project
IMPACT: All validation schemas are now type-safe"

# Bug fix
git commit -m "fix(validate): handle undefined section gracefully"

# Tests
git commit -m "test(validate): add 6 tests for section parser"

# Documentation
git commit -m "docs(validate): add validation workflow guide"
```

### Session Recovery Process

If a development session crashes or is interrupted:

#### 1. Check What Was Completed
```bash
# See recent commits
git log --oneline --since="1 day ago"

# Output example:
# abc123 test(validate): add 8 tests for validation tools
# def456 feat(validate): register validation tools in server
# ghi789 feat(validate): add spec_validate tool
# jkl012 feat(validate): add validators module
```

#### 2. Check What's In Progress
```bash
# See uncommitted changes
git status

# See actual changes
git diff
```

#### 3. Find Next Tasks
```bash
# Open plan.md
# Find current story (e.g., Story 26)
# Check task list against git log
# Tasks with commits = done ✅
# Tasks without commits = remaining ⏸️
```

#### 4. Resume Work
Continue from the first uncompleted task in plan.md.

### Example: Working on Story 26

**plan.md shows:**
```markdown
Story 26 — Spec Validation & Quality Gates

Tasks:
  • Create src/tools/validate.ts
  • Create src/speckit/validators.ts
  • Implement checkCompleteness()
  • Implement checkAcceptanceCriteria()
  • Register tools in createServer.ts
  • Write unit tests
  • Update README
```

**Git history shows:**
```bash
$ git log --oneline --since="1 day ago"
abc123 feat(validate): implement checkAcceptanceCriteria
def456 feat(validate): implement checkCompleteness
ghi789 feat(validate): add validators module
jkl012 feat(validate): add validate.ts with spec_validate tool
```

**Recovery logic:**
- ✅ Create validate.ts (commit jkl012)
- ✅ Create validators.ts (commit ghi789)
- ✅ Implement checkCompleteness (commit def456)
- ✅ Implement checkAcceptanceCriteria (commit abc123)
- ⏸️ **Next:** Register tools in createServer.ts

Resume from that point!

### Pre-Commit Hook Integration

Pre-commit hooks automatically run before each commit:

```bash
npm run precommit
# Runs:
# - npm run build:local (TypeScript compilation)
# - npm run lint (ESLint)
# - npm run test (Full test suite)
```

This ensures every commit:
- ✅ Compiles successfully
- ✅ Passes linting
- ✅ Passes all tests

**Result:** Every commit is deployable!

### Progress Tracking Without TODO.md

**Instead of TODO.md, use:**

1. **Current Story:** Check plan.md → Current phase → Active stories
2. **Tasks Done:** `git log --oneline --since="1 week ago"`
3. **Tasks In Progress:** `git status` + `git diff`
4. **Tasks Remaining:** Compare plan.md task list vs git log
5. **What Shipped:** Check CHANGELOG.md

### Release Process

When completing a story or phase:

1. **Verify all story tasks are committed:**
   ```bash
   git log --oneline --since="[start-date]" | grep "Story-26"
   ```

2. **Update CHANGELOG.md** with story summary

3. **Bump version in package.json**

4. **Create release commit:**
   ```bash
   git commit -am "chore: release v0.2.0"
   ```

5. **Create Git tag:**
   ```bash
   git tag -a v0.2.0 -m "Phase 1 Complete - Core Spec Kit Parity"
   ```

6. **Push with tags:**
   ```bash
   git push origin main --tags
   ```

7. **Create GitHub release** (via gh CLI or web UI)

8. **Publish to npm:**
   ```bash
   npm publish
   ```

### Best Practices Summary

1. ✅ **Commit frequently** - After each discrete unit of work
2. ✅ **Use conventional commits** - `type(scope): description`
3. ✅ **Include context** - Add "why" in commit body when needed
4. ✅ **Trust the pre-commit hooks** - They ensure quality
5. ✅ **Use plan.md as task source** - It's the master list
6. ✅ **Use git log for progress** - It never lies
7. ❌ **Don't batch commits** - Small is better
8. ❌ **Don't skip pre-commit** - Quality gates exist for a reason
9. ❌ **Don't maintain TODO.md** - It's redundant with git + plan.md

## Reference Implementations

- invariantlabs-ai/mcp-streamable-http
- ferrants/mcp-streamable-http-typescript-server
- modelcontextprotocol/typescript-sdk examples