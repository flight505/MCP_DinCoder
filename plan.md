Below is a very, very, very detailed project plan rendered as a markdown checklist. It is organized into "stories," each broken down into one‑story‑point tasks (every checkbox is small and independently completable by an autonomous coding agent). Where a task's rationale depends on external knowledge, I've cited the official MCP spec, Smithery docs, and GitHub Spec Kit materials; where a task is grounded in the uploaded YouTube transcript, I've cited the transcript.

Key external facts used here (with sources):
• Spec Kit provides /specify, /plan, /tasks commands and a standard gated flow (Specify → Plan → Tasks → Implement).  ￼  ￼
• MCP "Streamable HTTP" (Protocol Revision 2025-03-26) requires a single MCP endpoint supporting POST for JSON‑RPC and optional SSE streams, and GET for server‑to‑client SSE; includes session management via the Mcp-Session-Id header and protocol version header (MCP-Protocol-Version).  ￼
• Smithery is **deprecating STDIO support on September 7, 2025** - requires complete HTTP rewrite. Smithery uses WebSocket-based hosting and requires a /mcp endpoint that handles GET/POST/DELETE and optionally receives configuration via ?config=<base64>.  ￼
• Official TypeScript SDK (@modelcontextprotocol/sdk v1.17.5+) supports Streamable HTTP since v1.10.0 (April 2025), with built-in StreamableHTTPServerTransport class.  ￼
• Spec Kit works across GitHub Copilot, Claude Code, and Gemini CLI. Multiple MCP implementations exist for spec-driven development including spec-workflow-mcp.  ￼ ￼
• **CRITICAL UPDATE**: For stateless deployments, create new server/transport instances per request to avoid request ID collisions. For stateful deployments, use session management with UUID-based session IDs.

⸻

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

Story 3 — Adopt Spec‑Driven flow inside this project

Goal: Use Spec Kit itself to drive this build.

	•	Install Spec Kit (uvx ... specify) locally per README; verify /specify, /plan, /tasks presence.  ￼
	•	Run specify init spec-driven-mcp and choose Claude Code or Copilot as baseline agent (document which).  ￼
	•	Commit the generated scripts and templates directories; don’t modify yet.  ￼
	•	Create specs/000-orchestrator/spec.md via /specify: describe Spec‑Driven MCP Orchestrator (what/why, user journeys, outcomes).  ￼
	•	Ensure the spec contains acceptance scenarios, edge cases, and “needs clarification” blocks to capture unknowns.  ￼
	•	Gate: Review & sign off on the spec (no tech decisions yet).  ￼

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

Story 6 — Implement MCP server skeleton (Streamable HTTP)

Goal: Build a minimal but spec‑compliant server exposing a /mcp endpoint with POST/GET/DELETE.

	•	Create src/server/createServer.ts exporting a factory createServer() that wires tools/resources/prompts using the TS SDK.  ￼
	•	Create src/http/app.ts with an Express app.
	•	Add src/http/transport.ts that wraps StreamableHTTPServerTransport from the TS SDK.  ￼
	•	**CRITICAL**: For stateless mode, create new server/transport instances per request. For stateful mode, implement session map with UUID-based session IDs.
	•	Implement POST /mcp to accept one JSON‑RPC message per request and either SSE (for streamed responses) or JSON per MCP spec.  ￼
	•	Implement GET /mcp to open an SSE stream for server‑initiated messages; return 405 if not supported.  ￼
	•	Implement DELETE /mcp to end a session when Mcp-Session-Id header is provided (if server allows client‑initiated termination).  ￼
	•	Add Mcp-Session-Id issuance on initialization (use crypto.randomUUID()) and enforce header presence on subsequent calls (400 if absent).  ￼
	•	Return/accept MCP-Protocol-Version header; default to "2025-03-26" when absent (per spec guidance).  ￼
	•	Implement Origin checking and optional auth (bearer/API key) middleware.  ￼
	•	Add graceful shutdown (SIGINT/SIGTERM) to close transports. Use res.on('close') to cleanup per-request resources.
	•	Write unit tests for POST/GET/DELETE happy paths and error paths using vitest + supertest.
	•	Add SSE tests ensuring event framing (data: ...\n\n) correctness and stream close after response.  ￼
	•	**Error Handling**: Wrap all handlers in try-catch, log to stderr, return valid JSON-RPC error responses.
	•	Commit "feat(server): minimal MCP streamable HTTP endpoint".

⸻

Story 7 — Implement Spec‑Driven tools inside the MCP server

Goal: Expose tools that run Spec Kit phases and parse artifacts so any AI coder can drive SDD through MCP.

	•	Tool specify.start: inputs { projectName, agent }; runs specify init <projectName> --ai <agent>; returns path + summary.  ￼
	•	Tool specify.describe: inputs { description }; posts /specify <description> into agent session or CLI wrapper; returns generated spec path.  ￼
	•	Tool plan.create: inputs { constraintsText }; posts /plan ... to generate plan.md, data model, contracts; returns file paths.  ￼
	•	Tool tasks.generate: inputs { scope }; posts /tasks to produce tasks.md; returns structured task objects (id, title, deps).  ￼
	•	Tool tasks.tick: mark a task ID as done; persist in tasks.md (idempotent update).  ￼
	•	Tool artifacts.read: return normalized JSON for spec/plan/tasks for downstream UIs.
	•	Tool research.append: write to the Spec Kit research doc for decisions taken.  ￼
	•	Tool git.create_branch: create a working branch for a feature (Spec Kit may do this on init; mirror behavior).  ￼
	•	Add robust path sandboxing (only operate under a configured workspace directory).
	•	Add timeouts and resource limits when running CLI commands.

⸻

Story 8 — MCP tools for repo hygiene & quality

