# DinCoder Spec-Driven Development

This project uses DinCoder for spec-driven development workflows.

## MCP Tools Available

The DinCoder MCP server provides tools for structured development:

### Project Initialization
- `specify_start` - Initialize .dincoder/ directory
- `prereqs_check` - Verify environment setup

### Specification Phase
- `specify_describe` - Create detailed specification
- `spec_validate` - Check specification quality
- `spec_refine` - Update specific sections
- `clarify_add/resolve/list` - Manage clarifications

### Planning Phase
- `plan_create` - Generate technical implementation plan
- `artifacts_analyze` - Verify spec-plan alignment

### Task Management
- `tasks_generate` - Create actionable task list
- `tasks_visualize` - Show dependency graphs (Mermaid/Graphviz/ASCII)
- `tasks_filter` - Smart filtering (next, frontend, backend, ready, cleanup)
- `tasks_search` - Fuzzy search across tasks
- `tasks_stats` - Progress analytics and charts
- `tasks_tick` - Mark single task complete
- `tasks_tick_range` - Batch completion (T001-T005 syntax)

## Workflow

1. **Specify** - Define what to build
   - Run `specify_start` to initialize
   - Run `specify_describe` to create spec.md
   - Run `spec_validate` to ensure quality

2. **Plan** - Design how to build it
   - Run `plan_create` to generate plan.md
   - Run `artifacts_analyze` to verify alignment

3. **Execute** - Build following tasks
   - Run `tasks_generate` to create tasks.md
   - Run `tasks_filter` with preset "next" to see actionable items
   - Mark complete with `tasks_tick` or `tasks_tick_range`

4. **Track** - Monitor progress
   - Run `tasks_stats` for progress analytics
   - Run `tasks_visualize` for dependency graphs

## MCP Prompts (Slash Commands)

Use these slash commands in Copilot Chat (agent mode):

- `/mcp.dincoder.start_project` - Initialize new project
- `/mcp.dincoder.create_spec` - Create specification
- `/mcp.dincoder.generate_plan` - Generate implementation plan
- `/mcp.dincoder.create_tasks` - Generate task list
- `/mcp.dincoder.review_progress` - View progress report
- `/mcp.dincoder.validate_spec` - Check spec quality
- `/mcp.dincoder.next_tasks` - Show next actionable tasks

## File Structure

```
.dincoder/
├── spec.md          # What to build (requirements)
├── plan.md          # How to build it (architecture)
├── tasks.md         # Actionable task list
├── research.md      # Technical decisions log
└── constitution.json # Project principles
```

## Quality Gates

- ✅ Validate spec before planning (`spec_validate`)
- ✅ Verify plan-spec alignment (`artifacts_analyze`)
- ✅ Check dependencies before starting tasks (`tasks_visualize`)
- ✅ Track progress regularly (`tasks_stats`)

## Best Practices

**Specifications:**
- Focus on WHAT, not HOW
- Include testable acceptance criteria
- Flag ambiguities as clarifications

**Tasks:**
- Keep tasks atomic (1 session)
- Add metadata (phase, type, priority, effort)
- Use dependencies to enforce order

**Progress:**
- Update task status regularly
- Review progress with `tasks_stats`
- Focus on unblocked tasks first
