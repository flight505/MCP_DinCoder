📊 DinCoder MCP Server - Tools & Prompts Summary
Current Stats
Total MCP Tools: 28
Total MCP Prompts: 7
Total Features: 35 (28 tools + 7 prompts)
🛠️ All 28 MCP Tools (by category)
Project Setup (3 tools)
constitution_create - Define project principles and constraints
prereqs_check - Verify environment (Node, npm, git)
specify_start - Initialize .dincoder/ directory
Specification Phase (6 tools)
specify_describe - Create detailed spec.md
clarify_add - Flag ambiguities with unique IDs
clarify_resolve - Resolve clarifications with rationale
clarify_list - View all clarifications (pending/resolved)
spec_validate - Check specification quality
spec_refine - Update specific sections
Planning Phase (2 tools)
plan_create - Generate technical implementation plan
artifacts_analyze - Verify spec-plan-tasks alignment
Task Management (7 tools)
tasks_generate - Create actionable task list
tasks_tick - Mark single task complete
tasks_visualize - Show dependency graphs (Mermaid/Graphviz/ASCII)
tasks_filter - Smart filtering with presets (next, frontend, backend, ready, cleanup)
tasks_tick_range - Batch completion (T001-T005 syntax)
tasks_search - Fuzzy search across tasks
tasks_stats - Progress analytics with charts
Supporting Tools (3 tools)
artifacts_read - Read spec/plan/tasks artifacts
research_append - Log technical decisions
git_create_branch - Create feature branches
Quality Tools (6 tools)
quality_format - Run Prettier
quality_lint - Run ESLint
quality_test - Run test suite
quality_security_audit - Check for vulnerabilities
quality_deps_update - Check for outdated dependencies
quality_license_check - Analyze dependency licenses
Testing (1 tool)
test_echo - Test MCP server connectivity
🎯 All 7 MCP Prompts (slash commands)
1. /start_project
What it does: Initialize new spec-driven project
Calls: specify_start
Guides through: Project setup, explaining workflow
Lists all available tools
2. /create_spec
What it does: Create feature specification
Calls: specify_describe, spec_validate, spec_refine
Guides through: Requirements gathering, validation, refinement
3. /generate_plan
What it does: Generate implementation plan
Calls: plan_create, artifacts_analyze
Guides through: Technical planning, alignment checking
4. /create_tasks
What it does: Break down into actionable tasks
Calls: tasks_generate, tasks_visualize, tasks_stats, tasks_filter
Guides through: Task creation, dependency visualization, finding next actions
5. /review_progress
What it does: Generate comprehensive progress report
Calls: tasks_stats, tasks_filter, tasks_search
Provides: Completion %, recent work, next actions, blockers, recommendations
6. /validate_spec
What it does: Check specification quality
Calls: spec_validate, clarify_list, spec_refine
Checks: Completeness, acceptance criteria, clarifications, implementation leakage
7. /next_tasks
What it does: Show next actionable tasks
Calls: tasks_filter (preset: "next")
Shows: Unblocked tasks, priority recommendations
🏗️ Architecture: Prompts vs Tools
The Relationship
Prompts are NOT a replacement for tools - they work together:
┌─────────────────────────────────────────┐
│  MCP PROMPTS (7)                        │
│  - User-friendly slash commands         │
│  - Built-in workflow guidance           │
│  - Call multiple tools in sequence      │
│  - Provide context and instructions     │
└──────────────┬──────────────────────────┘
               │
               │ orchestrates
               ↓
┌─────────────────────────────────────────┐
│  MCP TOOLS (28)                         │
│  - Low-level operations                 │
│  - Single-purpose functions             │
│  - Direct access to functionality       │
│  - Can be called individually           │
└─────────────────────────────────────────┘
How It Works
Example: /create_spec prompt When a user types /mcp__dincoder__create_spec description="Build a task manager":
Prompt receives user input
Prompt guides AI to:
Ask clarifying questions
Call specify_describe with complete requirements
Call spec_validate to check quality
Call spec_refine if issues found
Iterate until validation passes
Tools execute the actual operations
AI follows workflow defined in prompt
Why Both?
Direct Tool Access:
// AI can still call tools directly for fine-grained control
await callTool('tasks_filter', { 
  status: 'pending', 
  phase: 'core', 
  priority: 'high' 
});
Guided Workflow:
// Or use prompts for guided, multi-step workflows
await callPrompt('next_tasks', { limit: 10 });
// Prompt internally calls tasks_filter with preset: "next"
// Plus provides context and recommendations
🎯 Design Philosophy
Prompts = Workflows
High-level user intentions ("I want to start a project")
Multi-step guided processes
Built-in best practices
Context-aware recommendations
Tools = Operations
Low-level actions ("Create this specific artifact")
Single-purpose functions
Composable primitives
Maximum flexibility
The Power of Both
Users (and AI agents) can:
Use prompts for standard workflows (recommended for beginners)
Call tools directly for custom workflows (advanced users)
Mix both as needed
📈 Coverage Analysis
What Prompts Cover (7/28 tools = 25%)
Prompts directly reference these tools:
specify_start ✅ (start_project)
specify_describe ✅ (create_spec)
spec_validate ✅ (create_spec, validate_spec)
spec_refine ✅ (create_spec, validate_spec)
clarify_list ✅ (validate_spec)
plan_create ✅ (generate_plan)
artifacts_analyze ✅ (generate_plan)
tasks_generate ✅ (create_tasks)
tasks_visualize ✅ (create_tasks)
tasks_stats ✅ (create_tasks, review_progress)
tasks_filter ✅ (create_tasks, review_progress, next_tasks)
tasks_search ✅ (review_progress)
artifacts_read ✅ (mentioned in generate_plan)
13 tools covered by prompts (46%)
What's NOT in Prompts (15 tools)
Available but not in standard workflows:
Constitution: constitution_create
Clarifications: clarify_add, clarify_resolve
Tasks: tasks_tick, tasks_tick_range
Quality: All 6 quality tools
Supporting: research_append, git_create_branch, artifacts_read
Prerequisites: prereqs_check
Testing: test_echo
Why not included?
Some are context-specific (constitution, clarify_add)
Some are advanced/optional (quality tools, git)
Some are internal/supporting (test_echo, research_append)
Prompts focus on core spec-driven workflow only
🚀 Future Expansion
Potential new prompts:
/setup_quality - Configure linting, testing, formatting
/commit - Guided git commit workflow
/clarify - Interactive clarification session
/refactor - Code refactoring workflow
Current status: Phase 3 (Integration & Discovery) - 1/5 stories complete Next: Story 35 - Claude Code Plugin (bundles prompts + agents + docs)
This is a two-tier architecture: Prompts provide guided workflows for common use cases, while all 28 tools remain accessible for direct use when needed. Best of both worlds! 🎯
