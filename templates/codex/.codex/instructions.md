# DinCoder Spec-Driven Development

This project uses DinCoder MCP server for structured development workflows.

## Available Tools

The DinCoder MCP server provides 26 tools organized by phase:

### Project Setup
- `specify_start` - Initialize .dincoder/ directory structure
- `prereqs_check` - Verify Node.js, npm, git availability
- `constitution_create` - Define project principles and constraints

### Specification Phase (WHAT)
- `specify_describe` - Create detailed specification
- `spec_validate` - Check quality (4 validation rules)
- `spec_refine` - Update specific sections
- `clarify_add` / `clarify_resolve` / `clarify_list` - Manage ambiguities

### Planning Phase (HOW)
- `plan_create` - Generate technical implementation plan
- `artifacts_analyze` - Verify spec-plan alignment

### Task Management
- `tasks_generate` - Create actionable task list
- `tasks_visualize` - Mermaid/Graphviz/ASCII dependency graphs
- `tasks_filter` - Smart presets (next, frontend, backend, ready, cleanup)
- `tasks_search` - Fuzzy search with Levenshtein distance
- `tasks_stats` - Progress analytics with charts
- `tasks_tick` - Mark single task complete
- `tasks_tick_range` - Batch completion (T001-T005 syntax)

### Quality & Research
- `quality_format` / `quality_lint` / `quality_test`
- `research_append` - Log technical decisions

## Workflow Commands

Use MCP prompts as workflows:

```bash
# Initialize new project
codex "use /mcp.dincoder.start_project my-app"

# Create specification
codex "use /mcp.dincoder.create_spec 'Build a REST API for task management'"

# Generate plan
codex "use /mcp.dincoder.generate_plan"

# Create tasks
codex "use /mcp.dincoder.create_tasks"

# Review progress
codex "use /mcp.dincoder.review_progress"
```

## Spec-Driven Methodology

1. **Specify** - Define requirements
   - What are we building?
   - Who is it for?
   - What does success look like?

2. **Plan** - Design solution
   - How will we build it?
   - What's the architecture?
   - What are the milestones?

3. **Execute** - Implement tasks
   - Break down into atomic tasks
   - Track dependencies
   - Monitor progress

4. **Validate** - Ensure quality
   - Validate spec before planning
   - Verify plan-spec alignment
   - Track task completion

## File Structure

```
.dincoder/
├── spec.md          # Requirements (WHAT)
├── plan.md          # Architecture (HOW)
├── tasks.md         # Actionable items
├── research.md      # Technical decisions
└── constitution.json # Project principles
```

## Task Metadata Format

Tasks support metadata for advanced filtering:

```markdown
- [ ] Task description (phase: setup, type: backend, depends: T001, priority: high, effort: 3)
```

**Metadata fields:**
- `phase`: setup | implementation | testing | polish
- `type`: frontend | backend | devops | testing | docs
- `depends`: Comma-separated task IDs (T001, T002)
- `priority`: high | medium | low
- `effort`: Estimated hours (1-8)
- `tags`: Custom tags for filtering

## Best Practices

**Specifications:**
- Focus on WHAT, not HOW
- Include testable acceptance criteria (when/then statements)
- Flag assumptions as clarifications
- Be explicit about out-of-scope items

**Plans:**
- Document architectural decisions with rationale
- Include trade-off analysis
- Phase work for iterative delivery
- Log key decisions to research.md

**Tasks:**
- Keep atomic (completable in one session)
- Add metadata for filtering
- Use dependencies to enforce order
- Update status regularly

**Progress:**
- Run `tasks_stats` regularly
- Focus on unblocked tasks
- Visualize dependencies before starting
- Celebrate completed milestones