Goal: Ensure autonomous agents don’t degrade the codebase.

	•	Tool quality.format: run Prettier; return diff summary.
	•	Tool quality.lint: run ESLint; return problem list JSON.
	•	Tool quality.test: run vitest --run --coverage; return pass rate + coverage.
	•	Tool quality.security_audit: run npm audit --json; summarize vulnerabilities.
	•	Tool quality.deps_update: dry‑run minor updates (e.g., npm outdated summary).
	•	Tool quality.license_check: scan dependencies for license compatibility.

⸻

Story 9 — Validation & conformance to MCP spec

Goal: Prove we follow the letter of the spec.

	•	Add JSON‑RPC schema tests for requests/responses.  ￼
	•	Add tests for resumability using SSE id and Last-Event-ID headers (server may support replay).  ￼
	•	Add a test for rejecting invalid Origin.  ￼
	•	Add tests ensuring single endpoint path for POST/GET/DELETE (/mcp).  ￼
	•	Verify MCP‑Protocol‑Version negotiation is honored.  ￼
	•	Create docs/conformance.md summarizing checks with links to spec sections.  ￼

⸻

Story 10 — Configuration, security & ops

Goal: Make it safe to run remotely.

	•	Parse Smithery ?config=<base64> and map to internal config schema (Zod).  ￼
	•	Add CONFIG_ORIGIN_WHITELIST and validate on every request.  ￼
	•	Support API key auth via Authorization: Bearer <token> (optional).
	•	Integrate structured logging (pino); never leak secrets in logs.
	•	Health endpoint GET /healthz (non‑MCP) with build info.
	•	Rate limiting on /mcp (token bucket per IP/session).
	•	Add CORS controls (default deny; allow configured origins).
	•	Provide Dockerfile (node:22-alpine) with non‑root user.
	•	Add SECURITY.md listing threat model and mitigations (DNS rebinding, auth).  ￼

⸻

Story 11 — Developer ergonomics & examples

Goal: Smooth adoption.

	•	examples/local-client.ts: connect using SDK client to local /mcp (POST + SSE).  ￼
	•	examples/smithery-client.ts: connect to https://server.smithery.ai/<pkg>/mcp via StreamableHTTPClientTransport (include config).  ￼
	•	examples/spec-workflow.md: step‑by‑step “run Spec Kit through MCP tools” demo.  ￼
	•	Update README with quick start (local and Smithery) and FAQ.

⸻

Story 12 — Tests: unit, integration, smoke, and performance

Goal: High confidence, automated.

	•	Unit tests for every tool handler (valid/invalid inputs).
	•	Integration tests: start Express on ephemeral port; call POST/GET/DELETE; validate SSE.  ￼
	•	“Spec Kit path” tests: simulate specify/plan/tasks flow and verify artifacts are parsed.
	•	Smoke tests in CI: build → run → hit /healthz → basic POST roundtrip.
	•	Perf baseline: run autocannon at 50 rps on POST; ensure p95 < 150ms for trivial tool.
	•	Coverage gate: fail CI < 90% statements.

⸻

Story 13 — CI/CD & release automation

Goal: Every commit is validated; releases are easy.

	•	Add GitHub Actions: ci.yml (install, build, lint, test, coverage artifact).
	•	Add release.yml (manual) to publish to NPM on tag.
	•	Integrate Changesets or semantic‑release for semver bumps.
	•	Generate changelog and GitHub release notes.
	•	Cache ~/.npm and node_modules for faster CI.

⸻

Story 14 — Prepare for NPM publishing

Goal: Package is consumable by anyone.

	•	Ensure package.json has "name", "version", "main": "dist/index.js", "types": "dist/index.d.ts", keywords, repository, license.
	•	Create src/index.ts with public exports (createServer, tool registrars).
	•	Build with tsup to ESM (and, if desired, dual ESM/CJS); verify exports map.
	•	Add "files" whitelist (exclude test/source by default).
	•	Add README sections: install, usage, config, Smithery notes.  ￼
	•	Run npm pack and inspect tarball.
	•	Publish dry‑run (if configured) → npm publish.

⸻

Story 15 — Smithery integration & deployment

Goal: Make it live on Smithery and compatible with the platform.

	•	Create smithery.json with name, description, tags, tool examples, repository links per Smithery registry requirements.  ￼
	•	Add Dockerfile with exact build instructions for consistent container image (required for GitHub integration deployment).
	•	Ensure /mcp implements GET/POST/DELETE exactly per Smithery expectations.  ￼
	•	Ensure support for ?config=<base64> query param decoded and validated.  ￼
	•	**CRITICAL**: Ensure HTTP transport only - STDIO deprecated September 7, 2025.
	•	Use `npm create smithery` for initial scaffold if starting fresh.
	•	Add "Deploy on Smithery" instructions to README (GitHub integration method).  ￼
	•	Post‑deploy smoke test using Smithery's recommended client flow (Streamable HTTP client).  ￼
	•	Document API key usage where applicable (Smithery registry/SDK).  ￼

⸻

Story 16 — Migration path (if upgrading an existing STDIO server)

Goal: Provide a crisp path to Streamable HTTP (and optionally maintain compatibility).

	•	Capture current STDIO entrypoint and tool registrations; freeze a “before” tag.
	•	Create HTTP transport entry (/mcp) alongside STDIO temporarily; verify both work.  ￼
	•	Replace server bootstrap to not write to stdout (HTTP is fine; STDIO must not log on stdout).
	•	Remove legacy SSE transport if present and document backwards compatibility choices.  ￼
	•	Update docs for new connection instructions and note deprecation of STDIO hosting where applicable (per vendor communications).
	•	Remove STDIO once clients have migrated; cut major version; update Smithery deployment type.

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