# DinCoder TODO List

**Last Updated:** 2025-10-04
**Current Version:** v0.1.15
**Next Milestone:** v0.2.0 (Phase 1 - Core Completeness)

---

## ✅ Completed

### Planning & Research (2025-10-04)
- [x] Research GitHub Spec Kit implementation
- [x] Identify feature gaps vs Spec Kit
- [x] Create comprehensive feature analysis ([FEATURE_ANALYSIS.md](docs/FEATURE_ANALYSIS.md))
- [x] Create 4-phase roadmap ([ROADMAP_UPDATED.md](docs/ROADMAP_UPDATED.md))
- [x] Update plan.md with Phase 1 stories (Stories 24-28)
- [x] Prototype constitution_create tool (5/5 tests passing ✅)
- [x] Set up GitHub issue templates for feature voting
- [x] Update roadmap based on Spec Kit research (removed 3 redundant features)
- [x] Add Mermaid diagram examples to constitution template

---

## 📋 Current Session Todos

### Immediate (Next Steps)
- [ ] **Review documents with user**
  - [ ] Review [FEATURE_ANALYSIS.md](docs/FEATURE_ANALYSIS.md) - Does MCP-fit make sense?
  - [ ] Review [ROADMAP_UPDATED.md](docs/ROADMAP_UPDATED.md) - Are priorities correct?
  - [ ] Review [ROADMAP_CHANGES.md](docs/ROADMAP_CHANGES.md) - Approve feature removals?

### Blocked
- [ ] **Publish feature voting system** (BLOCKED: waiting for more features to be coded/tested)
  - GitHub issue templates created: [.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE/)
  - Voting guide created: [docs/FEATURE_VOTING.md](docs/FEATURE_VOTING.md)
  - Need: Real features for community to vote on
  - Action: Publish after Phase 1 implementation

---

## 🎯 Phase 1: Core Completeness (v0.2.0)

**Goal:** Achieve 100% Spec Kit command parity
**Timeline:** 2 weeks (1 sprint)
**Stories:** 5 (24-28)
**Tools:** 6 new tools

### Story 24: Constitution Tool ✅ PROTOTYPE COMPLETE
- [x] Create src/tools/constitution.ts
- [x] Create src/speckit/constitution-template.ts
- [x] Register tool in createServer.ts
- [x] Write unit tests (5/5 passing ✅)
- [ ] **Add integration test** (constitution → specify → plan workflow)
- [ ] **Update README** with constitution_create examples
- [ ] **Update workflow guide** (add Step 0: Define Constitution)

### Story 25: Clarification Tracking ⭐ CRITICAL
**Missing Spec Kit Command:** `/clarify`

- [ ] Create src/tools/clarify.ts
- [ ] Define ClarifyAddSchema and ClarifyResolveSchema
- [ ] Implement clarifications.json storage (.dincoder/clarifications.json)
- [ ] Implement clarifyAdd():
  - [ ] Generate unique IDs (CLARIFY-001, CLARIFY-002, etc.)
  - [ ] Store in clarifications.json
  - [ ] Optionally update spec.md with [NEEDS CLARIFICATION: ID] markers
- [ ] Implement clarifyResolve():
  - [ ] Load clarifications.json
  - [ ] Mark as resolved
  - [ ] Update spec.md with resolution
  - [ ] Log in research.md
  - [ ] Git commit
- [ ] Optional: Add clarifyList() helper
- [ ] Register tools in createServer.ts
- [ ] Write unit tests
- [ ] Write integration test (add → list → resolve flow)
- [ ] Update README with examples

**Estimated:** ~8-10 tasks

### Story 26: Spec Validation & Quality Gates ⭐ CRITICAL
**Missing Spec Kit Command:** `/analyze`

- [ ] Create src/tools/validate.ts
- [ ] Create src/speckit/validators.ts
- [ ] Define SpecValidateSchema and ArtifactsAnalyzeSchema
- [ ] Implement validation rules:
  - [ ] checkCompleteness() - All required sections present
  - [ ] checkAcceptanceCriteria() - Every feature has testable criteria
  - [ ] checkClarifications() - No unresolved [NEEDS CLARIFICATION]
  - [ ] checkPrematureImplementation() - No HOW in WHAT sections
  - [ ] checkConstitutionCompliance() - Spec aligns with constitution
- [ ] Implement specValidate()
- [ ] Implement artifactsAnalyze():
  - [ ] Check spec vs plan consistency
  - [ ] Check plan vs tasks consistency
  - [ ] Detect orphaned tasks
  - [ ] Detect missing tasks
- [ ] Register tools in createServer.ts
- [ ] Write unit tests for each validation rule
- [ ] Write integration test with problematic spec
- [ ] Update README with validation examples

**Estimated:** ~12-15 tasks

### Story 27: Spec Refinement
**Purpose:** Iterative spec improvement

- [ ] Create src/tools/refine.ts
- [ ] Implement markdown section parser (in src/speckit/parser.ts)
- [ ] Define SpecRefineSchema
- [ ] Implement specRefine():
  - [ ] Parse spec sections
  - [ ] Apply changes to specified section
  - [ ] Validate structure
  - [ ] Log in research.md
  - [ ] Git commit
