# DinCoder Implementation Roadmap (Updated)

**Roadmap Version:** 2.0
**Date:** 2025-10-04
**Current Version:** v0.1.15
**Current Progress:** 17/23 Stories Complete (74%)

---

## Vision Statement

**DinCoder is a fully-fledged Spec-Driven Development MCP server optimized for AI coding assistants.**

Unlike GitHub's official Spec Kit (which targets human developers using CLI tools), DinCoder is purpose-built for AI agents like Claude Code, Cursor, and GitHub Copilot. It provides structured tools for the complete SDD lifecycle: Constitution → Specify → Clarify → Plan → Tasks → Implement → Validate.

---

## Current State vs Target State

### Current State (v0.1.15)
- ✅ Core workflow tools (5): specify, plan, tasks
- ✅ Quality tools (6): format, lint, test, security, deps, license
- ✅ Supporting tools (3): artifacts, research, git
- ✅ Real Spec Kit markdown generation
- ✅ Dual directory support (.dincoder/ and specs/)
- ✅ Full CI/CD with NPM publishing
- ⚠️ Missing 5 critical Spec Kit commands
- ⚠️ No validation or quality gates
- ⚠️ No visual diagrams
- ⚠️ No template customization

### Target State (v1.0.0)
- ✅ All essential Spec Kit commands
- ✅ Quality gates and validation
- ✅ Visual diagram generation
- ✅ Template customization
- ✅ Task dependency tracking
- ✅ Contract generation
- ✅ Complete observability
- ✅ Cross-agent tested
- ✅ Production-ready

---

## Roadmap Phases

## 🎯 Phase 1: Core Completeness (v0.2.0)

**Goal:** Achieve feature parity with essential Spec Kit workflow
**Timeline:** 1 sprint (~2 weeks)
**Stories:** 24-28 (5 new stories)

### Story 24: Constitution/Principles Tool ⭐ CRITICAL
**Why:** Project principles guide all AI-generated artifacts. Without this, specs can drift from project values.

**Tools to Implement:**
- `constitution_create` - Define project principles and constraints

**Tasks:**
1. Create `src/tools/constitution.ts`
2. Define ConstitutionCreateSchema with Zod:
   - `projectName: string`
   - `principles: string[]` (e.g., "Prefer functional patterns")
   - `constraints: string[]` (e.g., "Max bundle size: 500KB")
   - `preferences: { libraries?, patterns?, style? }`
3. Create `src/speckit/constitution-template.ts` with markdown template
4. Implement `constitutionCreate()` function:
   - Resolve workspace path
   - Find/create specs directory
   - Generate constitution.md from template
   - Write to `{project}/constitution.md`
5. Add tool registration in `src/server/createServer.ts`
6. Write unit tests for constitution generation
7. Write integration test for E2E workflow
8. Update README with constitution usage examples
9. Add constitution.md to .gitignore template

**Acceptance:**
- ✅ Can create constitution.md with structured principles
- ✅ Constitution file validates against schema
- ✅ AI can reference constitution when generating specs/plans
- ✅ Tests pass with 90%+ coverage

---

### Story 25: Clarification Tracking ⭐ CRITICAL
**Why:** Specs have ambiguities ([NEEDS CLARIFICATION] markers). Need structured Q&A process.

**Tools to Implement:**
- `clarify_add` - Flag ambiguities in specs
- `clarify_resolve` - Resolve clarifications with answers

**Tasks:**
1. Create `src/tools/clarify.ts`
2. Define schemas:
   - `ClarifyAddSchema`: `{ question, context, options?, specPath? }`
   - `ClarifyResolveSchema`: `{ clarificationId, resolution, rationale? }`
3. Implement clarification storage (JSON in `.dincoder/clarifications.json`)
4. Implement `clarifyAdd()`:
   - Parse spec.md to find [NEEDS CLARIFICATION] markers
   - Generate unique ID for clarification
   - Store in clarifications.json
   - Optionally update spec.md with ID marker
5. Implement `clarifyResolve()`:
   - Load clarifications.json
   - Mark clarification as resolved
   - Update spec.md with resolution
   - Archive in research.md
6. Add tool registration
7. Write unit tests for add/resolve flow
8. Write integration test for spec with clarifications
9. Update README with clarification workflow

