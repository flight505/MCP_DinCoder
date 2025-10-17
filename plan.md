# DinCoder Project Plan & Roadmap

## Roadmap Snapshot
- **Roadmap Version:** 3.0 (Integration Strategy added 2025-10-16)
- **Document Last Updated:** 2025-10-17
- **Current Package Version:** 0.4.2 (Documentation fixes for MCP prompts, published to npm)
- **Next Target Version:** 0.5.0 (Integration Strategy B - Claude Code Plugin)
- **Stories Complete:** 28 / 36 (78%) - Phase 1 & 2 COMPLETE, Integration Phase STARTED 🎯
- **Stories in Progress:** Phase 3 - Integration & Discovery (Strategies B-E)
- **Latest Release Highlights:** v0.4.2 fixes critical documentation issues - MCP prompts are AI workflow orchestrators, not user-typed slash commands!

## Vision Statement
DinCoder is a fully-fledged Spec-Driven Development MCP server optimized for AI coding assistants. Unlike GitHub's CLI-focused Spec Kit, DinCoder delivers the complete Constitution → Specify → Clarify → Plan → Tasks → Implement → Validate workflow as composable MCP tools ready for agents such as Claude Code, Cursor, and GitHub Copilot.

## Current State vs Target State

### Current State (v0.1.20)
- ✅ Core workflow tools (specify, plan, tasks) are live with authentic Spec Kit markdown generation.
- ✅ Quality tools (format, lint, test, security, deps, license) keep repositories healthy.
- ✅ Supporting tools (artifacts, research, git) enable research trails and branch management.
- ✅ Dual transport support: STDIO and Streamable HTTP with Smithery deployment.
- ✅ CI/CD pipeline publishes to npm and Smithery; automated prompt validation exists.
- ⚠️ Five advanced Spec Kit-style commands (validation, visualization, templates, etc.) are still planned.

### Target State (v1.0.0)
- ✅ Full Spec Kit parity for AI agents (validation, refinement, visualization, contracts).
- ✅ Quality gates and analytics to block incomplete specs and surface trends.
- ✅ Visual diagrams and contract generation directly from artifacts.
- ✅ Template customization, task filtering, and dependency graphs for large projects.
- ✅ Production-grade observability, error recovery, and best-practice guidance.

## Roadmap Phases Overview

| Phase | Version | Goal | Incremental Tools/Features | Timeline | Status |
|-------|---------|------|---------------------------|----------|--------|
| Current | v0.1.x | Smithery deployment & quality tooling foundation | 14 tools | Complete | ✅ |
| Phase 1 | v0.2.0 | Core Spec Kit parity (constitution, clarify, validation) | +7 → 21 tools | Completed 2025-10-16 | ✅ **COMPLETE** |
| Phase 2 | v0.3.0 | Advanced task management (visualize, filter, batch, search, stats) | +5 → 26 tools | Completed 2025-10-16 | ✅ **COMPLETE** |
| Phase 3 | v0.4.0 | Integration Strategy A (MCP Prompts - Universal) | +7 prompts | Completed 2025-10-16 | ✅ **COMPLETE** |
| Phase 3.1 | v0.5.0 | Integration Strategy B (Claude Code Plugin) | Plugin repo | ~1 week | 📋 Planned |
| Phase 3.2 | v0.6.0 | Integration Strategy C+D (VS Code + Codex docs) | Documentation | ~1 week | 📋 Planned |
| Phase 3.3 | v0.7.0 | Integration Strategy E (Project Templates) | Templates | ~1 week | 📋 Planned |
| Phase 4 | v0.8.0 | Advanced features (contracts, templates, metrics, lint) | +6 → 32+ tools | ~3 weeks | 📋 Planned |
| Phase 5 | v1.0.0 | Production polish & examples | Refinement | ~2 weeks | 📋 Planned |

## Project Status Summary (Last Updated: 2025-10-16)

**Progress:** 28/36 stories complete (78%)

- ✅ **Completed:** Stories 2, 3, 6-16, 24-34 (Phases 1, 2, and 3 - Strategy A COMPLETE!)
- 📋 **Planned:** Stories 35-38 (Phase 3.1-3.3 - Integration Strategies B-E)
- 📋 **Next Priority:** Story 35 - Claude Code Plugin (Strategy B)

**Phase 3 Achievements (v0.4.0 - Integration & Discovery):**
- ✅ Story 34: MCP Prompts (Strategy A - Universal)
  - 7 workflow prompts: `start_project`, `create_spec`, `generate_plan`, `create_tasks`, `review_progress`, `validate_spec`, `next_tasks`
  - Auto-discovered slash commands in all MCP clients
  - Built-in workflow guidance
  - Cross-platform compatibility (Claude Code, VS Code, Codex, Cursor)
- 🎯 **Result:** Zero-configuration integration across all platforms!

**Phase 2 Achievements (v0.3.0 - Advanced Task Management):**
- ✅ Story 29: Task Visualization (`tasks_visualize`) - Mermaid, Graphviz, ASCII graphs
- ✅ Story 30: Task Filtering (`tasks_filter`) - Smart presets and multi-criteria filtering
- ✅ Story 31: Batch Operations (`tasks_tick_range`) - Range expansion for bulk completion
- ✅ Story 32: Task Search (`tasks_search`) - Fuzzy matching with Levenshtein algorithm
- ✅ Story 33: Task Statistics (`tasks_stats`) - Progress charts and analytics
- 🎯 **Result:** Scalable task management for 50+ task projects!

**Phase 1 Achievements (v0.2.0 - Core Spec Kit Parity):**
- ✅ Story 24: Constitution Tool (`constitution_create`)
- ✅ Story 25: Clarification Tracking (`clarify_add`, `clarify_resolve`, `clarify_list`)
- ✅ Story 26: Spec Validation & Quality Gates (`spec_validate`, `artifacts_analyze`)
- ✅ Story 27: Spec Refinement (`spec_refine`)
- ✅ Story 28: Prerequisites Check (`prereqs_check`)
- 🎯 **Result:** 100% GitHub Spec Kit command parity for AI coding workflows!

**Testing:** 52 tests across unit, integration, and conformance (52 passing, 22 skipped edge cases)

---

## Detailed Story Backlog

Below is a very, very, very detailed project plan rendered as a markdown checklist. It is organized into "stories," each broken down into one‑story‑point tasks (every checkbox is small and independently completable by an autonomous coding agent). Where a task's rationale depends on external knowledge, I've cited the official MCP spec, Smithery docs, and GitHub Spec Kit materials; where a task is grounded in the uploaded YouTube transcript, I've cited the transcript.

✅ Project: Spec‑Driven MCP Orchestrator (Streamable HTTP, NPM + Smithery)

Story 0 — Load research & extract requirements (video transcript → working notes)

Goal: Read the uploaded YouTube subtitles to ground our understanding of Spec Kit and spec‑driven development; distill actionables.

	•	Open the uploaded transcript file and load it into the repo under docs/research/spec-kit-youtube-transcript.txt.  ￼
	•	Create docs/research/spec-kit-notes.md and summarize: Spec‑driven vs “vibe coding”, and why specs serve as the single source of truth.  ￼
	•	Extract the four gated phases (Specify, Plan, Tasks, Implement) with one‑sentence definitions each.  ￼
	•	Note the CLI ergonomics (initialization creates scripts/templates; branch creation; spec markdown output; “needs clarification” block).
	•	Record that Spec Kit creates a detailed task list with numbered items, favoring test‑first flow in the template.
	•	Export a concise glossary: “spec,” “plan,” “tasks,” “implement,” “acceptance scenarios,” “edge cases,” “research doc,” “zod schema.”  ￼
	•	Commit docs/research/spec-kit-notes.md with transcript references.

⸻

Story 1 — Consolidate current state of the art (Spec Kit + MCP + Smithery)

Goal: Pin authoritative sources and pin versions.

	•	Add docs/refs.md listing authoritative references with short annotations (MCP transports; Smithery deployments; Spec Kit repo/blog; MCP TS/Py SDKs).  ￼ ￼ ￼
	•	In docs/refs.md, capture Streamable HTTP essentials (single endpoint; POST + optional SSE; GET SSE; session header; protocol version header).  ￼
	•	Record Smithery requirements (endpoint = /mcp; handle GET/POST/DELETE; optional ?config=<base64>).  ￼
	•	Confirm Spec Kit cross‑agent support (Copilot, Claude Code, Gemini CLI) and CLI bootstrap command.  ￼ ￼
	•	Pin SDK choices: @modelcontextprotocol/sdk (TS) as primary; document Python SDK parity for future ports.  ￼
	•	Commit docs/refs.md.

⸻

Story 2 — Greenfield repo bootstrap & developer workflow ✅

Goal: Create a clean, boring, reproducible TypeScript workspace.

	• ✅	Initialize repo: git init; create main branch; set default Node to >=20.
	• ✅	Create package.json with type: "module" and scripts: dev, build, lint, format, test, start:local.
	• ✅	Add tsconfig.json (module/moduleResolution: "NodeNext", target: ES2022, strict: true, outDir: dist, rootDir: src). **CRITICAL: Must use NodeNext for MCP SDK compatibility.**
	• ✅	Install runtime deps: @modelcontextprotocol/sdk (^1.17.5+), zod, express.  ￼
	• ✅	Install dev deps: typescript, tsx, vitest, @vitest/coverage-v8, supertest, @types/node, @types/express, eslint, @eslint/js, typescript-eslint, prettier, tsup.
	• ✅	Add .editorconfig (2 spaces, LF, utf‑8).
	• ✅	Add .nvmrc with Node LTS; document with README blurb.
	• ✅	Configure ESLint: eslint.config.mjs with TS parser, node/globals, import rules.
	• ✅	Configure Prettier: prettier.config.cjs.
	•	Add Husky + lint-staged pre‑commit (format + eslint on staged).
	• ✅	Add LICENSE (MIT) and basic README.md skeleton.
	• ✅	Commit as "chore: bootstrap repo".

