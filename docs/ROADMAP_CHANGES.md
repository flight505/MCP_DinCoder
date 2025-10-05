# Roadmap Changes Based on Spec Kit Research

**Date:** 2025-10-04
**Reason:** Research findings from GitHub Spec Kit showed 3 planned features are redundant

---

## 📊 Summary of Changes

### Features Removed: 3
1. ❌ **diagram_generate** (Phase 2)
2. ❌ **idea_capture** (Phase 2)
3. ❌ **project_bootstrap** (Phase 3)

### Tools Reduced
- **Phase 1:** 6 tools (was 7) - removed spec_refine, kept 5 critical Spec Kit commands
- **Phase 2:** 4 tools (was 6) - removed diagram_generate, idea_capture
- **Phase 3:** 6 tools (was 7) - removed project_bootstrap
- **Total at v1.0:** 31+ tools (was 34+)

---

## 🔍 Research Findings

### 1. diagram_generate ❌ NOT NEEDED

**Research:**
- Searched GitHub Spec Kit repository structure
- Reviewed all templates (spec, plan, tasks)
- Reviewed all commands in README
- **Result:** No diagram generation tool exists in Spec Kit

**How Spec Kit Handles Diagrams:**
- AI writes Mermaid/PlantUML directly in markdown files
- No separate tool or command
- Users open files in IDE to see rendered diagrams

**Why We Don't Need It:**
- MCP tools return text, not rendered visuals
- Users must open files to see diagrams regardless
- AI can already write Mermaid syntax directly
- Adding a tool doesn't change user workflow (still need to open file)

**Your Insight Was Correct:**
> "if we can manage with a pre-loaded prompt which the ai tool then adds to"

✅ **This is the right approach** - we added Mermaid examples to constitution template

**Alternative Solution Implemented:**
- Added diagram examples to constitution-template.ts
- Includes: System architecture, Sequence diagram, ER diagram
- AI references these patterns when writing specs/plans
- No separate tool needed

---

### 2. idea_capture ❌ REDUNDANT

**Research:**
- `/idea` command does NOT exist in GitHub Spec Kit
- Found discussion #679 proposing `/idea` as future feature (not implemented)
- Spec Kit's `/specify` accepts terse input: "Build a todo app"

**How Spec Kit Works:**
```bash
/specify Build an application that can help me organize my photos
```
This ONE command handles everything from terse to detailed input.

**Our `specify_describe` Works Identically:**
- Accepts terse: "Build a Pomodoro timer"
- Accepts detailed: [full requirements paragraph]
- Generates complete spec.md from either

**Why We Don't Need idea_capture:**
- It's functionally identical to `specify_describe`
- Spec Kit proves this pattern works
- No value in having two tools that do the same thing

**Solution:**
- Keep `specify_describe` as-is
- Better document that it handles terse→detailed input
- Remove `idea_capture` from roadmap

---

### 3. project_bootstrap ❌ NOT APPROPRIATE

**Research:**
- Spec Kit does NOT have an orchestration tool
- Each command (`/specify`, `/plan`, `/tasks`) runs separately
- AI agent orchestrates the sequence, not a tool

**Why Orchestration Doesn't Fit MCP:**
- MCP tools are atomic operations
- AI assistant is ALREADY the orchestrator
- Creating a tool to orchestrate tools is circular
- Spec Kit's design validates this: separate commands, AI glues them together

**Example:**
```
User: "Build a todo app"
AI (orchestrating):
  1. Calls constitution_create
  2. Calls specify_describe
  3. Calls plan_create
  4. Calls tasks_generate
```

This is better than:
```
User: "Build a todo app"
AI: Calls project_bootstrap
  Tool internally calls: constitution → specify → plan → tasks
```

**Why?**
- AI can adapt orchestration based on context
- AI can handle errors between steps
- AI can ask clarifying questions mid-workflow
- Tool orchestration is rigid and error-prone

**Solution:**
- Remove `project_bootstrap` from roadmap
- Let AI orchestrate workflow (as Spec Kit does)
- Each tool stays focused and composable

---

## 📝 Files Updated

### 1. ROADMAP_UPDATED.md
**Changes:**
- Phase 2: Reduced from 6 to 4 tools
  - Removed Story 32 (diagram_generate)
  - Removed Story 33 (idea_capture)
  - Updated tool count: 25 (was 27)
  - Updated timeline: ~20-25 tasks (was ~30-35)

- Phase 3: Reduced from 7 to 6 tools
  - Removed Story 36 (project_bootstrap)
  - Updated tool count: 31 (was 34)
  - Updated timeline: ~30-35 tasks (was ~35-40)

- Summary Table: Updated all tool counts and added note about removed features