**Acceptance:**
- ✅ Can flag ambiguities in specs
- ✅ Can resolve with structured answers
- ✅ Resolutions update spec.md automatically
- ✅ Clarifications tracked in version control
- ✅ Tests pass with 90%+ coverage

---

### Story 26: Spec Validation & Quality Gates ⭐ CRITICAL
**Why:** Need automated checks before moving to plan/tasks. Catches incomplete specs early.

**Tools to Implement:**
- `spec_validate` - Check specification quality
- `artifacts_analyze` - Verify spec/plan/tasks consistency

**Tasks:**
1. Create `src/tools/validate.ts`
2. Define `SpecValidateSchema`:
   - `checks: { completeness?, acceptanceCriteria?, clarifications?, prematureImplementation? }`
   - `specPath?: string`
3. Implement validation rules:
   - **Completeness:** All required sections present (Goals, Acceptance, Edge Cases)
   - **Acceptance Criteria:** Every feature has testable criteria
   - **Clarifications:** No unresolved [NEEDS CLARIFICATION] markers
   - **Premature Implementation:** No HOW details in WHAT sections
4. Implement `specValidate()`:
   - Parse spec.md
   - Run selected checks
   - Generate validation report (warnings + errors)
   - Return structured results
5. Implement `artifactsAnalyze()`:
   - Check spec.md vs plan.md consistency
   - Check plan.md vs tasks.md consistency
   - Detect orphaned tasks (not in plan)
   - Detect missing tasks (in plan but not tasks)
6. Add tool registration
7. Write unit tests for each validation rule
8. Write integration test for full validation suite
9. Update README with validation workflow

**Acceptance:**
- ✅ Detects missing sections in specs
- ✅ Flags unresolved clarifications
- ✅ Catches premature implementation details
- ✅ Validates cross-artifact consistency
- ✅ Provides actionable error messages
- ✅ Tests pass with 90%+ coverage

---

### Story 27: Spec Refinement/Evolution
**Why:** Specs are living documents. Need structured way to update without losing history.

**Tools to Implement:**
- `spec_refine` - Iteratively improve existing specs

**Tasks:**
1. Create `src/tools/refine.ts`
2. Define `SpecRefineSchema`:
   - `section: 'goals' | 'acceptance' | 'edge-cases' | 'research' | 'full'`
   - `changes: string` (markdown describing updates)
   - `reason: string` (why this refinement)
   - `specPath?: string`
3. Implement `specRefine()`:
   - Load existing spec.md
   - Parse to identify section boundaries
   - Apply changes to specified section
   - Append changelog entry to research.md
   - Write updated spec.md
   - Git commit with refinement reason
4. Add versioning support (optional):
   - Create `spec.v1.md`, `spec.v2.md` snapshots
   - Maintain `spec.md` as latest
5. Add tool registration
6. Write unit tests for section updates
7. Write integration test for refinement workflow
8. Update README with refinement examples

**Acceptance:**
- ✅ Can update specific spec sections
- ✅ Preserves git history of changes
- ✅ Logs refinement reasons in research.md
- ✅ Doesn't corrupt spec structure
- ✅ Tests pass with 90%+ coverage

---

### Story 28: Prerequisites Check
**Why:** Environment validation prevents "works on my machine" issues.

**Tools to Implement:**
- `prereqs_check` - Verify system requirements

**Tasks:**
1. Create `src/tools/prereqs.ts`
2. Define `PrereqsCheckSchema`:
   - `checkFor: { node?, npm?, git?, docker?, customCommands? }`
   - `fix?: boolean` (attempt auto-fix if possible)
3. Implement `prereqsCheck()`:
   - Check Node.js version (via `node --version`)
   - Check npm availability
   - Check git availability
   - Check custom commands (e.g., docker, kubectl)
   - Generate report with installed vs required
   - Optionally suggest fixes (e.g., "Install Node 20+")
4. Add tool registration
5. Write unit tests for version checks
6. Write integration test for missing prerequisites
7. Update README with prerequisites examples

**Acceptance:**
- ✅ Detects missing/outdated tools
- ✅ Provides clear error messages
- ✅ Suggests fixes when possible
- ✅ Supports custom prerequisite checks
- ✅ Tests pass with 90%+ coverage

