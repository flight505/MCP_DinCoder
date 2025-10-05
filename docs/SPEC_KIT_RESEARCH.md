# Spec Kit Research Findings

**Date:** 2025-10-04
**Source:** https://github.com/github/spec-kit
**Purpose:** Understand how Spec Kit tools work to inform DinCoder feature decisions

---

## 🔍 Key Findings

### 1. **Diagrams Are NOT a Separate Tool** ❌

**Finding:** Spec Kit does NOT have a `diagram_generate` or `/diagram` command.

**Evidence:**
- Reviewed all templates (spec-template.md, plan-template.md, tasks-template.md)
- Reviewed all commands in README
- Reviewed repository structure
- **No mention of diagrams anywhere**

**Implication for DinCoder:**
- ✅ **We do NOT need a `diagram_generate` tool**
- AI can just write Mermaid/PlantUML directly in markdown files
- GitHub Spec Kit expects AI to embed diagrams naturally in specs/plans

**Your idea about pre-loaded prompts:** ✅ **Perfect approach!**
- We can add diagram examples to our templates
- Include Mermaid syntax guidance in templates
- AI will naturally generate diagrams when appropriate
- No separate tool needed

---

### 2. **`/idea` Command Does NOT Exist** ❌

**Finding:** GitHub Spec Kit does NOT have an `/idea` command in their official release.

**Evidence:**
- README lists 7 commands: `/constitution`, `/specify`, `/clarify`, `/plan`, `/tasks`, `/analyze`, `/implement`
- No `/idea` in templates directory
- Discussion #679 mentions `/idea` as a **feature request**, not implemented feature
- User VardhmanSurana **proposed** it for "one-shot project bootstrapping"

**What `/specify` Actually Does:**

Looking at the spec-template.md:
```markdown
**Input**: User description: "$ARGUMENTS"

## Execution Flow (main)
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
...
```

**Key insight:** `/specify` ALREADY accepts freeform descriptions and generates full specs!

**Comparison with our `specify_describe`:**

Our implementation:
```typescript
export async function specifyDescribe(params: z.infer<typeof SpecifyDescribeSchema>) {
  const { description, workspacePath } = params;
  // ... generates spec.md from description using template
}
```

**Verdict:** ✅ **Our `specify_describe` IS equivalent to `/specify`**
- Both take freeform text description
- Both generate structured spec.md
- Both use templates with sections

**Implication for DinCoder:**
- ❌ **We do NOT need `idea_capture` as a separate tool**
- ✅ `specify_describe` already does "one-shot bootstrapping"
- The only difference is naming - they call it `/specify`, we call it `specify_describe`

---

## 📊 Complete Spec Kit Command Mapping

| Spec Kit Command | DinCoder Equivalent | Status | Notes |
|-----------------|---------------------|--------|-------|
| `specify init` (CLI) | `specify_start` | ✅ Has | Initialize project |
| `specify check` (CLI) | `prereqs_check` | 📋 Planned | Verify tools |
| `/constitution` | `constitution_create` | ✅ Prototype | Project principles |
| `/specify` | `specify_describe` | ✅ Has | Create spec from description |
| `/clarify` | `clarify_add/resolve` | 📋 Planned | Track ambiguities |
| `/plan` | `plan_create` | ✅ Has | Technical plan |
| `/tasks` | `tasks_generate` | ✅ Has | Task breakdown |
| `/analyze` | `spec_validate` + `artifacts_analyze` | 📋 Planned | Consistency check |
| `/implement` | ❌ Not applicable | N/A | AI executes tasks (circular in MCP) |

**Coverage:** 6/8 commands implemented or planned (75%)
- Missing 2: `/clarify`, `/analyze`
- 1 intentionally excluded: `/implement` (not MCP-appropriate)

---

## 🎯 Template Structure Insights

### Spec Template

**Sections:**
- User Scenarios & Testing (mandatory)
- Requirements (mandatory)
- Key Entities (if data involved)
- Review & Acceptance Checklist
- Execution Status