- [ ] Optional: Add versioning (spec.v1.md, spec.v2.md)
- [ ] Register tool in createServer.ts
- [ ] Write unit tests
- [ ] Write integration test (iterative refinement)
- [ ] Update README

**Estimated:** ~8-10 tasks

### Story 28: Prerequisites Check ⭐
**Missing Spec Kit Command:** `specify check`

- [ ] Create src/tools/prereqs.ts
- [ ] Define PrereqsCheckSchema
- [ ] Implement version checkers:
  - [ ] checkNodeVersion()
  - [ ] checkCommandAvailable()
  - [ ] parseVersionRequirement()
  - [ ] compareVersions()
- [ ] Implement prereqsCheck()
- [ ] Add common prerequisite templates
- [ ] Register tool in createServer.ts
- [ ] Write unit tests
- [ ] Write integration test
- [ ] Update README

**Estimated:** ~8-10 tasks

### Phase 1 Summary
- **Total Tasks:** ~40-50 tasks
- **Timeline:** 2 weeks
- **New Tools:** 6 (constitution_create ✅, clarify_add, clarify_resolve, spec_validate, artifacts_analyze, spec_refine, prereqs_check)
- **Result:** 100% Spec Kit command parity

---

## 🚀 Phase 2: Workflow Enhancement (v0.3.0)

**After Phase 1 completion**

### Story 29: Task Visualization
- [ ] Create src/tools/visualize.ts
- [ ] Implement task dependency parser
- [ ] Implement Mermaid graph generator
- [ ] Detect circular dependencies
- [ ] Calculate critical path
- [ ] Write tests

### Story 30: Task Filtering
- [ ] Create src/tools/filter.ts
- [ ] Extend tasks.md with metadata
- [ ] Implement tasksFilter()
- [ ] Implement tasksStats()
- [ ] Write tests

### Story 31: Batch Task Operations
- [ ] Extend src/tools/tasks.ts
- [ ] Implement tasksTickRange()
- [ ] Atomic updates
- [ ] Write tests

**Estimated:** ~20-25 tasks

---

## 🔬 Phase 3: Advanced Features (v0.4.0)

**After Phase 2 completion**

### Story 34: Contract Generation
- [ ] OpenAPI generator
- [ ] GraphQL schema generator
- [ ] TypeScript types generator

### Story 35: Template Customization
- [ ] Template resolution hierarchy
- [ ] Custom template support
- [ ] Validation

### Story 36: Metrics & Analytics
- [ ] Velocity tracking
- [ ] Quality metrics
- [ ] Cycle time analysis

### Story 37: Spec Linting
- [ ] Linting rules
- [ ] Auto-fix capabilities
- [ ] Quality reports

**Estimated:** ~30-35 tasks

---

## 💎 Phase 4: Polish & v1.0 (v1.0.0)

**After Phase 3 completion**

- [ ] Complete Story 17: Cross-agent validation
- [ ] Complete Story 18: Observability & diagnostics
- [ ] Complete Story 19: Security hardening
- [ ] Complete Story 20: Documentation polish
- [ ] Complete Story 21: Release v1.0.0
- [ ] Complete Story 22: Best practices guide
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Template library expansion
- [ ] Integration examples

**Estimated:** ~40-50 tasks

---

## 📝 Documentation Todos

### High Priority
- [ ] Update README.md with constitution_create workflow
- [ ] Create Phase 1 implementation guide
- [ ] Document MCP-specific design patterns we're following

### Medium Priority
- [ ] Create video/GIF demos of tools
- [ ] Write migration guide from other spec systems
- [ ] Create troubleshooting guide

### Low Priority
- [ ] Expand contributing guide
- [ ] Create architecture decision records (ADRs)

---

## 🐛 Known Issues

_None currently tracked_

---

## 💡 Ideas / Future Enhancements

### From Community Discussions
- Sub-agents for specialized tasks (from Spec Kit discussions)
- Task tracking by phase (from Spec Kit discussions)
- i18n/locale support (from Spec Kit discussions)

### From Research
- Constitution validation hooks in other tools
- Task dependency graph optimization
- Automated spec quality scoring

---

## 📊 Progress Tracking

### Velocity
- **Week 1 (Oct 1-4):**
  - Research: ✅
  - Planning: ✅
  - Prototype 1 tool: ✅
  - Documentation: ✅

### Next Milestones
- **v0.2.0:** ~2 weeks (Phase 1 complete)
- **v0.3.0:** ~4 weeks total (Phase 1 + 2)
- **v0.4.0:** ~7 weeks total (Phase 1 + 2 + 3)
- **v1.0.0:** ~10 weeks total (all phases)

---

## 🔗 Quick Links

- [FEATURE_ANALYSIS.md](docs/FEATURE_ANALYSIS.md) - Gap analysis
- [ROADMAP_UPDATED.md](docs/ROADMAP_UPDATED.md) - 4-phase plan
- [ROADMAP_CHANGES.md](docs/ROADMAP_CHANGES.md) - Recent changes
- [SPEC_KIT_RESEARCH.md](docs/SPEC_KIT_RESEARCH.md) - Research findings
- [plan.md](plan.md) - Detailed implementation plan
- [FEATURE_VOTING.md](docs/FEATURE_VOTING.md) - Community voting

---

**Maintained By:** DinCoder Core Team
**Next Review:** After each story completion
**Status:** Active Development