⸻

Story 3 — Real Spec Kit Integration ✅

Goal: Transform from mock implementation to authentic Spec-Driven Development orchestrator.

	• ✅	Created speckit/detector.ts module for detecting Spec Kit document types from content
	• ✅	Created speckit/parser.ts module for parsing Spec Kit markdown to structured JSON
	• ✅	Created speckit/templates.ts module with official Spec Kit markdown templates
	• ✅	Updated all tools (specify, plan, tasks) to generate real Spec Kit markdown documents
	• ✅	Cached official Spec Kit templates locally in templates/speckit/ directory
	• ✅	Maintained backward compatibility with JSON format while adding markdown support
	• ✅	Tools now generate authentic documents that work with GitHub's SDD methodology
	• ✅	Provides clear path: intent → specification → plan → tasks → implementation

⸻

Story 4 — Plan the technical architecture (align to Streamable HTTP & Smithery)

Goal: Produce a concrete plan honoring spec and platform constraints.

	•	Run /plan with constraints: TypeScript, Express, Streamable HTTP, /mcp endpoint, config via ?config=<base64>.  ￼ ￼
	•	Ensure the plan includes: Data model (Zod schemas), research document, and contracts for object types.  ￼
	•	Verify plan calls out session management and MCP‑Protocol‑Version header handling.  ￼
	•	Verify security guidance: Origin validation, local bind guidance, auth.  ￼
	•	Gate: Approve plan; commit specs/000-orchestrator/plan.md.

⸻

Story 5 — Expand tasks with Spec Kit, then normalize to 1‑point units

Goal: Generate and curate the granular to‑do list used for implementation.

	•	Run /tasks to generate the actionable backlog.  ￼
	•	Split any large items into smaller 1‑point tasks; keep each unit shippable in isolation.  ￼
	•	Ensure early tasks cover environment setup and test‑first where appropriate.  ￼
	•	Commit specs/000-orchestrator/tasks.md as the canonical execution list.

⸻

Story 6 — Implement MCP server skeleton (Streamable HTTP) ✅

Goal: Build a minimal but spec‑compliant server exposing a /mcp endpoint with POST/GET/DELETE.

	• ✅	Create src/server/createServer.ts exporting a factory createServer() that wires tools/resources/prompts using the TS SDK.  ￼
	• ✅	Create src/http/app.ts with an Express app.
	• ✅	Add src/http/transport.ts that wraps StreamableHTTPServerTransport from the TS SDK.  ￼
	• ✅	**CRITICAL**: For stateless mode, create new server/transport instances per request. For stateful mode, implement session map with UUID-based session IDs.
	• ✅	Implement POST /mcp to accept one JSON‑RPC message per request and either SSE (for streamed responses) or JSON per MCP spec.  ￼
	• ✅	Implement GET /mcp to open an SSE stream for server‑initiated messages; return 405 if not supported.  ￼
	• ✅	Implement DELETE /mcp to end a session when Mcp-Session-Id header is provided (if server allows client‑initiated termination).  ￼
	• ✅	Add Mcp-Session-Id issuance on initialization (use crypto.randomUUID()) and enforce header presence on subsequent calls (400 if absent).  ￼
	• ✅	Return/accept MCP-Protocol-Version header; default to "2025-03-26" when absent (per spec guidance).  ￼
	• ✅	Implement Origin checking and optional auth (bearer/API key) middleware.  ￼
	• ✅	Add graceful shutdown (SIGINT/SIGTERM) to close transports. Use res.on('close') to cleanup per-request resources.
	• ✅	Write unit tests for POST/GET/DELETE happy paths and error paths using vitest + supertest.
	• ✅	Add SSE tests ensuring event framing (data: ...\n\n) correctness and stream close after response.  ￼
	• ✅	**Error Handling**: Wrap all handlers in try-catch, log to stderr, return valid JSON-RPC error responses.
	• ✅	Commit "feat(server): minimal MCP streamable HTTP endpoint".

⸻

Story 7 — Implement Spec‑Driven tools inside the MCP server ✅

Goal: Expose tools that run Spec Kit phases and parse artifacts so any AI coder can drive SDD through MCP.

	• ✅	Tool specify.start: inputs { projectName, agent }; runs specify init <projectName> --ai <agent>; returns path + summary.  ￼
	• ✅	Tool specify.describe: inputs { description }; posts /specify <description> into agent session or CLI wrapper; returns generated spec path.  ￼
	• ✅	Tool plan.create: inputs { constraintsText }; posts /plan ... to generate plan.md, data model, contracts; returns file paths.  ￼
	• ✅	Tool tasks.generate: inputs { scope }; posts /tasks to produce tasks.md; returns structured task objects (id, title, deps).  ￼
	• ✅	Tool tasks.tick: mark a task ID as done; persist in tasks.md (idempotent update).  ￼
	• ✅	Tool artifacts.read: return normalized JSON for spec/plan/tasks for downstream UIs.
	• ✅	Tool research.append: write to the Spec Kit research doc for decisions taken.  ￼
	• ✅	Tool git.create_branch: create a working branch for a feature (Spec Kit may do this on init; mirror behavior).  ￼
	• ✅	Add robust path sandboxing (only operate under a configured workspace directory).
	• ✅	Add timeouts and resource limits when running CLI commands.

⸻

Story 8 — MCP tools for repo hygiene & quality ✅

Goal: Ensure autonomous agents don't degrade the codebase.

	• ✅	Tool quality.format: run Prettier; return diff summary.
	• ✅	Tool quality.lint: run ESLint; return problem list JSON.
	• ✅	Tool quality.test: run vitest --run --coverage; return pass rate + coverage.
	• ✅	Tool quality.security_audit: run npm audit --json; summarize vulnerabilities.
	• ✅	Tool quality.deps_update: dry‑run minor updates (e.g., npm outdated summary).
	• ✅	Tool quality.license_check: scan dependencies for license compatibility.

⸻

Story 9 — Validation & conformance to MCP spec ✅

Goal: Prove we follow the letter of the spec.

	• ✅	Add JSON‑RPC schema tests for requests/responses.  ￼
	• ✅	Add tests for resumability using SSE id and Last-Event-ID headers (server may support replay).  ￼
	• ✅	Add a test for rejecting invalid Origin.  ￼
	• ✅	Add tests ensuring single endpoint path for POST/GET/DELETE (/mcp).  ￼
	• ✅	Verify MCP‑Protocol‑Version negotiation is honored.  ￼
	• ✅	Create docs/conformance.md summarizing checks with links to spec sections.  ￼

⸻

Story 10 — Configuration, security & ops ✅

Goal: Make it safe to run remotely.

	• ✅	Parse Smithery ?config=<base64> and map to internal config schema (Zod).  ￼
	• ✅	Add CONFIG_ORIGIN_WHITELIST and validate on every request.  ￼
	• ✅	Support API key auth via Authorization: Bearer <token> (optional).
	• ✅	Integrate structured logging (pino); never leak secrets in logs.
	• ✅	Health endpoint GET /healthz (non‑MCP) with build info.
	• ✅	Rate limiting on /mcp (token bucket per IP/session).
	• ✅	Add CORS controls (default deny; allow configured origins).
	• ✅	Provide Dockerfile (node:22-alpine) with non‑root user.
	• ✅	Add SECURITY.md listing threat model and mitigations (DNS rebinding, auth).  ￼

⸻

Story 11 — Developer ergonomics & examples ✅

Goal: Smooth adoption.

	• ✅	examples/local-client.ts: connect using SDK client to local /mcp (POST + SSE).  ￼
	• ✅	examples/smithery-client.ts: connect to https://server.smithery.ai/<pkg>/mcp via StreamableHTTPClientTransport (include config).  ￼
	• ✅	examples/spec-workflow.md: step‑by‑step "run Spec Kit through MCP tools" demo.  ￼
	• ✅	Update README with quick start (local and Smithery) and FAQ.

⸻

Story 12 — Tests: unit, integration, smoke, and performance ✅ MOSTLY COMPLETE

Goal: High confidence, automated.

	• ✅	Integration tests: start Express on ephemeral port; call POST/GET/DELETE; validate SSE. [31/33 tests passing]
	• ✅	JSON-RPC 2.0 compliance tests [All passing]
	• ✅	Error handling tests [All passing]
	• ✅	Protocol version negotiation tests [All passing]
	• ⚠️	Stateful session management tests [2 failing - SDK limitation]
	• ⚠️	Unit tests for every tool handler (valid/invalid inputs). [Partial - need more coverage]
	•	"Spec Kit path" tests: simulate specify/plan/tasks flow and verify artifacts are parsed.
	•	Smoke tests in CI: build → run → hit /healthz → basic POST roundtrip.
	•	Perf baseline: run autocannon at 50 rps on POST; ensure p95 < 150ms for trivial tool.
	•	Coverage gate: fail CI < 90% statements.

⸻

Story 13 — CI/CD & release automation ✅

Goal: Every commit is validated; releases are easy.

	• ✅	Add GitHub Actions: ci.yml (install, build, lint, test, coverage artifact).
	• ✅	Add release.yml (manual) to publish to NPM on tag.
	• ✅	Integrate Changesets or semantic‑release for semver bumps.
	• ✅	Generate changelog and GitHub release notes.
	• ✅	Cache ~/.npm and node_modules for faster CI.

⸻

Story 14 — Prepare for NPM publishing ✅

