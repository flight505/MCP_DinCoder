# CLAUDE.md

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

**Spec-Driven MCP Orchestrator** - Model Context Protocol server with Streamable HTTP transport, exposing Spec Kit tools (specify, plan, tasks) for AI-assisted spec-driven development workflows.

## Critical Requirements

- **Protocol**: MCP Streamable HTTP (Protocol Revision 2025-03-26)
- **TypeScript SDK**: @modelcontextprotocol/sdk v1.17.5+
- **Node.js**: >=20
- **Transport**: HTTP only (STDIO deprecated Sept 7, 2025)
- **TypeScript Config**: MUST use module/moduleResolution: "NodeNext"

## ⚠️ MCP Prompts - CRITICAL UNDERSTANDING

**MCP prompts are workflow orchestrators for AI agents, NOT user-typed commands.**

### How They Work

1. **AI Discovery**: Agents discover prompts via `prompts/list` JSON-RPC call
2. **AI Invocation**: Agents call `prompts/get` programmatically when relevant
3. **User Experience**: Users describe goals in natural language; AI uses appropriate prompt automatically

### Example

**User:** "Let's start a new project called task-manager"

**Behind the scenes:**
- AI recognizes this matches `start_project` prompt
- AI invokes prompt programmatically
- AI receives workflow instructions
- AI guides user through setup

**User sees:** Natural conversation (NOT a slash command)

### Platform Behavior

- **Claude Code**: `@` = files, `/` = native commands, MCP prompts = invisible
- **VS Code/Copilot/Cursor**: MCP prompts integrated into agent workflows

### Registered Prompts (v0.4.0+)

| Prompt | Purpose | Arguments |
|--------|---------|-----------|
| `start_project` | Initialize new project | projectName, agent (optional) |
| `create_spec` | Create specification | description |
| `generate_plan` | Generate implementation plan | specPath (optional) |
| `create_tasks` | Break down into tasks | planPath (optional) |
| `review_progress` | Generate progress report | None |
| `validate_spec` | Check specification quality | specPath (optional) |
| `next_tasks` | Show actionable tasks | limit (optional) |

**Implementation:** [src/server/prompts.ts](src/server/prompts.ts)

## Development Commands

```bash
# Development
npm run dev          # Start development server with hot-reload
npm run build        # Build TypeScript to dist/
npm run start:local  # Start production server locally

# Quality
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run test         # Run all tests
npm run precommit    # Run build + lint + test (pre-commit hook)

# Deployment
npm pack             # Create tarball for inspection
npm publish          # Publish to NPM (after version bump)
```

## Architecture

### Core Components

1. **HTTP Transport** (`src/http/`) - Express app with `/mcp` endpoint (POST/GET/DELETE)
2. **MCP Server** (`src/server/`) - McpServer factory, registers tools/resources/prompts
3. **Spec Kit Tools** (`src/tools/`) - 26 tools across workflow, validation, quality categories
4. **Spec Kit Modules** (`src/speckit/`) - Document detection, parsing, templates, validators
5. **Configuration** (`src/config/`) - Zod schemas, Smithery config support
6. **Security** (`src/security/`) - Origin validation, bearer token auth

### Session Management

**Stateless (Serverless):** Create new server/transport per request
**Stateful (Persistent):** Maintain session map with UUID session IDs

## Testing

- Unit tests for each tool handler
- Integration tests for HTTP endpoints
- MCP protocol conformance tests
- Coverage requirement: 90% statements
- **Current:** 52 tests passing (100% pass rate)

## Known Pitfalls

1. ⚠️ **Tool Names**: Must match `^[a-zA-Z0-9_-]{1,64}$` - no periods
2. ⚠️ **Console Logging**: Only `console.warn()` and `console.error()` allowed in source. `console.log()` only in `examples/` and `scripts/`
3. **External Dependencies**: Tools should be self-contained
4. **Stateless Mode**: Always create new transport instances per request
5. **Session IDs**: Must be visible ASCII (0x21-0x7E) only
6. **STDIO**: Never log to stdout when STDIO transport active
7. **Directory Structure**: Use `.dincoder/` for all generated artifacts

## Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

**Types:** feat, fix, docs, test, refactor, chore, build, ci
**Scopes:** validate, refine, clarify, prereqs, server, etc.

**Examples:**
```bash
git commit -m "feat(validate): add spec_validate tool"
git commit -m "fix(validate): handle missing sections correctly"
git commit -m "test(validate): add 6 tests for section parser"
```

**Important:**
- ✅ Commit frequently (after each discrete unit of work)
- ✅ Small commits are better than large ones
- ❌ Do NOT reference AI tools in commits (no "Generated with...", "Co-Authored-By: Claude", etc.)
- ❌ Do NOT skip pre-commit hooks (they ensure quality)

## Session Recovery

Use Git commits + plan.md to track progress:

1. **Check completed work:** `git log --oneline --since="1 day ago"`
2. **Check in-progress:** `git status` + `git diff`
3. **Find next tasks:** Open plan.md, compare task list vs git log
4. **Resume work:** Continue from first uncompleted task

**Pre-commit hook automatically runs:**
- `npm run build:local` - TypeScript compilation
- `npm run lint` - ESLint
- `npm run test` - Full test suite

Every commit is verified and deployable.

## Project Status

**Current Version:** v0.4.2 (Documentation fixes for MCP prompts)
**Tools:** 26 MCP tools + 7 prompts
**Testing:** 52 tests passing (100% pass rate)
**Progress:** 28/36 stories complete (78%)

See [plan.md](plan.md) for complete roadmap and version history.

## Deployment

### Smithery (Recommended)

1. **smithery.yaml**: `runtime: "typescript"`
2. Push to GitHub, connect to Smithery
3. Navigate to Deployments → Click Deploy

### NPM

```bash
npm version patch  # Bump version
npm publish --access public
git push origin main --tags
```

## Reference

- [MCP Specification](https://modelcontextprotocol.io)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [plan.md](plan.md) - Complete roadmap and version history
- [CHANGELOG.md](CHANGELOG.md) - Release notes
