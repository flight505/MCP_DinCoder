# DinCoder Roadmap

> **Current Version:** v0.7.0 (Project Templates - Strategy E)
> **Status:** 31/42 stories complete (74%) - Phase 4 detailed planning complete!
> **Last Updated:** 2025-10-17

## Vision

Transform spec-driven development into a seamless, integrated experience across all AI coding platforms. DinCoder provides the complete Constitution → Specify → Clarify → Plan → Tasks → Implement → Validate workflow through composable MCP tools.

---

## Completed Milestones ✅

### Phase 1: Core Spec Kit Parity (v0.2.0) - Released 2025-10-16
**Goal:** Match essential GitHub Spec Kit functionality

✅ **Constitution Tool** (`constitution_create`)
✅ **Clarification Tracking** (`clarify_add`, `clarify_resolve`, `clarify_list`)
✅ **Spec Validation** (`spec_validate`, `artifacts_analyze`)
✅ **Spec Refinement** (`spec_refine`)
✅ **Prerequisites Check** (`prereqs_check`)

**Result:** 21 total tools, 100% Spec Kit command parity

---

### Phase 2: Advanced Task Management (v0.3.0) - Released 2025-10-16
**Goal:** Scale to projects with 50+ tasks

✅ **Task Visualization** (`tasks_visualize`) - Mermaid/Graphviz/ASCII graphs
✅ **Task Filtering** (`tasks_filter`) - Smart presets (next, frontend, backend, ready)
✅ **Batch Operations** (`tasks_tick_range`) - Range expansion for bulk completion
✅ **Task Search** (`tasks_search`) - Fuzzy matching with Levenshtein algorithm
✅ **Task Statistics** (`tasks_stats`) - Progress charts and analytics

**Result:** 26 total tools, enterprise-scale task management

---

### Phase 3: Integration Strategy A (v0.4.0) - Released 2025-10-16
**Goal:** Universal workflow prompts across all MCP clients

✅ **MCP Prompts** (7 workflows):
- `start_project` - Initialize new spec-driven project
- `create_spec` - Generate feature specification
- `generate_plan` - Create implementation plan
- `create_tasks` - Break down into actionable tasks
- `review_progress` - Comprehensive progress report
- `validate_spec` - Quality gates before implementation
- `next_tasks` - Show actionable items

**Result:** Zero-configuration discovery in Claude Code, VS Code Copilot, OpenAI Codex, Cursor

---

### Phase 3.1: Claude Code Plugin (v0.5.0) - Released 2025-10-17
**Goal:** Premium bundled experience for Claude Code users

✅ **Features:**
- Native `/spec`, `/plan`, `/tasks` slash commands (no prefix)
- Specialized agents: `@spec-writer`, `@plan-architect`, `@task-manager`
- Bundled CLAUDE.md with methodology documentation
- One-command install: `/plugin install dincoder`