**Key patterns:**
- `[NEEDS CLARIFICATION: specific question]` markers for ambiguities
- Functional requirements numbered (FR-001, FR-002, etc.)
- Given/When/Then acceptance scenarios
- NO technology details in specs (that's for plans)

### Plan Template

**Sections:**
- Technical Context (language, dependencies, storage, testing)
- Constitution Check (validates against principles)
- Project Structure (source code layout)
- Phase 0: Research (resolve NEEDS CLARIFICATION)
- Phase 1: Design & Contracts (data models, API contracts)
- Phase 2: Task Planning Approach (describes what /tasks will do)
- Complexity Tracking (violations of constitution)

**Key patterns:**
- Phases are sequential gates
- Constitution is checked TWICE (before research, after design)
- Contracts generated in Phase 1 (OpenAPI, GraphQL schemas)
- **Plans do NOT create tasks** - that's `/tasks` job

### Tasks Template

**Sections:**
- Setup tasks
- Tests First (TDD - MUST COMPLETE before implementation)
- Core Implementation (only after tests failing)
- Integration tasks
- Polish tasks
- Dependencies graph
- Parallel execution examples

**Key patterns:**
- Tasks numbered: T001, T002, T003...
- `[P]` marker for parallel execution (different files)
- TDD enforced: Tests MUST fail before implementation
- File paths specified in each task

---

## 💡 Insights for DinCoder

### 1. **Diagrams Strategy** ✅ RESOLVED

**Recommendation:** Do NOT create `diagram_generate` tool

**Instead:**
- Add Mermaid examples to templates
- Include syntax guidance in constitution/plan templates
- Let AI naturally embed diagrams in markdown
- Example template addition:

```markdown
## Architecture Diagram (Optional)

If helpful, include a Mermaid diagram:

\`\`\`mermaid
graph TD
    A[User] --> B[Frontend]
    B --> C[API]
    C --> D[Database]
\`\`\`
```

**Benefit:** Simpler, more flexible, no tool overhead

---

### 2. **Idea Capture** ✅ RESOLVED

**Recommendation:** Do NOT create `idea_capture` tool

**Reason:**
- `specify_describe` already does this
- `/specify` in Spec Kit accepts any freeform description
- No difference between "idea" and "description"

**Potential improvement:**
- Add better examples to `specify_describe` documentation
- Show it can handle everything from "build a todo app" to detailed requirements

---

### 3. **Constitution Integration** ⚠️ NEEDS WORK

**Finding:** Spec Kit checks constitution TWICE during planning:
1. Before Phase 0 research
2. After Phase 1 design

**Our implementation:** Only creates constitution.md, doesn't validate against it

**Recommendation:**
- `spec_validate` should check if spec violates constitution principles
- `plan_create` should reference constitution when making tech decisions
- Add constitution validation to quality gates

---

### 4. **Clarification Workflow** ⭐ CRITICAL INSIGHT

**Finding:** Spec Kit has structured `/clarify` command that:
- Sequentially questions unclear aspects
- Records answers in Clarifications section
- Required BEFORE `/plan` (unless explicitly skipped)

**This is MORE than just marking `[NEEDS CLARIFICATION]`** - it's an interactive Q&A flow

**Our planned `clarify_add/resolve`:** ✅ Correct approach
- Add: Flag ambiguity with question
- Resolve: Record answer
- Store in clarifications.json for tracking

**Enhancement idea:**
- Add `clarify_list` to show all pending clarifications
- Block `plan_create` if unresolved clarifications exist (quality gate)

---

### 5. **Analyze Command** ⭐ IMPORTANT

**Finding:** `/analyze` is separate from `/tasks` - runs AFTER tasks, BEFORE implement

**Purpose:**
- Cross-artifact consistency (spec ↔ plan ↔ tasks)
- Coverage analysis (all spec requirements have tasks?)
- Detects orphaned tasks (not in plan)

**Our plan:** `artifacts_analyze` tool ✅ Correct

**Should do:**
- Verify all spec FR-001, FR-002 have corresponding tasks
- Verify all plan components have tasks
- Detect tasks that don't map to plan/spec
- Check for missing test tasks (TDD validation)

---

## 🚫 Features to REMOVE from Roadmap

Based on this research:

### ❌ Remove: `diagram_generate`
**Reason:** Not in Spec Kit, AI can write Mermaid directly
**Alternative:** Add diagram examples to templates

### ❌ Remove: `idea_capture`
**Reason:** Redundant with `specify_describe`
**Alternative:** Better documentation showing `specify_describe` handles terse to detailed input

### ❌ Remove: `project_bootstrap` orchestrator (or defer to Phase 4)
**Reason:** Spec Kit doesn't have this - each command runs separately
**Alternative:** Let AI agent orchestrate command sequence

---

## ✅ Features to KEEP/ADD

### ✅ Keep: `constitution_create`
**Status:** Prototype done ✅
**Enhancement:** Add validation hooks in other tools

### ✅ Keep: `clarify_add` / `clarify_resolve`
**Status:** Planned
**Enhancement:** Add `clarify_list` helper

### ✅ Keep: `spec_validate`
**Status:** Planned
**Enhancement:** Include constitution validation

### ✅ Keep: `artifacts_analyze`
**Status:** Planned (part of Story 26)
**Note:** This IS the `/analyze` command

### ✅ Add: Constitution validation in workflows
**New insight:** Not a separate tool, but feature of existing tools
- `spec_validate` checks spec against constitution
- `plan_create` references constitution for tech decisions

---

## 📝 Updated Phase 1 Priorities

After research, Phase 1 should be:

1. ✅ **constitution_create** (done)
2. ⭐ **clarify_add / clarify_resolve** (critical - missing Spec Kit command)
3. ⭐ **spec_validate** (critical - includes constitution check)
4. ⭐ **artifacts_analyze** (critical - this is `/analyze` command)
5. ⭐ **prereqs_check** (this is `specify check` command)

**Remove from Phase 1:**
- ~~spec_refine~~ (not in Spec Kit, move to Phase 2)

**Phase 1 = Spec Kit Parity** (all core commands covered)

---

## 🎯 Answers to Your Questions

### Q1: Do we need diagram_generate tool?

**Answer:** ❌ **NO**

**Your idea works perfectly:**
> "if we can manage with a pre-loaded prompt which the ai tool then adds to. that way we can insure some consistency"

✅ **This is the right approach:**
- Add Mermaid examples to templates
- Include syntax guidelines in constitution
- Let AI naturally generate diagrams
- No separate tool needed

**Implementation:**
```markdown
# In constitution-template.ts or plan-template.ts
## Architecture Visualization (Optional)

When helpful, include Mermaid diagrams following these patterns:

**System Architecture:**
\`\`\`mermaid
graph TD
    A[Component A] --> B[Component B]
\`\`\`

**Data Flow:**
\`\`\`mermaid
sequenceDiagram
    User->>API: Request
    API->>DB: Query
\`\`\`
```

---

### Q2: Is "idea capture" redundant with specify_describe?

**Answer:** ✅ **YES - Completely redundant**

**Evidence:**
- Spec Kit's `/specify` accepts any text from terse to detailed
- Our `specify_describe` does the same
- Discussion #679 shows `/idea` is just a **proposed feature**, not implemented
- No functional difference between "idea" and "description"

**Recommendation:**
- ❌ Remove `idea_capture` from roadmap
- ✅ Better document that `specify_describe` handles:
  - Terse: "Build a todo app"
  - Detailed: [full requirements paragraph]

---

## 📊 Final Recommendations

### Immediate Actions

1. **Remove from roadmap:**
   - `diagram_generate` (use templates instead)
   - `idea_capture` (redundant)
   - `project_bootstrap` orchestrator (defer or remove)

2. **Update templates:**
   - Add Mermaid diagram examples to plan template
   - Add diagram syntax guide to constitution template
   - Show `specify_describe` works with terse input

3. **Revise Phase 1 to 4 stories:**
   - Story 24: constitution_create ✅
   - Story 25: clarify_add/resolve ✅
   - Story 26: spec_validate + artifacts_analyze ✅
   - Story 27: prereqs_check ✅
   - ~~Story 28: spec_refine~~ → Move to Phase 2

### Revised Tool Count

**After removing redundant features:**
- Phase 1: 6 tools (was 7)
  - constitution_create ✅
  - clarify_add, clarify_resolve
  - spec_validate, artifacts_analyze
  - prereqs_check

**This achieves 100% Spec Kit command parity** (excluding `/implement` which doesn't apply to MCP)

---

**Research Complete:** 2025-10-04
**Key Insight:** Spec Kit is simpler than we thought - no diagram tool, no idea tool, just solid workflow commands
**Action:** Update ROADMAP_UPDATED.md to remove redundant features