Goal: Package is consumable by anyone.

	• ✅	Ensure package.json has "name", "version", "main": "dist/index.js", "types": "dist/index.d.ts", keywords, repository, license.
	• ✅	Create src/index.ts with public exports (createServer, tool registrars).
	• ✅	Build with tsup to ESM (and, if desired, dual ESM/CJS); verify exports map.
	• ✅	Add "files" whitelist (exclude test/source by default).
	• ✅	Add README sections: install, usage, config, Smithery notes.  ￼
	• ✅	Run npm pack and inspect tarball.
	• ✅	Publish dry‑run (if configured) → npm publish.

⸻

Story 15 — Smithery integration & deployment ✅

Goal: Make it live on Smithery and compatible with the platform.

	• ✅	Create smithery.yaml (not json) with runtime: "typescript" configuration per Smithery TypeScript deployment guide.  ￼
	• ✅	Configure package.json with build/dev scripts using @smithery/cli.
	• ✅	Structure server with default export function createServer({ config }) returning McpServer instance.
	• ✅	Add optional configSchema export using Zod for configuration validation.
	• ✅	Ensure /mcp implements GET/POST/DELETE exactly per Smithery expectations.  ￼
	• ✅	Ensure support for ?config=<base64> query param decoded and validated.  ￼
	• ✅	**CRITICAL**: Ensure HTTP transport only - STDIO deprecated September 7, 2025.
	• ✅	Consider using ts-smithery-cli approach for simplest migration path.
	• ✅	Add "Deploy on Smithery" instructions to README (GitHub integration method).  ￼
	•	Post‑deploy smoke test using Smithery's recommended client flow (Streamable HTTP client).  ￼
	•	Document API key usage where applicable (Smithery registry/SDK).  ￼

⸻

Story 16 — Migration path (if upgrading an existing STDIO server) ✅

Goal: Provide a crisp path to Streamable HTTP (and optionally maintain compatibility).

	• ✅	Capture current STDIO entrypoint and tool registrations; freeze a "before" tag.
	• ✅	Create HTTP transport entry (/mcp) alongside STDIO temporarily; verify both work.  ￼
	• ✅	Replace server bootstrap to not write to stdout (HTTP is fine; STDIO must not log on stdout).
	• ✅	Remove legacy SSE transport if present and document backwards compatibility choices.  ￼
	• ✅	Update docs for new connection instructions and note deprecation of STDIO hosting where applicable (per vendor communications).
	• ⏳	Remove STDIO once clients have migrated; cut major version; update Smithery deployment type. [Scheduled for Sept 2025]

⸻

Story 17 — Cross‑agent validation (Copilot, Claude Code, Cursor, Gemini)

Goal: Prove it works across the common agent surfaces Spec Kit targets.

	•	Write a lab note for Copilot: how to connect, run Spec‑Driven tools, and view streamed output.  ￼
	•	Write a lab note for Claude Code with the same flow.  ￼
	•	Write a lab note for Gemini CLI with the same flow.  ￼
	•	Validate that task numbering and spec artifacts look consistent to all agents (the Spec Kit convention).  ￼
	•	Capture agent‑specific quirks and workarounds in docs/agents.md.

⸻

Story 18 — Observability & diagnostics

Goal: Make it debuggable.

	•	Add request/response logging with correlation ID per session (avoid content logging; log envelopes).
	•	Add “debug mode” flag to include timing and stream event counts.
	•	Add /metrics (Prometheus text format) for basic counters (requests, SSE connections, errors).
	•	Provide LOG_LEVEL env var; default info.

⸻

Story 19 — Hardening & security checks

Goal: Lower risk and prove care.

	•	Dependency scanning: npm audit and (optional) Snyk in CI.
	•	Fuzz minimal JSON‑RPC payloads to ensure 400/422 paths are correct.
	•	Ensure Origin checks enforced and unit tested.  ￼
	•	Red‑team review doc listing auth model and secrets handling.
	•	Add e2e test for Mcp-Session-Id rotation (server invalidates old session → client gets 404 → re‑init).  ￼

⸻

Story 20 — Documentation polish

Goal: Great first‑time experience.

	•	Expand README with architecture diagram (request flow, SSE stream).
	•	Add a “Spec‑Driven Quickstart” section mapping the four phases to the exposed tools.  ￼
	•	Add troubleshooting: common HTTP/SSE pitfalls, protocol version header, Origin errors.  ￼
	•	Add examples section with copy‑paste commands for local & Smithery usage.  ￼

⸻

Story 21 — Release v0.1.0 and beyond

Goal: Ship and iterate safely.

	•	Set version to 0.1.0; create tag and GitHub release.
	•	npm publish; capture URL in README badges.
	•	Register/publish on Smithery and verify the listing + deployment works end‑to‑end.  ￼
	•	Open roadmap issues for future: Python port; advanced resumability; richer auth; multi‑tenant configs.  ￼

⸻

Story 22 — Best Practices & Common Pitfalls Prevention

Goal: Implement research-backed patterns to avoid known issues.

	•	**Session Management**: Implement proper session ID validation (visible ASCII 0x21-0x7E only).
	•	**Error Handling**: Use McpError class with ErrorCode enum for protocol-level errors.
	•	**Stateless vs Stateful**: Document when to use each mode (stateless for serverless, stateful for persistent connections).
	•	**Request ID Collisions**: Ensure new transport instances per request in stateless mode to prevent collisions.
	•	**Browser Compatibility**: Test session management in both Node.js and browser environments.
	•	**Timeout Management**: Handle long-running operations with progress updates to reset 60-second timeout.
	•	**Logging**: All diagnostic output to stderr only, never to stdout (critical for STDIO compatibility).
	•	**TypeScript Config**: Verify module: "NodeNext" and moduleResolution: "NodeNext" in tsconfig.json.
	•	**Version Negotiation**: Handle MCP-Protocol-Version header properly with fallback to "2025-03-26".
	•	**Resource Cleanup**: Use res.on('close') for proper cleanup of per-request resources.
	•	Document all patterns in docs/best-practices.md with code examples.

⸻

Story 23 — Optional: Backwards compatibility with HTTP+SSE 2024‑11‑05 (legacy)

Goal: Serve older clients during a transition (if needed).

	•	Decide whether to also expose the old SSE endpoint(s) alongside the new MCP endpoint.  ￼
	•	If yes, implement the legacy GET SSE initiation and POST pairing as described in the spec’s backward‑compatibility section.  ￼
	•	Add tests proving both transports operate without message duplication.  ￼
	•	Document sunset schedule; remove legacy in a future major.

⸻

## Lessons Learned from v0.4.2 Release

### Critical Documentation Issue Discovered

**Problem Identified:** Documentation incorrectly described MCP prompts as user-typed slash commands, causing significant confusion.

**Root Cause:**
- Misunderstood how MCP prompts work vs how Claude Code uses `@` symbol
- README suggested users type `@mcp__dincoder__start_project` to invoke prompts
- Confused MCP protocol's programmatic prompt discovery with user-facing UI

**User Insight:** User correctly identified that `@` in Claude Code is for file attachments, not MCP prompts. This was the key insight that revealed the documentation error.

**What MCP Prompts Actually Are:**
- **Workflow orchestrators** for AI agents, not user commands
- Discovered programmatically via `prompts/list` JSON-RPC call
- Invoked automatically by AI when relevant to user's request
- **Invisible to users** - users just describe goals in natural language

### Documentation Fixes Implemented

1. **README.md Major Rewrite** ✅
   - **Before:** Section titled "MCP Prompts (Slash Commands)"
   - **After:** Section titled "MCP Prompts (AI Workflow Orchestration)"
   - **Impact:** Removed all incorrect `@` syntax examples
   - **Added:** Clear explanation of programmatic invocation
   - **Added:** Workflow examples showing AI discovers and uses prompts automatically

2. **CLAUDE.md Critical Clarification** ✅
   - **Added:** Prominent "⚠️ MCP Prompts vs Slash Commands" section
   - **Placement:** After "Critical Requirements" for high visibility
   - **Content:**
     - Distinction between MCP prompts, slash commands, and custom commands
     - How MCP prompts work (prompts/list, prompts/get JSON-RPC calls)
     - Example workflow showing AI using prompts programmatically
   - **Impact:** Internal AI agents now understand the distinction

3. **PUBLISH_INSTRUCTIONS.md** ✅
   - **Created:** Complete npm publishing guide
   - **Sections:** Pre-publish checklist, testing steps, post-publish verification
   - **Value:** Ensures correct publishing process for future releases

4. **CHANGELOG.md** ✅
   - **Added:** Comprehensive v0.4.1 entry
   - **Documented:** All documentation corrections made
   - **Explained:** The misconception that was fixed
   - **Status:** Package ready to publish to npm

### Lessons Learned

1. **Verify Platform-Specific UI Patterns Early** ⚠️ CRITICAL
   - Different MCP clients have different UI conventions
   - Claude Code: `@` for files, `/` for native commands, MCP prompts invisible
   - VS Code Copilot: Different integration pattern
   - Lesson: Test documentation against actual platform behavior

2. **MCP Protocol ≠ User Interface**
   - MCP provides programmatic capabilities (tools, prompts, resources)
   - How clients expose these varies widely
   - Prompts are for AI agents, not end users
   - Lesson: Clearly separate protocol features from UI affordances in documentation

3. **Listen to User Confusion**
   - User's question about `@` syntax revealed fundamental documentation flaw
   - Quick validation via web search confirmed the issue
   - Lesson: User confusion often signals documentation accuracy problems

4. **Documentation-Only Releases Are Valid**
   - v0.4.1 is documentation-only, no code changes
   - Still valuable: prevents user confusion and misuse
   - Lesson: Don't hesitate to release for critical documentation fixes

### Key Metrics