---

**Phase 1 Summary:**
- **New Tools:** 7 (constitution_create, clarify_add, clarify_resolve, spec_validate, artifacts_analyze, spec_refine, prereqs_check)
- **Total Tools After Phase 1:** 21
- **Estimated Tasks:** ~35-40 tasks
- **Timeline:** 1 sprint (~2 weeks)

---

## 🚀 Phase 2: Workflow Enhancement (v0.3.0)

**Goal:** Improve AI coding workflow efficiency with task management and filtering
**Timeline:** 1 sprint (~2 weeks)
**Stories:** 29-31 (3 new stories)
**Note:** Removed diagram_generate and idea_capture (redundant based on Spec Kit research)

### Story 29: Task Dependency Visualization
**Why:** Visual task graphs help AI prioritize work and identify blockers.

**Tools to Implement:**
- `tasks_visualize` - Generate dependency graphs

**Tasks:**
1. Create `src/tools/visualize.ts`
2. Define `TasksVisualizeSchema`:
   - `format: 'mermaid' | 'dot' | 'json'`
   - `includeEstimates?: boolean`
   - `highlightCriticalPath?: boolean`
3. Implement task dependency parser:
   - Parse tasks.md to extract tasks and dependencies
   - Build dependency graph (adjacency list)
   - Detect cycles (error if found)
   - Calculate critical path (longest path)
4. Implement Mermaid generator:
   - Output `graph TD` format
   - Color-code by status (pending/in-progress/complete)
   - Highlight critical path in red
5. Implement DOT generator (optional):
   - Output Graphviz DOT format
6. Add tool registration
7. Write unit tests for graph generation
8. Write integration test with sample tasks
9. Update README with visualization examples

**Acceptance:**
- ✅ Generates valid Mermaid diagrams
- ✅ Correctly parses task dependencies
- ✅ Highlights critical path
- ✅ Detects circular dependencies
- ✅ Tests pass with 90%+ coverage

---

### Story 30: Task Filtering & Querying
**Why:** Large projects have 100+ tasks. Need to filter by phase/type/status.

**Tools to Implement:**
- `tasks_filter` - Query tasks by criteria
- `tasks_stats` - Get task statistics

**Tasks:**
1. Create `src/tools/filter.ts`
2. Define `TasksFilterSchema`:
   - `phase?: string` (e.g., "setup", "core", "polish")
   - `type?: string` (e.g., "frontend", "backend", "test")
   - `status?: 'pending' | 'in-progress' | 'complete'`
   - `assignee?: string` (optional)
3. Extend tasks.md schema to support metadata:
   - Add YAML frontmatter to each task
   - Example: `- [ ] T001: Task title {phase: setup, type: backend}`
4. Implement `tasksFilter()`:
   - Parse tasks.md with metadata
   - Apply filters
   - Return filtered task list
5. Implement `tasksStats()`:
   - Count tasks by status
   - Count tasks by phase/type
   - Calculate completion percentage
6. Add tool registration
7. Write unit tests for filtering logic
8. Write integration test with multi-phase project
9. Update README with filter examples

**Acceptance:**
- ✅ Can filter tasks by phase/type/status
- ✅ Supports compound filters (AND logic)
- ✅ Returns statistics on task distribution
- ✅ Backward compatible with existing tasks.md
- ✅ Tests pass with 90%+ coverage

---

### Story 31: Batch Task Operations
**Why:** Efficiency when AI implements multiple related tasks.

**Tools to Implement:**
- `tasks_tick_range` - Mark multiple tasks complete

**Tasks:**
1. Extend `src/tools/tasks.ts`
2. Define `TasksTickRangeSchema`:
   - `taskIds: string[]` (e.g., ["T001", "T002", "T003"])
   - `notes?: string` (completion notes)
3. Implement `tasksTickRange()`:
   - Validate all task IDs exist
   - Mark each as complete
   - Append notes to research.md
   - Update tasks.md with completion timestamps
   - Git commit with summary
4. Add tool registration
5. Write unit tests for range updates
6. Write integration test for batch completion
7. Update README with range tick examples

**Acceptance:**
- ✅ Can mark multiple tasks complete in one call
- ✅ Validates task IDs before updating
- ✅ Atomic operation (all or nothing)
- ✅ Logs completion in research.md
- ✅ Tests pass with 90%+ coverage