**Repository:** [dincoder-plugin](https://github.com/flight505/dincoder-plugin)

**Result:** Premium Claude Code experience with 6 slash commands + 3 agents

---

### Phase 3.2: VS Code & Codex Integration (v0.6.0) - Released 2025-10-17
**Goal:** Comprehensive documentation and templates for VS Code & Codex

✅ **Deliverables:**
- Complete VS Code + Copilot integration guide (docs/integration/vscode.md)
- Complete OpenAI Codex integration guide (docs/integration/codex.md)
- Ready-to-use template files for both platforms
- Quick setup instructions with troubleshooting
- Updated main README with integration sections

**Result:** Effortless onboarding for VS Code/Codex users with copy-paste templates

---

### Phase 3.3: Project Templates (v0.7.0) - Released 2025-10-17
**Goal:** Pre-configured templates for common project types

✅ **Deliverables:**
- 4 project type templates (web-app, api-service, mobile-app, cli-tool)
- Pre-configured constitutions with best practices (~200 lines each)
- Sample spec-example.md showing proper structure
- Technology stack recommendations for each type
- Comprehensive master README (~250 lines)
- Complete integration with DinCoder constitution tool
- 1,160+ lines of template content

**Result:** Instant project setup with opinionated best practices built-in

---

## Current Sprint 🚀

### Phase 4: Advanced Features (v0.8.0)
**Timeline:** 3 weeks
**Status:** 📋 Detailed Planning Complete - Ready for Implementation

**Research-Backed Tool Choices:**
- **tsoa** - TypeScript-to-OpenAPI generation (most comprehensive 2025 tool)
- **markdownlint** - Industry-standard markdown linting (Node.js)
- **DORA Metrics** - Research-backed performance indicators
- **SPACE Metrics** - Alternative to problematic velocity tracking
- **Cycle Time** - More actionable than velocity

**New Tools (6):**

1. **`contracts_generate`** - OpenAPI 3.1/GraphQL schema generation
   - TypeScript-to-OpenAPI with tsoa integration
   - Extract contracts from spec.md automatically
   - GraphQL SDL generation support
   - Contract versioning with breaking change detection

2. **`templates_customize`** - Template customization with hooks
   - Override system for built-in templates
   - Before/after/transform/validate hooks
   - Variable substitution and inheritance
   - Multi-level template inheritance

3. **`templates_list`** - Template discovery
   - List all built-in and custom templates
   - Show customization points
   - Display current overrides
   - Hook status reporting

4. **`metrics_report`** - DORA-aligned metrics tracking
   - DORA metrics (Deployment Frequency, Lead Time, Change Failure Rate)
   - SPACE metrics (Performance, Activity, Communication, Efficiency)
   - Cycle time analysis (spec → plan → tasks)
   - Trend detection (7-day MA, period-over-period)
   - ⚠️ Avoids velocity-as-performance metric trap

5. **`metrics_export`** - Metrics export
   - CSV format (Excel-compatible)
   - JSON format (API-compatible)
   - Custom date ranges
   - Burndown charts with projections

6. **`spec_lint`** - Automated spec quality checking
   - markdownlint integration
   - 7+ spec-specific lint rules
   - Prose quality checking (passive voice, vague language)
   - Auto-fix capability for simple issues
   - Configurable severity levels

**Total Tools After Phase 4:** 32 (26 existing + 6 new)

**Why:** Enterprise-grade features for contract-first development, quality automation, and metrics tracking

---

## Upcoming Releases 📋

### Phase 5: Production Polish (v1.0.0)
**Timeline:** 2 weeks
**Status:** Planned

---

### Phase 5: Production Polish (v1.0.0)
**Timeline:** 2 weeks
**Status:** Planned

**Focus Areas:**
- Cross-agent validation (Claude Code, VS Code, Codex)
- Observability & diagnostics
- Security hardening
- Comprehensive documentation
- Performance optimization
- Error handling improvements
- Real-world example gallery

**Why:** Battle-tested, production-ready release

---

## Long-Term Vision (Post v1.0)

### Community Features
- [ ] Community template marketplace
- [ ] Shared spec libraries
- [ ] Collaborative spec editing
- [ ] Spec versioning and diffing

### AI Enhancements
- [ ] Multi-agent workflows (specialized agents per phase)
- [ ] Automatic spec improvement suggestions
- [ ] Learning from project history
- [ ] Cross-project pattern detection

### Enterprise Features
- [ ] Team analytics and insights
- [ ] Custom workflow orchestration
- [ ] Integration with Linear, JIRA, GitHub Projects
- [ ] SOC 2 compliance tooling
- [ ] Multi-repository coordination

---

## How to Contribute

### Vote on Features
👍 **Upvote features** by commenting on [GitHub Discussions](https://github.com/flight505/mcp-dincoder/discussions)

### Suggest Features
💡 **Propose new features** with:
1. Use case description
2. MCP fit analysis (why this belongs in MCP server vs IDE plugin)
3. Examples of how you'd use it

### Champion Features
🛠️ **Help implement** by:
1. Comment "I can help with this" on feature issues
2. Review the [CONTRIBUTING.md](CONTRIBUTING.md) guide
3. Submit a PR referencing the feature issue

---

## Success Metrics

### Adoption
- npm downloads of `mcp-dincoder`
- Plugin installs (Claude Code)
- Template repository uses
- MCP prompt invocations

### Engagement
- Average tools used per session
- Spec → Plan → Tasks completion rate
- Task completion velocity
- Quality gate pass rate

### Quality
- Spec validation pass rate (target: >90%)
- Plan-spec alignment score (target: >95%)
- Task dependency graph health
- User-reported issues (target: <10/month)

---

## Stay Updated

- **GitHub:** [flight505/mcp-dincoder](https://github.com/flight505/mcp-dincoder)
- **npm:** [mcp-dincoder](https://www.npmjs.com/package/mcp-dincoder)
- **Smithery:** [@flight505/mcp_dincoder](https://smithery.ai/server/@flight505/mcp_dincoder)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Detailed Plan:** [plan.md](plan.md)

---

**Roadmap Version:** 3.0
**Maintained by:** DinCoder Team
**License:** MIT