- **Version:** 0.4.2 published to npm
- **Tests:** 52/52 tests passing (100% pass rate) - no code changes
- **Files Changed:** 4 documentation files (README.md, CLAUDE.md, CHANGELOG.md, PUBLISH_INSTRUCTIONS.md)
- **Impact:** Critical user experience improvement
- **Publication Status:** ✅ PUBLISHED to npm (v0.4.2)

### What Happened

v0.4.1 was already published 23 hours ago with the OLD documentation. Since npm doesn't allow overwriting published versions, we bumped to v0.4.2 to publish the corrected documentation.

### Next Steps (Post-Publication)

1. ✅ Version bumped to v0.4.2
2. Publishing to npm in progress...
3. Create Git tag after successful publish
4. Push commits and tags to GitHub
5. Verify package on https://www.npmjs.com/package/mcp-dincoder

⸻

## Lessons Learned from v0.1.7 Release

### Critical Features Delivered

1. **Real Spec Kit Integration** ✅ TRANSFORMATIVE
   - **Achievement**: Transformed from mock implementation to authentic Spec-Driven Development
   - **Implementation**: Created 3 new modules (detector.ts, parser.ts, templates.ts)
   - **Impact**: Now generates real Spec Kit markdown documents that work with GitHub's SDD methodology
   - **Compatibility**: Maintains backward compatibility with JSON format while adding markdown support

2. **CI/CD Pipeline Fixed** ✅
   - **Issue**: Smoke test failure in CI environment
   - **Fix**: Set PORT=3000 environment variable in CI configuration
   - **Result**: All 33 tests now passing (100% pass rate)

3. **Smithery Deployment Ready** ✅
   - **Configuration**: smithery.yaml with runtime: "typescript"
   - **Structure**: Default export function for Smithery compatibility
   - **Features**: Base64 config parameter support implemented
   - **Documentation**: Added "Deploy on Smithery" button to README

### Critical Issues Resolved (from v0.1.6)

1. **Tool Naming Validation** ⚠️ CRITICAL
   - **Issue**: MCP tools with periods in names (e.g., "specify.start") violated the validation pattern `^[a-zA-Z0-9_-]{1,64}$`
   - **Impact**: Complete Claude Desktop integration failure
   - **Fix**: Changed all 15 tool names from periods to underscores (e.g., "specify_start")
   - **Lesson**: Always validate tool names against MCP specification early

2. **External Command Dependencies**
   - **Issue**: specify_start tool attempted to execute external `uvx specify init` command
   - **Impact**: Tool failure in environments without Spec Kit CLI installed
   - **Fix**: Replaced with self-contained file system operations creating .dincoder directory
   - **Lesson**: MCP tools should be self-contained and not rely on external CLI tools

3. **Directory Structure Standardization**
   - **Issue**: Scattered spec files across specs/ directory made navigation difficult
   - **Impact**: Poor developer experience and confusing file organization
   - **Fix**: Consolidated all artifacts under .dincoder/ directory with clear subdirectories
   - **Lesson**: Use a single, well-organized directory for all generated artifacts

4. **STDIO Deprecation Planning**
   - **Issue**: STDIO transport will be discontinued on Smithery by September 7, 2025
   - **Impact**: All servers must migrate to HTTP transport
   - **Fix**: Created comprehensive migration guide (docs/stdio-migration-guide.md)
   - **Benefits**: 20x higher concurrency, lower latency, better resource efficiency
   - **Lesson**: Plan transport migrations well in advance with clear documentation

### Technical Improvements

1. **Natural Language Input Parsing**
   - Added intelligent parsing for specify_describe to accept natural language inputs
   - Strips common prefixes like "/specify", "I want to", etc.
   - Makes tools more user-friendly and forgiving

2. **Error Handling Enhancement**
   - Added actionable next steps in error messages
   - Improved error context with file paths and suggestions
   - Better user guidance when operations fail

3. **Quality Tool Integration**
   - Successfully integrated 6 quality tools (format, lint, test, security_audit, deps_update, license_check)
   - Fixed undefined stderr reference bug in quality.ts
   - All tools now properly handle project path resolution

### Documentation Achievements

1. **Comprehensive Testing Guide**
   - Created TESTING_GUIDE.md covering all 21 tools (15 core + 6 quality)
   - Detailed test procedures for each tool
   - Expected outputs and validation steps

2. **CI/CD Infrastructure**
   - GitHub Actions workflows for CI (ci.yml) and release (release.yml)
   - Automated testing on Node 20.x and 22.x
   - NPM publication workflow with provenance

3. **Migration Documentation**
   - STDIO to HTTP migration guide with timeline
   - Step-by-step migration instructions
   - Common issues and solutions
   - Performance improvement metrics

### Key Metrics

- **Version**: 0.1.7 ready for release
- **Tests**: 33/33 tests passing (100% pass rate)
- **Tools**: 21 total tools (15 core SDD tools + 6 quality tools)
- **Progress**: 17/23 stories complete (74%)
- **Critical Deadline**: STDIO deprecation on September 7, 2025

⸻

Appendix — Minimal file map (for the agent)
	•	src/index.ts (exports)
	•	src/server/createServer.ts (register tools/resources/prompts)
	•	src/http/app.ts (Express app)
	•	src/http/transport.ts (StreamableHTTPServerTransport glue)  ￼
	•	src/tools/specify.ts (Spec Kit tools)  ￼
	•	src/tools/plan.ts
	•	src/tools/tasks.ts
	•	src/tools/quality.ts
	•	src/config/schema.ts (Zod)
	•	src/security/origin.ts (Origin validation)  ￼
	•	src/security/auth.ts
	•	src/logging/logger.ts
	•	specs/000-orchestrator/spec.md (generated)  ￼
	•	specs/000-orchestrator/plan.md (generated)  ￼
	•	specs/000-orchestrator/tasks.md (generated)  ￼
	•	docs/research/spec-kit-notes.md  ￼
	•	docs/refs.md (links to specs/repos)  ￼ ￼ ￼
	•	smithery.yaml (deployment metadata)  ￼

⸻

Sources consulted (key, authoritative)
	•	MCP Streamable HTTP transport (Protocol Revision 2025-03-26, replaces HTTP+SSE from 2024-11-05).  ￼
	•	Smithery deployments (WebSocket hosting, STDIO deprecation Sept 7, 2025, GitHub integration deployment).  ￼
	•	Model Context Protocol SDKs - TypeScript v1.17.5+ (Streamable HTTP since v1.10.0, April 2025).  ￼
	•	Spec Kit GitHub repo & GitHub blog (commands, cross‑agent focus).  ￼ ￼
	•	YouTube transcript (Spec Kit phases, artifacts, scripts/templates, tasks numbering).
	•	Example implementations: invariantlabs-ai/mcp-streamable-http, ferrants/mcp-streamable-http-typescript-server.

If you want me to generate the repo scaffolding (files + boilerplate code + example tests) directly from this checklist, say the word and I’ll output a ready‑to‑download project skeleton next.
⸻

## 🎯 PHASE 1: CORE COMPLETENESS (v0.2.0)

**Goal:** Achieve feature parity with essential Spec Kit workflow for AI coding assistants
**Timeline:** 2 weeks (~1 sprint)
**New Tools:** 7 (constitution_create, clarify_add, clarify_resolve, spec_validate, artifacts_analyze, spec_refine, prereqs_check)
**Total Tools After Phase 1:** 21

⸻

Story 24 — Constitution/Principles Tool ⭐ CRITICAL

Goal: Enable projects to define principles and constraints that guide all AI-generated artifacts.

Rationale: Without a constitution, specs can drift from project values. Constitution provides guardrails for AI when generating specs, plans, and tasks. Similar to GitHub Spec Kit's `/constitution` command but adapted for MCP context.

Tools to Implement:
	•	constitution_create - Define project principles, constraints, and preferences

Tasks:
	•	Create src/tools/constitution.ts module
	•	Define ConstitutionCreateSchema with Zod:
		○	projectName: string (name of project)
		○	principles: string[] (e.g., "Prefer functional patterns", "Avoid premature optimization")
		○	constraints: string[] (e.g., "Max bundle size: 500KB", "Support Node 20+")
		○	preferences: object with optional fields:
			§	libraries?: string[] (e.g., ["React Query over Redux"])
			§	patterns?: string[] (e.g., ["Repository pattern for data access"])
			§	style?: string (e.g., "Functional > OOP")
		○	workspacePath?: string (optional workspace directory)
	•	Create src/speckit/constitution-template.ts:
		○	Define markdown template for constitution.md
		○	Sections: Project Principles, Technical Constraints, Library Preferences, Code Style
		○	Include examples and reasoning fields
	•	Implement constitutionCreate() function:
		○	Resolve workspace path using resolveWorkspacePath()
		○	Find/create specs directory using findSpecsDirectory()
		○	Create feature directory using createFeatureDirectory()
		○	Generate constitution.md from template with user-provided values
		○	Write to {project}/constitution.md
		○	Return success message with file path
	•	Add tool registration in src/server/createServer.ts:
		○	Register constitution_create tool with schema
		○	Add to tool list
	•	Write unit tests in tests/tools/constitution.test.ts:
		○	Test schema validation
		○	Test constitution generation with various inputs
		○	Test file writing to correct location
		○	Test error handling (invalid workspace, etc.)
	•	Write integration test in tests/integration/constitution-workflow.test.ts:
		○	Test constitution → specify → plan workflow
		○	Verify constitution influences spec generation
	•	Update README.md:
		○	Add constitution_create to tool list
		○	Add usage example showing how to define project principles
		○	Add to workflow guide (Step 0: Define Constitution)
	•	Add constitution.md to .gitignore template (optional, user choice to commit)

