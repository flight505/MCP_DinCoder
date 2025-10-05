# Feature Voting Guide

**Last Updated:** 2025-10-04

---

## 📊 How Feature Voting Works

DinCoder uses community voting to prioritize feature development. Your input directly influences what gets built next!

### Voting Process

1. **Browse Features:** Check [open feature requests](https://github.com/flight505/mcp-dincoder/labels/enhancement)
2. **Vote:** React with 👍 on issues you want to see implemented
3. **Discuss:** Comment with use cases, suggestions, or concerns
4. **Champion:** Offer to help implement, test, or document

### Vote Tallies

Features are sorted by:
- 👍 reactions (primary)
- Comments and engagement (secondary)
- MCP-appropriateness (filter)
- Implementation complexity (tiebreaker)

---

## 🗳️ Current Feature Candidates

### 🔴 Critical Features (Phase 1)

These features complete the core Spec Kit workflow:

| Feature | Description | Votes | Status |
|---------|-------------|-------|--------|
| **constitution_create** | Define project principles and constraints | - | ✅ Implemented |
| **clarify_add/resolve** | Track and resolve spec ambiguities | - | 📋 Planned |
| **spec_validate** | Quality gates for specifications | - | 📋 Planned |
| **spec_refine** | Iterative spec improvement | - | 📋 Planned |
| **prereqs_check** | Environment validation | - | 📋 Planned |

**Vote:** [Create a feature request](https://github.com/flight505/mcp-dincoder/issues/new/choose) or vote on existing issues

---

### 🟡 Enhancement Features (Phase 2)

These features improve AI workflow efficiency:

| Feature | Description | Votes | Status |
|---------|-------------|-------|--------|
| **tasks_visualize** | Generate dependency graphs (Mermaid) | - | 📋 Planned |
| **tasks_filter** | Filter tasks by phase/type/status | - | 📋 Planned |
| **tasks_tick_range** | Batch task completion | - | 📋 Planned |
| **diagram_generate** | Embed diagrams in specs | - | 📋 Planned |
| **idea_capture** | One-liner project bootstrap | - | 📋 Planned |

**Vote:** [Create a feature request](https://github.com/flight505/mcp-dincoder/issues/new/choose)

---

### 🟢 Advanced Features (Phase 3)

Power-user features for extensibility:

| Feature | Description | Votes | Status |
|---------|-------------|-------|--------|
| **contracts_generate** | API contract generation (OpenAPI, GraphQL) | - | 📋 Planned |
| **templates_customize** | Custom template support | - | 📋 Planned |
| **project_bootstrap** | Full project orchestration | - | 📋 Planned |
| **metrics_report** | SDD analytics and insights | - | 📋 Planned |
| **spec_lint** | Automated spec quality checking | - | 📋 Planned |

**Vote:** [Create a feature request](https://github.com/flight505/mcp-dincoder/issues/new/choose)

---

## 💡 Proposing New Features

### Before Proposing

1. **Search:** Check if similar feature exists
2. **Read Analysis:** Review [FEATURE_ANALYSIS.md](FEATURE_ANALYSIS.md) for context
3. **MCP Fit:** Ensure feature is MCP-appropriate (see below)

### Creating Feature Request

Use our [feature request template](https://github.com/flight505/mcp-dincoder/issues/new?template=feature_request.yml) which asks for:

- **Problem Statement:** What problem does this solve?
- **Proposed Solution:** How should it work?
- **MCP Appropriateness:** Why is this suitable for MCP?
- **Use Case Example:** Concrete example of usage
- **Alternatives:** Other approaches considered

### MCP Appropriateness Checklist

Your feature should:
- ✅ Enhance AI coding workflow (helps AI understand/generate code)
- ✅ Operate on files or data (not UI/visual elements)
- ✅ Be stateless or use filesystem (no server-side sessions)
- ✅ Compose with other tools (output → input chains)

Your feature should NOT:
- ❌ Replicate IDE features (syntax highlighting, keybindings)
- ❌ Require collaboration infrastructure (team assignment, notifications)
- ❌ Execute implementation (AI's job to write code)
- ❌ Need external integrations better served by separate MCP servers

**Examples:**
- ✅ Good: `diagram_generate` (creates Mermaid diagrams in specs)
- ❌ Bad: `team_notify` (collaboration, external service)

---

## 🏆 Vote Leaders

### Top 5 Most Wanted Features

_This section will be updated weekly based on community votes_

1. **TBD** - Votes
2. **TBD** - Votes
3. **TBD** - Votes
4. **TBD** - Votes
5. **TBD** - Votes

---

## 🚀 Feature Champions

Want to fast-track a feature? Become a champion!

### How to Champion

1. **Vote:** React 👍 to the feature request
2. **Comment:** "I can champion this feature"
3. **Collaborate:** Work with maintainers on design
4. **Implement:** Submit PR with implementation
5. **Test:** Help validate the feature works
6. **Document:** Write usage examples and docs

### Champion Benefits

- 🎯 Direct influence on feature design
- 🚀 Faster feature delivery
- 🏅 Recognition in CHANGELOG and README
- 💡 Learn DinCoder internals

### Current Champions

_Contributors who championed features will be listed here_

---

## 📅 Voting Cycle

### Monthly Review

On the 1st of each month, we:
1. Tally votes on all open feature requests
2. Update this document with top 10 features
3. Select features for next sprint based on:
   - Community votes (50% weight)
   - Roadmap alignment (30% weight)
   - Implementation complexity (20% weight)

### Communication

- **Planning:** Announced in GitHub Discussions
- **Progress:** Updates in feature request issues
- **Releases:** Announced in CHANGELOG.md

---

## ❓ FAQ

### How many votes does a feature need?

There's no fixed threshold. We consider:
- Absolute vote count
- Vote velocity (votes/day)
- Discussion quality
- Implementation feasibility

### Can I change my vote?

Yes! Remove your 👍 reaction anytime.

### What if my feature is rejected?

We'll explain why in the issue comments. Common reasons:
- Not MCP-appropriate
- Duplicates existing feature
- Too complex for benefit
- Better served by external tool

You can revise and resubmit!

### How long until voted features are implemented?

Depends on:
- Feature complexity (1-5 story points)
- Maintainer availability
- Champion involvement (champions accelerate!)

Typical timeline:
- Small features (1-2 points): 1-2 weeks
- Medium features (3 points): 2-4 weeks
- Large features (4-5 points): 4-8 weeks

---

## 🙋 Questions?

- **General Questions:** [Open a discussion](https://github.com/flight505/mcp-dincoder/discussions)
- **Feature Ideas:** [Submit feature request](https://github.com/flight505/mcp-dincoder/issues/new?template=feature_request.yml)
- **Vote Status:** Check [enhancement label](https://github.com/flight505/mcp-dincoder/labels/enhancement)

---

**Maintained by:** DinCoder Core Team
**Next Review:** 1st of each month
**Status:** Active