---

**Phase 2 Summary:**
- **New Tools:** 4 (tasks_visualize, tasks_filter, tasks_stats, tasks_tick_range)
- **Total Tools After Phase 2:** 25
- **Estimated Tasks:** ~20-25 tasks
- **Timeline:** 1 sprint (~2 weeks)
- **Removed:** diagram_generate (AI writes Mermaid directly), idea_capture (redundant with specify_describe)

**Note on Diagrams:**
- Research shows GitHub Spec Kit does NOT have a diagram generation tool
- AI assistants write Mermaid/PlantUML directly in markdown files
- Users open files in IDE to see rendered diagrams
- We'll add Mermaid examples to templates for consistency

---

## 🔬 Phase 3: Advanced Features (v0.4.0)

**Goal:** Power-user features, extensibility, contract generation
**Timeline:** 1.5 sprints (~3 weeks)
**Stories:** 34-37 (4 new stories)
**Note:** Removed project_bootstrap orchestrator (not in Spec Kit)

### Story 34: API Contract Generation
**Why:** Contract-first development. Generate OpenAPI/GraphQL schemas from specs.

**Tools to Implement:**
- `contracts_generate` - Auto-generate API contracts

**Tasks:**
1. Create `src/tools/contracts.ts`
2. Define `ContractsGenerateSchema`:
   - `contractType: 'openapi' | 'graphql' | 'protobuf' | 'typescript'`
   - `source: 'spec.md' | 'plan.md'`
   - `outputPath?: string`
3. Implement OpenAPI generator:
   - Parse spec.md for API endpoints
   - Extract paths, methods, parameters, responses
   - Generate OpenAPI 3.1 YAML
4. Implement GraphQL schema generator:
   - Parse spec.md for data models
   - Generate SDL (Schema Definition Language)
5. Implement TypeScript types generator:
   - Generate interfaces from spec
6. Add tool registration
7. Write unit tests for each contract type
8. Write integration test with API spec
9. Update README with contract examples

**Acceptance:**
- ✅ Generates valid OpenAPI 3.1 specs
- ✅ Generates GraphQL SDL
- ✅ Generates TypeScript types
- ✅ Validates contracts against schemas
- ✅ Tests pass with 90%+ coverage

---

### Story 35: Template Customization
**Why:** Different teams need different workflows. Support custom templates.

**Tools to Implement:**
- `templates_customize` - Override default templates
- `templates_list` - Show available templates

**Tasks:**
1. Create `src/tools/templates.ts`
2. Define `TemplatesCustomizeSchema`:
   - `templateType: 'spec' | 'plan' | 'tasks' | 'constitution'`
   - `customSections?: string[]` (additional sections)
   - `templatePath?: string` (path to custom template)
   - `scope: 'project' | 'global'`
3. Implement template resolution hierarchy:
   - Project-level: `.dincoder/templates/`
   - Global: `~/.dincoder/templates/`
   - Built-in: `src/speckit/templates/`
4. Implement `templatesCustomize()`:
   - Copy built-in template to project/global
   - Allow editing with custom sections
   - Validate template syntax
5. Implement `templatesList()`:
   - Show available templates
   - Indicate which are custom vs built-in
6. Add tool registration
7. Write unit tests for template resolution
8. Write integration test with custom template
9. Update README with customization guide

**Acceptance:**
- ✅ Can override default templates
- ✅ Supports project-level and global templates
- ✅ Custom templates work with all tools
- ✅ Validates template syntax
- ✅ Tests pass with 90%+ coverage

---

### Story 36: SDD Metrics & Analytics
**Why:** Data-driven insights for improving spec quality and velocity.

**Tools to Implement:**
- `metrics_report` - Generate SDD analytics

**Tasks:**
1. Create `src/tools/metrics.ts`
2. Define `MetricsReportSchema`:
   - `timeRange?: string` (e.g., "last-30-days")
   - `metrics: ('velocity' | 'quality' | 'cycle-time')[]`
3. Implement metrics collection:
   - **Velocity:** Tasks completed per day/week
   - **Quality:** Spec validation pass rate
   - **Cycle Time:** Spec → tasks → complete duration