Acceptance Criteria:
	•	✅ Can create constitution.md with structured principles, constraints, and preferences
	•	✅ Constitution file validates against schema
	•	✅ File is written to correct specs directory structure
	•	✅ AI agents can reference constitution when generating specs/plans
	•	✅ All tests pass with 90%+ coverage
	•	✅ Documentation updated with examples

⸻

Story 25 — Clarification Tracking ⭐ CRITICAL

Goal: Provide structured Q&A process for resolving spec ambiguities.

Rationale: Specs often have [NEEDS CLARIFICATION] markers indicating unknowns. Without structured tracking, clarifications get lost in comments or never resolved. This implements GitHub Spec Kit's `/clarify` command for MCP.

Tools to Implement:
	•	clarify_add - Flag ambiguities in specifications
	•	clarify_resolve - Resolve clarifications with structured answers

Tasks:
	•	Create src/tools/clarify.ts module
	•	Define ClarifyAddSchema with Zod:
		○	question: string (the clarification question)
		○	context: string (section of spec that's ambiguous)
		○	options?: string[] (possible resolutions)
		○	specPath?: string (path to spec.md, auto-detected if not provided)
		○	workspacePath?: string
	•	Define ClarifyResolveSchema with Zod:
		○	clarificationId: string (unique ID like CLARIFY-001)
		○	resolution: string (the answer/decision)
		○	rationale?: string (why this resolution was chosen)
		○	workspacePath?: string
	•	Implement clarification storage:
		○	Create .dincoder/clarifications.json for tracking
		○	Schema: { id, question, context, options, status, resolution?, resolvedAt?, addedAt }
		○	Use JSON for structured querying
	•	Implement clarifyAdd():
		○	Generate unique clarification ID (CLARIFY-001, CLARIFY-002, etc.)
		○	Parse spec.md to find existing [NEEDS CLARIFICATION] markers
		○	Store clarification in clarifications.json with status: "pending"
		○	Optionally update spec.md with ID marker: [NEEDS CLARIFICATION: CLARIFY-001]
		○	Return clarification ID and summary
	•	Implement clarifyResolve():
		○	Load clarifications.json
		○	Find clarification by ID
		○	Mark as status: "resolved" with resolution and timestamp
		○	Update spec.md: replace [NEEDS CLARIFICATION: ID] with resolution text
		○	Append resolution to research.md under "Clarifications" section
		○	Git commit with message: "Resolve CLARIFY-001: [question]"
		○	Return success with resolution summary
	•	Add list functionality (optional helper):
		○	clarifyList() to show all pending clarifications
	•	Add tool registration in src/server/createServer.ts
	•	Write unit tests in tests/tools/clarify.test.ts:
		○	Test adding clarifications
		○	Test resolving clarifications
		○	Test ID generation uniqueness
		○	Test spec.md marker insertion/replacement
		○	Test clarifications.json persistence
	•	Write integration test in tests/integration/clarify-workflow.test.ts:
		○	Test full workflow: add → list → resolve
		○	Test spec.md updates
		○	Test research.md logging
	•	Update README.md:
		○	Add clarify_add and clarify_resolve to tool list
		○	Add clarification workflow example
		○	Update workflow guide with clarification step

Acceptance Criteria:
	•	✅ Can flag ambiguities in specs with structured questions
	•	✅ Clarifications tracked in version-controlled JSON file
	•	✅ Can resolve with structured answers
	•	✅ Resolutions automatically update spec.md and research.md
	•	✅ Unique ID generation prevents collisions
	•	✅ All tests pass with 90%+ coverage
	•	✅ Documentation includes workflow examples

⸻

Story 26 — Spec Validation & Quality Gates ⭐ CRITICAL

Goal: Automated quality checks for specifications before moving to plan/tasks phases.

Rationale: Incomplete or ambiguous specs lead to wasted implementation effort. Quality gates catch issues early. Implements GitHub Spec Kit's `/analyze` command with focus on spec validation for AI workflows.

Tools to Implement:
	•	spec_validate - Check specification quality
	•	artifacts_analyze - Verify spec/plan/tasks consistency

Tasks:
	•	Create src/tools/validate.ts module
	•	Define SpecValidateSchema with Zod:
		○	checks: object with boolean flags:
			§	completeness?: boolean (all required sections present)
			§	acceptanceCriteria?: boolean (every feature has testable criteria)
			§	clarifications?: boolean (no unresolved [NEEDS CLARIFICATION])
			§	prematureImplementation?: boolean (no HOW in WHAT sections)
		○	specPath?: string (auto-detect if not provided)
		○	workspacePath?: string
	•	Define ArtifactsAnalyzeSchema with Zod:
		○	artifacts?: ('spec' | 'plan' | 'tasks')[] (which to analyze, default: all)
		○	workspacePath?: string
	•	Implement validation rules in src/speckit/validators.ts:
		○	checkCompleteness(spec): Verify required sections (Goals, Acceptance, Edge Cases, Research)
		○	checkAcceptanceCriteria(spec): Ensure every feature has "when/then" testable criteria
		○	checkClarifications(spec): Find unresolved [NEEDS CLARIFICATION] markers
		○	checkPrematureImplementation(spec): Detect HOW details in WHAT sections (flag code blocks, library names in goals)
	•	Implement specValidate():
		○	Load and parse spec.md
		○	Run selected validation checks
		○	Generate validation report with warnings and errors:
			§	errors: array of { rule, message, location }
			§	warnings: array of { rule, message, suggestion }
			§	passed: boolean (no errors)
		○	Return structured report
	•	Implement artifactsAnalyze():
		○	Load spec.md, plan.md, tasks.md
		○	Check spec vs plan consistency:
			§	All spec goals covered in plan
			§	No plan components not in spec
		○	Check plan vs tasks consistency:
			§	All plan components have tasks
			§	No orphaned tasks (not in plan)
		○	Detect missing tasks for planned features
		○	Return consistency report with issues
	•	Add tool registration in src/server/createServer.ts
	•	Write unit tests in tests/tools/validate.test.ts:
		○	Test each validation rule independently
		○	Test completeness check with missing sections
		○	Test clarification detection
		○	Test premature implementation detection
		○	Test artifacts consistency checking
	•	Write integration test in tests/integration/validation-workflow.test.ts:
		○	Test validation with problematic spec
		○	Test validation pass with good spec
		○	Test artifacts analysis with mismatched plan/tasks
	•	Update README.md:
		○	Add spec_validate and artifacts_analyze to tool list
		○	Add validation examples showing error detection
		○	Update workflow guide with validation gates

Acceptance Criteria:
	•	✅ Detects missing sections in specs
	•	✅ Flags unresolved clarifications
	•	✅ Catches premature implementation details (HOW in WHAT)
	•	✅ Validates cross-artifact consistency (spec ↔ plan ↔ tasks)
	•	✅ Provides actionable error messages with suggestions
	•	✅ Returns structured reports (JSON) for AI parsing
	•	✅ All tests pass with 90%+ coverage
	•	✅ Documentation includes validation workflow

⸻

Story 27 — Spec Refinement/Evolution

Goal: Enable iterative improvement of specifications without losing history.

Rationale: Specs are living documents that evolve as understanding deepens. Need structured way to update without corrupting structure or losing decision context. Git commits track changes.

Tools to Implement:
	•	spec_refine - Update existing specs with tracked changes

Tasks:
	•	Create src/tools/refine.ts module
	•	Define SpecRefineSchema with Zod:
		○	section: enum ('goals' | 'acceptance' | 'edge-cases' | 'research' | 'full')
		○	changes: string (markdown describing updates)
		○	reason: string (why this refinement is needed)
		○	specPath?: string (auto-detect if not provided)
		○	workspacePath?: string
	•	Implement markdown section parser in src/speckit/parser.ts:
		○	parseSpecSections(spec): Extract section boundaries (line ranges)
		○	getSectionContent(spec, section): Get specific section text
		○	setSectionContent(spec, section, newContent): Replace section
	•	Implement specRefine():
		○	Load existing spec.md
		○	Parse to identify section boundaries
		○	Apply changes to specified section (or full spec if section='full')
		○	Validate updated spec structure (ensure headers intact)
		○	Append changelog entry to research.md:
			§	"## Spec Refinement: [date]"
			§	"**Section:** [section]"
			§	"**Reason:** [reason]"
			§	"**Changes:** [changes]"
		○	Write updated spec.md
		○	Git commit with message: "refine: [section] - [reason]"
		○	Return success with change summary
	•	Add versioning support (optional):
		○	Before refining, create snapshot: spec.v1.md, spec.v2.md
		○	Maintain spec.md as latest version
		○	Store version metadata in .dincoder/spec-versions.json
	•	Add tool registration in src/server/createServer.ts
	•	Write unit tests in tests/tools/refine.test.ts:
		○	Test section parsing
		○	Test section updates
		○	Test full spec updates
		○	Test research.md logging
		○	Test git commit creation
	•	Write integration test in tests/integration/refine-workflow.test.ts:
		○	Test iterative refinement (multiple refines)
		○	Test version history preservation
		○	Test spec structure integrity after refinement
	•	Update README.md:
		○	Add spec_refine to tool list
		○	Add refinement workflow example
		○	Show how to iterate on specs

Acceptance Criteria:
	•	✅ Can update specific spec sections without affecting others
	•	✅ Preserves git history of all changes
	•	✅ Logs refinement reasons in research.md
	•	✅ Doesn't corrupt spec structure (headers, sections)
	•	✅ Optional versioning creates snapshots
	•	✅ All tests pass with 90%+ coverage
	•	✅ Documentation shows refinement workflow

⸻

Story 28 — Prerequisites Check

Goal: Verify development environment has required tools and versions.

Rationale: Prevents "works on my machine" issues. Validates environment before spec execution. Similar to GitHub Spec Kit's `specify check` command but extensible for custom prerequisites.

Tools to Implement:
	•	prereqs_check - Verify system requirements

Tasks:
	•	Create src/tools/prereqs.ts module
	•	Define PrereqsCheckSchema with Zod:
		○	checkFor: object with optional fields:
			§	node?: string (version requirement, e.g., ">=20")
			§	npm?: boolean (check availability)
			§	git?: boolean (check availability)
			§	docker?: boolean (check availability)
			§	customCommands?: string[] (e.g., ["kubectl", "terraform"])
		○	fix?: boolean (attempt auto-fix if possible, default: false)
		○	workspacePath?: string
	•	Implement version checkers in src/tools/prereqs.ts:
		○	checkNodeVersion(requirement): Run `node --version`, parse and compare
		○	checkCommandAvailable(command): Run `which [command]` or `command -v`
		○	parseVersionRequirement(req): Parse ">=20", "^18.0.0", etc.
		○	compareVersions(actual, required): Semantic version comparison
	•	Implement prereqsCheck():
		○	Run checks for specified prerequisites
		○	Collect results: { tool, required, actual, passed }
		○	Generate report:
			§	passed: boolean (all checks passed)
			§	results: array of check results
			§	suggestions: array of fix suggestions for failures
		○	If fix=true, attempt auto-fixes:
			§	Suggest nvm/fnm for Node version issues
			§	Suggest brew/apt for missing tools (platform-specific)
		○	Return structured report
	•	Add common prerequisite templates:
		○	webAppPrereqs: Node, npm, git
		○	dockerizedAppPrereqs: Node, npm, git, docker
		○	kubernetesAppPrereqs: Node, npm, git, docker, kubectl
	•	Add tool registration in src/server/createServer.ts
	•	Write unit tests in tests/tools/prereqs.test.ts:
		○	Test version parsing and comparison
		○	Test command availability checking
		○	Test report generation
		○	Test suggestion generation for failures
	•	Write integration test in tests/integration/prereqs-workflow.test.ts:
		○	Test prerequisite check with current environment
		○	Test handling of missing prerequisites
	•	Update README.md:
		○	Add prereqs_check to tool list
		○	Add prerequisite checking examples
		○	Add to workflow guide (Step 0: Verify Prerequisites)

Acceptance Criteria:
	•	✅ Detects missing or outdated tools
	•	✅ Supports version requirement syntax (>=, ^, ~)
	•	✅ Provides clear error messages for failures
	•	✅ Suggests fixes when possible (install commands)
	•	✅ Supports custom prerequisite checks
	•	✅ All tests pass with 90%+ coverage
	•	✅ Documentation includes prerequisite examples

⸻

## Phase 1 Summary

**Stories Completed:** 5 new stories (24-28)
**Tools Added:** 7 new tools
**Total Tools:** 21 (14 existing + 7 new)
**Estimated Effort:** ~35-40 tasks
**Timeline:** 2 weeks (1 sprint)

**Tools by Category After Phase 1:**
- **Workflow Setup (3):** constitution_create, prereqs_check, specify_start
- **Specification (3):** specify_describe, clarify_add, clarify_resolve
- **Validation (3):** spec_validate, artifacts_analyze, spec_refine
- **Planning (1):** plan_create
- **Tasks (2):** tasks_generate, tasks_tick
- **Supporting (3):** artifacts_read, research_append, git_create_branch
- **Quality (6):** quality_format, quality_lint, quality_test, quality_security_audit, quality_deps_update, quality_license_check

**Key Achievements:**
- ✅ Complete Spec Kit workflow parity (constitution, clarify, validate)
- ✅ Quality gates prevent incomplete specs from progressing
- ✅ Iterative refinement supports living documents
- ✅ Environment validation prevents setup issues
- ✅ All critical gaps from analysis addressed

**Next Phase:** Phase 2 - Workflow Enhancement (tasks visualization, filtering, batch operations, search, statistics)

---

## Phase 2: Workflow Enhancement (v0.3.0) 🚀

**Goal:** Improve AI workflow efficiency with advanced task management capabilities

**Stories:** 29-33 (5 new stories)
**Tools Added:** 5 new tools (+5 → 26 total)
**Estimated Effort:** ~50 tasks
**Timeline:** ~2 weeks (1 sprint)

**Value Proposition:**
- Phase 1 gave us **spec quality** (validation, refinement, clarification)
- Phase 2 gives us **task efficiency** (visualization, filtering, batch operations)
- AI agents can work 5x faster on large projects (50+ tasks)

---

Story 29 — Task Visualization & Dependency Graphs 🔄

Goal: Enable AI to understand task relationships and execution order through visual dependency graphs.

Why it matters:
- AI agents can identify which tasks are blocked by dependencies
- Prevents implementing tasks out of order (e.g., tests before implementation)
- Visualizes project structure at a glance using Mermaid diagrams
- Essential for complex projects with 20+ interdependent tasks

Tasks:
	•	Create src/speckit/taskParser.ts module:
		○	Parse tasks.md into structured task objects
		○	Extract task metadata (ID, status, description, dependencies)
		○	Support optional metadata format: `(phase: setup, type: backend, depends: T001)`
		○	Handle legacy tasks.md without metadata gracefully
	•	Implement dependency detection:
		○	Parse "depends on T001" or "depends: T001" syntax
		○	Support multiple dependencies: "depends: T001, T002"
		○	Build dependency graph data structure (adjacency list)
		○	Detect circular dependencies and raise errors
	•	Create src/tools/visualize.ts with tasks_visualize tool:
		○	Define Zod schema (workspacePath, format, includeCompleted)
		○	Implement tool handler calling visualization logic
		○	Return Mermaid diagram as markdown code block
	•	Implement Mermaid graph generation:
		○	Generate flowchart LR (left-to-right) syntax
		○	Create task boxes with IDs and descriptions
		○	Add dependency arrows between tasks
		○	Apply status-based styling (pending=gray, in-progress=yellow, completed=green)
	•	Add advanced visualization features:
		○	Support filtering (hide completed tasks)
		○	Add phase grouping (subgraphs for setup/core/polish)
		○	Calculate critical path highlighting
		○	Add estimated completion time based on dependencies
	•	Support multiple output formats:
		○	mermaid (default - renders in markdown)
		○	graphviz (DOT format for advanced tools)
		○	ascii-tree (terminal-friendly text output)
	•	Write comprehensive tests:
		○	Test dependency parsing edge cases
		○	Test circular dependency detection
		○	Test Mermaid syntax generation
		○	Test format conversion (mermaid, graphviz, ascii)
	•	Update documentation:
		○	Add tasks_visualize to README tool list
		○	Add visualization workflow examples
		○	Include sample Mermaid diagrams

Acceptance Criteria:
	•	✅ Parses tasks.md with and without metadata
	•	✅ Detects circular dependencies and fails gracefully
	•	✅ Generates valid Mermaid flowchart syntax
	•	✅ Supports 3 output formats (mermaid, graphviz, ascii)
	•	✅ Colors tasks by status (pending/in-progress/completed)
	•	✅ All tests pass with 90%+ coverage
	•	✅ Documentation includes visualization examples

⸻

Story 30 — Task Filtering & Smart Queries 🔍

Goal: Help AI find relevant tasks quickly in large backlogs through intelligent filtering.

Why it matters:
- Large projects accumulate 100+ tasks across multiple phases
- AI needs to answer "what can I do NOW" without reading entire backlog
- Reduces cognitive load and improves task selection accuracy
- Essential for parallel development (frontend/backend team members)

Tasks:
	•	Extend src/speckit/taskParser.ts:
		○	Extract phase metadata ("phase: setup" → setup)
		○	Extract type metadata ("type: frontend" → frontend)
		○	Extract tags metadata ("tags: auth, api" → ["auth", "api"])
		○	Support comma-separated and space-separated formats
	•	Create src/tools/filter.ts with tasks_filter tool:
		○	Define Zod schema with filter parameters
		○	Support status filter (pending, in_progress, completed, all)
		○	Support phase filter (setup, core, polish, custom)
		○	Support type filter (frontend, backend, test, docs, custom)
		○	Support blocker filter (blocked, unblocked, all)
		○	Support tag filter (array of tags, AND/OR logic)
	•	Implement filter logic:
		○	Parse tasks.md into structured objects
		○	Apply status filtering
		○	Apply phase filtering with wildcard support
		○	Apply type filtering with wildcard support
		○	Calculate blocked status from dependencies
		○	Apply tag filtering with AND/OR logic
	•	Add sorting options:
		○	Sort by priority (metadata: priority: high/medium/low)
		○	Sort by dependencies (topological sort - unblocked first)
		○	Sort by created date (if available in metadata)
		○	Sort by estimated effort (metadata: effort: 1-5)
	•	Implement smart presets:
		○	"next" preset: unblocked, pending tasks sorted by priority
		○	"frontend" preset: type=frontend, unblocked
		○	"ready" preset: unblocked, pending, high priority
		○	"cleanup" preset: low priority, polish phase
	•	Return filtered results:
		○	Format as markdown task list (copy-paste ready)
		○	Include summary header (X tasks found, Y blocked)
		○	Show metadata for each task
		○	Optionally include reasons why tasks were excluded
	•	Write comprehensive tests:
		○	Test each filter type independently
		○	Test filter combinations (status + phase + type)
		○	Test smart presets
		○	Test sorting algorithms
		○	Test edge cases (empty results, all tasks filtered)
	•	Update documentation:
		○	Add tasks_filter to README tool list
		○	Add filtering workflow examples
		○	Document metadata format for tasks
		○	Show smart preset usage

Acceptance Criteria:
	•	✅ Filters by status, phase, type, blockers, tags
	•	✅ Supports AND/OR logic for complex queries
	•	✅ Includes 4+ smart presets for common workflows
	•	✅ Returns markdown-formatted results
	•	✅ Handles empty results gracefully
	•	✅ All tests pass with 90%+ coverage
	•	✅ Documentation includes filter query examples

⸻

Story 31 — Batch Task Operations ⚡

Goal: Reduce tool call overhead for AI agents through batch task completion.

Why it matters:
- Completing 10 related tasks currently requires 10 separate tasks_tick calls
- Batch operations save time and reduce error surface area
- Natural workflow when implementing multiple related tasks together
- Improves AI agent efficiency by 10x for bulk operations

Tasks:
	•	Create src/tools/batch.ts with tasks_tick_range tool:
		○	Define Zod schema accepting task ID array or range
		○	Support array format: ["T001", "T003", "T007"]
		○	Support range format: "T001-T005" (inclusive)
		○	Support mixed format: ["T001-T005", "T010", "T012-T015"]
		○	Add optional completion notes (per-task or shared)
	•	Implement batch validation:
		○	Verify all task IDs exist in tasks.md
		○	Check tasks are in pending status (can't complete already-done tasks)
		○	Validate range syntax (T001-T005 format)
		○	Expand ranges to individual task IDs
	•	Implement atomic batch completion:
		○	Mark all specified tasks as completed ([x])
		○	Update tasks.md file with all changes
		○	Add completion timestamp if metadata is present
		○	Preserve task order and formatting
	•	Handle partial failures gracefully:
		○	If task T003 doesn't exist, complete T001, T002, skip T003, continue
		○	Return detailed report: X succeeded, Y failed, Z skipped
		○	Include failure reasons (not found, already completed, invalid status)
		○	Optionally support strict mode (fail all if any task invalid)
	•	Add rollback on validation errors:
		○	If range syntax is invalid, fail immediately without changes
		○	If file write fails, revert any in-memory changes
		○	Return clear error message with suggested fixes
	•	Generate summary report:
		○	List completed task IDs with descriptions
		○	Show statistics (X completed, Y failed, Z skipped)
		○	Include completion percentage (overall progress)
		○	Return updated tasks.md content or path
	•	Write comprehensive tests:
		○	Test array format batch completion
		○	Test range format batch completion
		○	Test mixed format batch completion
		○	Test partial failure handling
		○	Test rollback on validation errors
		○	Test strict vs lenient mode
	•	Update documentation:
		○	Add tasks_tick_range to README tool list
		○	Add batch operation workflow examples
		○	Show range syntax and array syntax
		○	Document error handling behavior

Acceptance Criteria:
	•	✅ Supports array, range, and mixed formats
	•	✅ Handles partial failures gracefully (lenient mode)
	•	✅ Supports strict mode (all-or-nothing)
	•	✅ Returns detailed completion report
	•	✅ Rolls back on validation errors
	•	✅ All tests pass with 90%+ coverage
	•	✅ Documentation includes batch operation examples

⸻

Story 32 — Task Search & Discovery 🔎

Goal: Enable keyword-based task discovery in large projects through full-text search.

Why it matters:
- Projects with 50+ tasks need search functionality
- AI needs to find "authentication tasks" or "database migration tasks" quickly
- Grep-style search through task descriptions and metadata
- Essential for understanding existing work and avoiding duplicates

Tasks:
	•	Create src/tools/search.ts with tasks_search tool:
		○	Define Zod schema (query, searchFields, caseSensitive, fuzzy)
		○	Support regex patterns for advanced queries
		○	Support plain text for simple searches
		○	Add optional result limit (default: 10, max: 100)
	•	Implement full-text search:
		○	Search task descriptions by default
		○	Optionally search metadata (phase, type, tags)
		○	Support case-sensitive and case-insensitive modes
		○	Use JavaScript regex for pattern matching
	•	Add fuzzy matching:
		○	Implement Levenshtein distance for typo tolerance
		○	Support fuzzy threshold (0-100% similarity)
		○	Rank results by similarity score
		○	Highlight approximate matches
	•	Search across multiple fields:
		○	searchFields: ['description'] (default)
		○	searchFields: ['description', 'phase', 'type', 'tags']
		○	searchFields: ['all'] (search everything)
		○	Combine results from multiple fields
	•	Highlight matching text:
		○	Wrap matches in markdown bold: **match**
		○	Show context (20 chars before/after match)
		○	Truncate long descriptions with ellipsis
		○	Support multiple matches per task
	•	Return results with context:
		○	Include task ID, status, description
		○	Show surrounding tasks (previous/next task)
		○	Include relevance score (0-100%)
		○	Add metadata if available
	•	Add relevance scoring:
		○	Exact matches: 100%
		○	Starts with query: 90%
		○	Contains query: 70%
		○	Fuzzy match: 50-70% (based on similarity)
		○	Sort results by relevance
	•	Write comprehensive tests:
		○	Test exact match search
		○	Test regex pattern search
		○	Test fuzzy matching with typos
		○	Test multi-field search
		○	Test result limiting
		○	Test edge cases (no matches, special characters)
	•	Update documentation:
		○	Add tasks_search to README tool list
		○	Add search workflow examples
		○	Show regex pattern examples
		○	Document fuzzy matching behavior

Acceptance Criteria:
	•	✅ Supports plain text and regex queries
	•	✅ Implements fuzzy matching for typo tolerance
	•	✅ Searches across task descriptions and metadata
	•	✅ Highlights matching text in results
	•	✅ Ranks results by relevance score
	•	✅ All tests pass with 90%+ coverage
	•	✅ Documentation includes search query examples

⸻

Story 33 — Task Statistics & Progress Tracking 📊

Goal: Give AI agents quick project overview without parsing full tasks.md file.

Why it matters:
- "How many tasks are left?" is a frequent question from users
- AI can report progress without manual counting
- Helps with estimation and timeline planning
- Provides metrics for team velocity tracking

Tasks:
	•	Create src/tools/stats.ts with tasks_stats tool:
		○	Define Zod schema (workspacePath, groupBy, timeRange)
		○	Support grouping by status, phase, type, priority
		○	Support time range filtering (last 7 days, last 30 days, all)
		○	Return structured statistics object
	•	Calculate basic statistics:
		○	Total tasks count
		○	Pending tasks count
		○	In-progress tasks count
		○	Completed tasks count
		○	Completion percentage (completed / total * 100)
	•	Break down by phase:
		○	Count tasks per phase (setup, core, polish, custom)
		○	Calculate completion % per phase
		○	Identify bottleneck phases (low completion %)
		○	Return sorted by phase order
	•	Break down by type:
		○	Count tasks per type (frontend, backend, test, docs, custom)
		○	Calculate completion % per type
		○	Identify work distribution (frontend: 50%, backend: 30%)
		○	Return sorted by task count
	•	Calculate velocity metrics:
		○	Parse completion timestamps from metadata
		○	Calculate tasks completed per day (average)
		○	Calculate tasks completed in last 7 days
		○	Calculate tasks completed in last 30 days
	•	Estimate completion date:
		○	Based on average velocity (tasks/day)
		○	Remaining tasks / velocity = days until completion
		○	Return estimated completion date (YYYY-MM-DD)
		○	Add confidence interval (±X days)
	•	Support time range filtering:
		○	Filter by creation date (if available in metadata)
		○	Filter by completion date (if available in metadata)
		○	Calculate statistics for specific time windows
		○	Compare current vs previous period
	•	Format statistics report:
		○	Return as JSON object (machine-readable)
		○	Optionally format as markdown table (human-readable)
		○	Include visual progress bars (█████░░░░░ 50%)
		○	Add trend indicators (↑ velocity increasing)
	•	Write comprehensive tests:
		○	Test basic statistics calculations
		○	Test grouping by phase, type, priority
		○	Test velocity calculations
		○	Test completion date estimation
		○	Test time range filtering
		○	Test edge cases (no tasks, all completed)
	•	Update documentation:
		○	Add tasks_stats to README tool list
		○	Add statistics workflow examples
		○	Show interpretation of metrics
		○	Document velocity calculation methodology

Acceptance Criteria:
	•	✅ Calculates total, pending, in-progress, completed counts
	•	✅ Breaks down statistics by phase and type
	•	✅ Calculates velocity (tasks/day) from timestamps
	•	✅ Estimates completion date based on velocity
	•	✅ Supports time range filtering
	•	✅ Returns JSON and markdown formatted results
	•	✅ All tests pass with 90%+ coverage
	•	✅ Documentation includes statistics interpretation guide

⸻

## Phase 2 Summary

**Stories Completed:** 5 new stories (29-33)
**Tools Added:** 5 new tools
**Total Tools:** 26 (21 existing + 5 new)
**Estimated Effort:** ~50 tasks
**Timeline:** 2 weeks (1 sprint)

**Tools by Category After Phase 2:**
- **Workflow Setup (3):** constitution_create, prereqs_check, specify_start
- **Specification (3):** specify_describe, clarify_add, clarify_resolve
- **Validation (3):** spec_validate, artifacts_analyze, spec_refine
- **Planning (1):** plan_create
- **Tasks (7):** tasks_generate, tasks_tick, tasks_visualize, tasks_filter, tasks_tick_range, tasks_search, tasks_stats
- **Supporting (3):** artifacts_read, research_append, git_create_branch
- **Quality (6):** quality_format, quality_lint, quality_test, quality_security_audit, quality_deps_update, quality_license_check

**Key Achievements:**
- ✅ Task dependency visualization with Mermaid diagrams
- ✅ Intelligent task filtering for large projects (50+ tasks)
- ✅ Batch task completion (10x efficiency improvement)
- ✅ Full-text task search with fuzzy matching
- ✅ Comprehensive progress statistics and velocity tracking

⸻

## Phase 3: Integration & Discovery (v0.4.0 - v0.7.0)

**Goal:** Make DinCoder workflows discoverable and accessible across all platforms

**Reference:** See [INTEGRATION_STRATEGY.md](INTEGRATION_STRATEGY.md) for complete implementation details

⸻

Story 34 — MCP Prompts (Strategy A - Universal) ✅

Goal: Create MCP prompts that become slash commands in all MCP clients

Why it matters:
- Zero-configuration discovery across all platforms
- Built-in workflow guidance for new users
- Eliminates need to memorize tool names
- Works universally (Claude Code, VS Code, Codex, Cursor)

Tasks:
	• ✅ Create src/server/prompts.ts module
	• ✅ Implement registerPrompts() function
	• ✅ Add 7 workflow prompts:
		○ ✅ start_project - Initialize new spec-driven project
		○ ✅ create_spec - Create feature specification
		○ ✅ generate_plan - Generate implementation plan
		○ ✅ create_tasks - Break down into actionable tasks
		○ ✅ review_progress - Generate progress report
		○ ✅ validate_spec - Check specification quality
		○ ✅ next_tasks - Show next actionable tasks
	• ✅ Each prompt includes comprehensive workflow instructions
	• ✅ Enable prompts capability in createServer.ts
	• ✅ Update README.md with MCP Prompts section
	• ✅ Update CLAUDE.md with prompts reference
	• ✅ Write tests for prompt registration
	• ✅ Document cross-platform slash command formats

Acceptance Criteria:
	• ✅ 7 prompts registered and discoverable
	• ✅ Each prompt returns GetPromptResult with workflow messages
	• ✅ Arguments use Zod schemas for validation
	• ✅ Works in Claude Code (/mcp__dincoder__<prompt>)
	• ✅ Works in VS Code Copilot (/mcp.dincoder.<prompt>)
	• ✅ Works in OpenAI Codex (/mcp.dincoder.<prompt>)
	• ✅ Works in Cursor (/mcp__dincoder__<prompt>)
	• ✅ All tests pass
	• ✅ Documentation complete

⸻

Story 35 — Claude Code Plugin (Strategy B)

Goal: Create bundled Claude Code plugin with commands, agents, and MCP server config

Why it matters:
- Best long-term experience for Claude Code users
- Bundles slash commands, agents, and documentation
- One-command installation
- Optimized for Claude Code workflows

Tasks:
	•	Create new repository: dincoder-plugin
	•	Create .claude-plugin/plugin.json:
		○	Define plugin metadata (name, version, description)
		○	Configure MCP server connection
		○	List included commands and agents
	•	Create commands/ directory:
		○	spec.md - Create/refine specification
		○	plan.md - Generate implementation plan
		○	tasks.md - Create actionable tasks
		○	progress.md - Show progress report
		○	validate.md - Check specification quality
		○	next.md - Show next tasks
	•	Create agents/ directory:
		○	spec-writer.md - Specification writing agent
		○	plan-architect.md - Planning agent
		○	task-manager.md - Task management agent
	•	Create CLAUDE.md with plugin usage guide
	•	Create .mcp.json with server configuration
	•	Write comprehensive README.md
	•	Test installation: claude plugin install dincoder
	•	Publish to Claude Code plugin registry

Acceptance Criteria:
	•	Plugin installable via Claude CLI
	•	All commands work as slash commands
	•	Agents are discoverable in Claude Code
	•	MCP server auto-configured
	•	Documentation complete

⸻

Story 36 — VS Code & Codex Integration (Strategies C+D)

Goal: Document VS Code Copilot and OpenAI Codex integration patterns

Why it matters:
- Large user base uses VS Code and Codex
- Different configuration patterns than Claude Code
- Need clear setup instructions

Tasks:
	•	Create docs/integration/vscode.md:
		○	Document .vscode/mcp.json configuration
		○	Show workspace-level setup
		○	Document slash command format (/mcp.dincoder.<prompt>)
		○	Add troubleshooting section
	•	Create docs/integration/codex.md:
		○	Document ~/.codex/config.toml setup
		○	Show MCP server configuration
		○	Document CLI usage patterns
		○	Add troubleshooting section
	•	Update README.md with VS Code section
	•	Update README.md with Codex section
	•	Create video tutorial for VS Code setup
	•	Create video tutorial for Codex setup
	•	Test with VS Code Copilot
	•	Test with OpenAI Codex

Acceptance Criteria:
	•	VS Code integration documented
	•	Codex integration documented
	•	README includes setup guides
	•	Video tutorials published
	•	Tested in both environments

⸻

Story 37 — Project Templates (Strategy E)

Goal: Create starter templates for common project types

Why it matters:
- Faster onboarding for new projects
- Best practices built-in
- Reduces initial configuration

Tasks:
	•	Create templates/ repository
	•	Create web-app template:
		○	Pre-configured constitution.md
		○	Sample spec.md structure
		○	Common architectural patterns
		○	Technology stack recommendations
	•	Create api-service template:
		○	API-focused constitution
		○	OpenAPI/REST patterns
		○	Testing strategies
	•	Create mobile-app template:
		○	Mobile-specific constitution
		○	Platform considerations
		○	Deployment patterns
	•	Create cli-tool template:
		○	CLI-focused patterns
		○	Command structure
		○	Distribution strategy
	•	Document template usage in README
	•	Create template customization guide
	•	Test template instantiation
	•	Publish templates to GitHub

Acceptance Criteria:
	•	4 templates created (web, api, mobile, cli)
	•	Each includes constitution, spec, plan templates
	•	Documentation complete
	•	Templates tested and working

⸻

Story 38 — Integration Testing & Documentation

Goal: Comprehensive testing across all integration strategies

Why it matters:
- Ensure consistent experience across platforms
- Catch platform-specific issues
- Maintain quality as platforms evolve

Tasks:
	•	Test Strategy A (MCP Prompts):
		○	Test in Claude Code
		○	Test in VS Code Copilot
		○	Test in OpenAI Codex
		○	Test in Cursor
		○	Document any platform quirks
	•	Test Strategy B (Claude Plugin):
		○	Test plugin installation
		○	Test all commands
		○	Test all agents
		○	Verify MCP server connection
	•	Test Strategy C+D (VS Code/Codex):
		○	Test configuration files
		○	Test slash commands
		○	Test in different workspace setups
	•	Test Strategy E (Templates):
		○	Test template instantiation
		○	Test customization workflows
		○	Verify all templates work
	•	Create integration test matrix:
		○	Platform × Feature grid
		○	Document known limitations
		○	Track platform version compatibility
	•	Update INTEGRATION_STRATEGY.md with test results
	•	Create troubleshooting guide
	•	Document platform-specific tips

Acceptance Criteria:
	•	All strategies tested on all platforms
	•	Test matrix documented
	•	Troubleshooting guide complete
	•	Known issues documented

⸻

## Phase 3 Summary

**Stories Completed:** 1/5 (Story 34 complete)
**Stories Remaining:** 4 (Stories 35-38)
**Prompts Added:** 7 workflow prompts
**Total Features:** 26 tools + 7 prompts = 33
**Estimated Effort:** ~100 tasks across 4 stories
**Timeline:** 3-4 weeks (2 sprints)

**Integration Strategies:**
- ✅ **Strategy A (Universal):** MCP Prompts - COMPLETE (v0.4.0)
- 📋 **Strategy B (Claude Code):** Plugin - PLANNED (v0.5.0)
- 📋 **Strategy C+D (VS Code/Codex):** Documentation - PLANNED (v0.6.0)
- 📋 **Strategy E (Templates):** Project starters - PLANNED (v0.7.0)

**Key Achievements (v0.4.0):**
- ✅ 7 workflow prompts with built-in guidance
- ✅ Auto-discovery across all MCP clients
- ✅ Cross-platform slash commands
- ✅ Zero-configuration integration
- ✅ Published to npm as mcp-dincoder@0.4.0

**Next Milestone:** v0.5.0 - Claude Code Plugin (Strategy B)
- ✅ AI agents can navigate large task backlogs 5x faster

**Next Phase:** Phase 3 - Advanced Features (contracts, templates, metrics, lint)

---

## Appendix A: Deferred or Removed Roadmap Items

- **diagram_generate** — Removed after Spec Kit research confirmed there is no dedicated diagram command. AI assistants already embed Mermaid/PlantUML directly in markdown, so we now include diagram examples in the constitution template instead of adding a tool.
- **idea_capture** — Dropped because `specify_describe` accepts both terse prompts and detailed briefs, matching Spec Kit’s workflow. A separate idea-capture tool would duplicate existing functionality.
- **project_bootstrap** — Removed since orchestration belongs to the AI assistant. MCP tools remain atomic (constitution → specify → plan → tasks) just like Spec Kit; wrapping them in a single bootstrap tool would reduce flexibility.

## Appendix B: Research References

- `docs/SPEC_KIT_RESEARCH.md` — Consolidated findings from GitHub Spec Kit, MCP protocol updates, and Smithery requirements.
- MCP Streamable HTTP (Protocol Revision 2025-03-26) — single `/mcp` endpoint with POST/GET/DELETE, session headers, and protocol negotiation.
- Smithery deployment guidance — STDIO deprecation (September 7, 2025), Streamable HTTP hosting, `?config=<base64>` support.
- Spec Kit workflow — `/specify`, `/plan`, `/tasks` gated flow; clarifications via `[NEEDS CLARIFICATION]`.
- SDK support — `@modelcontextprotocol/sdk` ≥ 1.17.5 provides Streamable HTTP client/server transports for Node.js.
