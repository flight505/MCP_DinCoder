# DinCoder Roadmap

> **Current Version:** v0.4.0 (Integration & Discovery Update)
> **Status:** 28/36 stories complete (78%)
> **Last Updated:** 2025-10-16

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

## Current Sprint 🚀

### Phase 3.1: Claude Code Plugin (v0.5.0) - In Planning
**Goal:** Premium bundled experience for Claude Code users
**Timeline:** 1 week
**Status:** 📋 Planned

**Features:**
- Native `/spec`, `/plan`, `/tasks` slash commands (no prefix)
- Specialized agents: `@spec-writer`, `@plan-architect`, `@task-manager`
- Bundled CLAUDE.md with methodology documentation
- One-command install: `/plugin install dincoder`

**Repository:** `dincoder/claude-plugin` (separate repo)

**Why:** Better UX than MCP prompts for Claude Code-specific workflows

---

## Upcoming Releases 📋

### Phase 3.2: VS Code & Codex Integration Docs (v0.6.0)
**Timeline:** 1 week
**Status:** Planned

**Deliverables:**
- `.vscode/` template files (mcp.json, settings.json)
- `.github/copilot-instructions.md` template
- OpenAI Codex `config.toml` template
- Video tutorials for each platform
- Setup validation scripts

**Why:** Make onboarding effortless for VS Code/Codex users

---

### Phase 3.3: Project Templates (v0.7.0)
**Timeline:** 1 week
**Status:** Planned

**Repositories:**
- `dincoder/template-claude` - Pre-configured for Claude Code
- `dincoder/template-vscode` - Pre-configured for VS Code Copilot
- `dincoder/template-universal` - Platform-agnostic setup

**Features:**
- GitHub template repositories
- One-click "Use this template" setup
- Pre-configured MCP server connections
- Example specs, plans, and tasks
- CI/CD workflows included

**Why:** Instant project setup, zero configuration

---

### Phase 4: Advanced Features (v0.8.0)
**Timeline:** 3 weeks
**Status:** Planned

**New Tools:**
1. **`contracts_generate`** - Auto-generate OpenAPI/GraphQL schemas from specs
2. **`templates_customize`** - Override default Spec Kit templates
3. **`metrics_report`** - Track project velocity and spec quality
4. **`spec_lint`** - Automated spec quality checking
5. **`diagram_generate`** - Visual architecture diagrams from plans
6. **`project_bootstrap`** - One-command full project setup

**Total Tools:** 32+

**Why:** Power-user features and extensibility

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