4. Implement `metricsReport()`:
   - Scan git history for timestamps
   - Parse specs/tasks for completion data
   - Calculate metrics
   - Generate markdown report
5. Add visualization (optional):
   - Mermaid bar charts
   - Trend lines
6. Add tool registration
7. Write unit tests for metric calculations
8. Write integration test with sample project history
9. Update README with metrics examples

**Acceptance:**
- ✅ Tracks project velocity
- ✅ Measures spec quality over time
- ✅ Calculates cycle time
- ✅ Generates visual reports
- ✅ Tests pass with 90%+ coverage

---

### Story 37: Specification Linting
**Why:** Automated spec quality checks (like ESLint for code).

**Tools to Implement:**
- `spec_lint` - Automated spec improvement suggestions

**Tasks:**
1. Create `src/tools/lint.ts`
2. Define linting rules:
   - **Vague language:** Flag "should", "could", "might"
   - **Missing edge cases:** Warn if <3 edge cases
   - **Weak acceptance:** Flag non-testable criteria
   - **Scope creep:** Detect "nice-to-have" in core features
   - **Jargon:** Suggest plain language
3. Define `SpecLintSchema`:
   - `rules?: string[]` (which rules to apply)
   - `autoFix?: boolean`
4. Implement `specLint()`:
   - Parse spec.md
   - Run selected rules
   - Generate lint report with suggestions
   - Optionally auto-fix simple issues
5. Add tool registration
6. Write unit tests for each lint rule
7. Write integration test with problematic spec
8. Update README with linting guide

**Acceptance:**
- ✅ Detects vague language
- ✅ Suggests testable acceptance criteria
- ✅ Flags scope creep
- ✅ Auto-fixes simple issues
- ✅ Tests pass with 90%+ coverage

---