### 2. FEATURE_ANALYSIS.md
**Changes:**
- Added "❌ NOT NEEDED - REDUNDANT" status to idea_capture section
- Explained research findings (no `/idea` in Spec Kit)
- Added conclusion: `specify_describe` already does this

- Updated Phase 2 summary:
  - Marked diagram_generate and idea_capture as REMOVED
  - Updated effort estimate: 12 tasks (was 20)

- Updated Phase 3 summary:
  - Marked project_bootstrap as REMOVED
  - Updated effort estimate: 20 tasks (was 25)

### 3. constitution-template.ts
**Changes:**
- Added new "📊 Diagram Standards (Optional)" section
- Includes 3 Mermaid examples:
  - System Architecture (graph with subgraphs)
  - Sequence Diagram (API interactions)
  - Data Model (ER diagram)
- Added note explaining AI writes diagrams directly in markdown

### 4. SPEC_KIT_RESEARCH.md (New)
**Created:** Comprehensive research document with findings:
- Complete command mapping (Spec Kit vs DinCoder)
- Template structure insights
- Evidence for each removed feature
- Recommendations for implementation

---

## ✅ Benefits of These Changes

### 1. Simpler Roadmap
- 3 fewer features to implement
- ~20 fewer tasks total
- Cleaner, more focused scope

### 2. Better Spec Kit Alignment
- 100% command parity (excluding `/implement` which doesn't apply to MCP)
- Following proven patterns from GitHub's implementation
- Not inventing features that don't exist upstream

### 3. Clearer Value Proposition
- DinCoder = "Spec Kit as MCP tools"
- Not "Spec Kit plus extra stuff"
- Users understand exactly what they're getting

### 4. Easier Maintenance
- Fewer tools to test
- Fewer tools to document
- Fewer edge cases to handle

### 5. Correct MCP Patterns
- Tools are atomic (not orchestrators)
- AI does orchestration (as it should)
- Diagrams handled naturally (no forced tooling)

---

## 🎯 Updated Phase 1 Priorities

Phase 1 remains focused on **Spec Kit Command Parity**:

1. ✅ constitution_create (done - prototype working)
2. ⭐ clarify_add/resolve (missing `/clarify` command)
3. ⭐ spec_validate + artifacts_analyze (missing `/analyze` command)
4. ⭐ prereqs_check (missing `specify check` command)
5. ⭐ spec_refine (iterative improvement)

**Result:** Phase 1 = Complete Spec Kit workflow coverage

---

## 📊 Tool Count Evolution

| Phase | Before Research | After Research | Change |
|-------|----------------|----------------|--------|
| Current (v0.1.15) | 14 | 14 | - |
| Phase 1 (v0.2.0) | +7 = 21 | +6 = 20 | -1 |
| Phase 2 (v0.3.0) | +6 = 27 | +5 = 25 | -2 |
| Phase 3 (v0.4.0) | +7 = 34 | +6 = 31 | -1 |
| v1.0.0 | 34+ | 31+ | -3 |

**Total Reduction:** 3 tools (9% reduction)

---

## 🚀 Next Steps

1. **Review Updated Roadmap**
   - Read [ROADMAP_UPDATED.md](ROADMAP_UPDATED.md)
   - Confirm Phase 1 priorities
   - Approve direction

2. **Begin Phase 1 Implementation**
   - Complete Story 24 (constitution_create - already prototyped)
   - Implement Story 25 (clarify_add/resolve)
   - Implement Story 26 (spec_validate/artifacts_analyze)
   - Implement Story 27 (prereqs_check)
   - Implement Story 28 (spec_refine)

3. **Test Constitution Template Updates**
   - Verify Mermaid examples render correctly
   - Test with constitution_create tool
   - Ensure diagrams appear in generated files

---

## 💡 Key Insights

### On Diagram Tools
**User's Question:** "Where is the Mermaid diagram displayed?"

**Answer:** In the file, not in chat. MCP tools return text. Users must open files to see rendered diagrams regardless of implementation approach.

**Implication:** A `diagram_generate` tool doesn't improve UX - users still open files either way. Simpler to let AI write Mermaid directly.

### On Orchestration
**Insight:** Spec Kit intentionally has separate commands (`/specify`, `/plan`, `/tasks`) rather than one big `/bootstrap` command.

**Why:** AI agents orchestrate better than tools. They can:
- Adapt to context
- Handle errors gracefully
- Ask clarifying questions
- Skip unnecessary steps

**Implication:** MCP tools should be atomic, AI does the orchestration.

### On Feature Scope
**Lesson:** Research upstream implementation before planning features. Don't assume features exist just because they seem logical.

**Result:** Avoided implementing 3 features that don't exist in Spec Kit and wouldn't add value.

---

**Changes Completed:** 2025-10-04
**Status:** Ready for review and Phase 1 implementation
