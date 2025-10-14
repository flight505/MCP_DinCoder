# DinCoder End-to-End Validation Prompt for Claude Desktop

You are acting as a QA engineer validating every MCP tool exposed by the DinCoder server. Work methodically, narrate your findings after each command, and capture any failures so they can be reproduced.

## Session Preparation
- Create or select a fresh local workspace directory named `~/dincoder-e2e-test` and treat it as the project root.
- If the client supports automatic workspace binding (e.g., Cursor, Claude Code), bind the MCP session to `~/dincoder-e2e-test` before issuing any commands so the path is injected automatically. Claude Desktop usually lacks this feature, so when running the test there, keep passing the path explicitly as noted below.
- For **every** tool invocation that accepts `workspacePath`, pass `"~/dincoder-e2e-test"` to guarantee isolation.
- Before running tools, confirm the directory starts empty (no leftover `specs/` or `.dincoder/`). If artifacts already exist, archive or delete them before proceeding.

## Validation Steps
1. **Project Constitution**
   - Call `constitution_create` with:
     ```json
     {
       "projectName": "QA Validation Suite",
       "principles": ["Ship specs before code", "Prefer deterministic tools"],
       "constraints": ["Tests must gate merges", "Support macOS/Linux clients"],
       "preferences": {
         "libraries": ["Vitest", "Prettier"],
         "patterns": ["Spec-first planning"],
         "style": "Functional > OOP"
       },
       "workspacePath": "~/dincoder-e2e-test"
     }
     ```
   - Verify `constitution.md` appears under `specs/001-qa-validation-suite/`.

2. **Specification Initialization**
   - Call `specify_start` for the same project with agent `"claude"`.
   - Confirm `spec.md`, `research.md`, and `.dincoder/spec.json` are created. Note any spec kit prerequisite warnings.

3. **Specification Detailing**
   - Invoke `specify_describe` with a multi-paragraph product brief (include goals, requirements, open questions) and confirm the new text is injected into `spec.md` and `.dincoder/spec.json`.

4. **Plan Generation**
   - Use `plan_create` with explicit technical constraints (databases, frontend stack, deployment posture). Ensure `plan.md`, `data-model.md`, updates to `research.md`, and `.dincoder/plan.json` all exist and feel coherent.

5. **Task Generation**
   - Run `tasks_generate` (scope can be `"full implementation"`). Confirm `tasks.md` and `.dincoder/tasks.json` are produced, then run `tasks_tick` on the first task ID to validate status updates.

6. **Clarification Workflow**
   - Execute `clarify_add` for an ambiguity in the spec. Inspect `clarifications.json`, `research.md`, and the updated `spec.md` marker. Follow with `clarify_list` to ensure the new entry appears.
   - Resolve it via `clarify_resolve` and re-run `clarify_list` to see the status change to `resolved`.

7. **Artifact Inspection**
   - Call `artifacts_read` for each of `spec`, `plan`, and `tasks` to verify the normalized JSON responses match the files on disk.

8. **Research Logging**
   - Run `research_append` with a short decision note and confirm the entry is appended to `research.md`.

9. **Git Utility**
   - Invoke `git_create_branch` with a test branch name (e.g., `"qa/dincoder-e2e"`) and ensure the branch appears in the local repo. Restore/checkout `main` when done to avoid conflicts.

10. **Quality Suite**
    - Sequentially call:
      - `quality_format` with `{ "fix": false }`
      - `quality_lint` with `{ "fix": false }`
      - `quality_test` with `{ "coverage": false }`
      - `quality_security_audit`
      - `quality_deps_update` with `{ "check": true }`
      - `quality_license_check`
    - Record outputs, especially warnings, and flag any required local project setup (e.g., missing `package.json`).

11. **Final Validation**
    - List the directory tree to confirm all expected artifacts exist only under `~/dincoder-e2e-test`.
    - Summarize tool outputs, highlighting anything that failed or needs fixes.

## Reporting Requirements
- After all steps, provide a structured summary covering: successes, anomalies, missing prerequisites, and suggestions.
- Attach snippets of critical JSON/markdown diffs that prove each tool executed.
- If a command fails, capture the exact parameters, stack trace (if any), and the remediation attempted.

Execute the workflow exactly as written so DinCoder’s full surface area is exercised in one Claude Desktop session.