**Phase 3 Summary:**
- **New Tools:** 6 (contracts_generate, templates_customize, templates_list, metrics_report, spec_lint)
- **Total Tools After Phase 3:** 31
- **Estimated Tasks:** ~30-35 tasks
- **Timeline:** 1.5 sprints (~3 weeks)
- **Removed:** project_bootstrap orchestrator (Spec Kit doesn't orchestrate - AI does)

---

## 💎 Phase 4: Polish & v1.0 Release (v1.0.0)

**Goal:** Production-ready, battle-tested, fully documented
**Timeline:** 1.5 sprints (~3 weeks)
**Stories:** Complete existing stories 17-23, plus new polish stories

### Complete Existing Stories

#### Story 17: Cross-Agent Validation ✅
- Test DinCoder with Claude Code, Cursor, GitHub Copilot
- Document agent-specific quirks
- Create example projects for each agent

#### Story 18: Observability & Diagnostics ✅
- Add structured logging
- Implement debug mode
- Add tool execution tracing

#### Story 19: Security Hardening ✅
- Audit filesystem access
- Validate all user inputs
- Add rate limiting (if applicable)
- Security documentation

#### Story 20: Documentation Polish ✅
- Comprehensive README
- API reference docs
- Tutorial videos/GIFs
- Troubleshooting guide

#### Story 21: Release v1.0.0 ✅
- Final QA testing
- Performance optimization
- NPM publish
- Smithery deployment
- Release announcement

#### Story 22: Best Practices & Pitfalls ✅
- Document common mistakes
- Create best practices guide
- Example projects library

#### Story 23: Legacy Compatibility ✅
- Optional HTTP+SSE 2024-11-05 support
- Migration guide from old protocol

---

### New Polish Stories

#### Story 39: Performance Optimization
**Tasks:**
1. Profile tool execution times
2. Optimize file I/O (batch reads/writes)
3. Cache template parsing
4. Lazy-load dependencies
5. Benchmark before/after
6. Document performance characteristics

**Acceptance:**
- ✅ 50%+ reduction in tool latency
- ✅ <100ms response time for simple tools
- ✅ <500ms for complex tools (plan, tasks)

---

#### Story 40: Error Handling & Recovery
**Tasks:**
1. Audit all error paths
2. Implement graceful degradation
3. Add error recovery suggestions
4. Improve error messages (actionable)
5. Add rollback for failed operations
6. Test error scenarios

**Acceptance:**
- ✅ All errors have actionable messages
- ✅ Failed operations can rollback
- ✅ Partial failures don't corrupt state

---

#### Story 41: Template Library Expansion
**Tasks:**
1. Create domain-specific templates:
   - Web app (React, Vue, Svelte)
   - CLI tool (Node, Python, Go)
   - Mobile app (React Native, Flutter)
   - API service (REST, GraphQL)
   - Library/package
2. Crowdsource templates from community
3. Add template gallery to docs
4. Implement template discovery tool

**Acceptance:**
- ✅ 10+ official templates
- ✅ Community contribution process
- ✅ Template validation pipeline

---

#### Story 42: Integration Examples
**Tasks:**
1. Create example project: "Todo App"
   - Constitution → Spec → Plan → Tasks → Implement
   - Complete workflow demonstrated
2. Create example project: "API Service"
   - Contract generation
   - OpenAPI integration
3. Create example project: "CLI Tool"
   - Spec-first CLI design
4. Record tutorial videos for each
5. Publish examples to GitHub

**Acceptance:**
- ✅ 3+ complete example projects
- ✅ Video tutorials published
- ✅ Examples referenced in docs

---

**Phase 4 Summary:**
- **Complete Stories:** 17-23, 39-42 (10 stories)
- **Final Tool Count:** 34+ tools
- **Estimated Tasks:** ~40-50 tasks
- **Timeline:** 1.5 sprints (~3 weeks)

---

## Summary: Full Roadmap

| Phase | Version | Goal | Tools | Timeline | Status |
|-------|---------|------|-------|----------|--------|
| **Current** | v0.1.15 | Smithery deployment fix | 14 | Done | ✅ |
| **Phase 1** | v0.2.0 | Core completeness (Spec Kit parity) | +6 = 20 | 2 weeks | 📋 Planned |
| **Phase 2** | v0.3.0 | Workflow enhancement | +5 = 25 | 2 weeks | 📋 Planned |
| **Phase 3** | v0.4.0 | Advanced features | +6 = 31 | 3 weeks | 📋 Planned |
| **Phase 4** | v1.0.0 | Production polish | 31+ | 3 weeks | 📋 Planned |

**Total Timeline to v1.0.0:** ~10 weeks (2.5 months)

**Note:** Removed 3 redundant features based on Spec Kit research:
- diagram_generate (AI writes Mermaid directly)
- idea_capture (redundant with specify_describe)
- project_bootstrap (orchestration is AI's job, not tool's)

---

## Success Criteria for v1.0.0

### Feature Completeness
- ✅ 30+ tools implemented
- ✅ 95%+ Spec Kit command parity (excluding non-MCP features)
- ✅ All core workflow phases covered
- ✅ Quality gates and validation present

### Quality
- ✅ 95%+ test coverage
- ✅ All CI/CD passing
- ✅ Zero high-severity bugs
- ✅ Performance benchmarks met

### Documentation
- ✅ Complete API reference
- ✅ 5+ tutorial examples
- ✅ Video demonstrations
- ✅ Migration guides

### Adoption
- ✅ 100+ GitHub stars
- ✅ 50+ NPM weekly downloads
- ✅ 10+ community contributions
- ✅ Tested with 3+ AI agents

---

## Feature Voting Process

We use GitHub Issues for feature voting:

1. **Propose:** Open issue with title "Feature Request: [Name]"
2. **Vote:** React with 👍 to support
3. **Discuss:** Comment with use cases
4. **Prioritize:** Top-voted features get fast-tracked

**Current Vote Leaders** (to be tracked):
- [ ] constitution_create (Phase 1)
- [ ] clarify_add/resolve (Phase 1)
- [ ] spec_validate (Phase 1)
- [ ] tasks_visualize (Phase 2)
- [ ] diagram_generate (Phase 2)

---

## Contributing to Roadmap

Want to influence priorities?

1. **Vote on Features:** 👍 on GitHub issues
2. **Champion Features:** Comment "I can help implement this"
3. **Suggest New Features:** Open discussion with MCP-fit analysis
4. **Submit PRs:** See CONTRIBUTING.md for guidelines

---

**Roadmap Maintainer:** DinCoder Core Team
**Last Updated:** 2025-10-04
**Status:** Draft - Awaiting Community Review
