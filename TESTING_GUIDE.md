# DinCoder MCP Server - Complete Testing Guide for Claude Desktop

## Version 0.1.6 Testing Guide

This guide provides comprehensive instructions for testing all DinCoder MCP server tools in Claude Desktop after the major refactoring to fix tool naming and functionality issues.

## Prerequisites

1. **Claude Desktop Configuration**
   - Ensure Claude Desktop has the DinCoder server configured in `~/Library/Application Support/Claude/claude_desktop_config.json`
   - The configuration should look like:
   ```json
   {
     "mcpServers": {
       "dincoder": {
         "command": "npx",
         "args": ["mcp-dincoder"],
         "env": {}
       }
     }
   }
   ```

2. **Test Environment Setup**
   - Create a test directory: `mkdir ~/dincoder-test && cd ~/dincoder-test`
   - Initialize git: `git init`
   - Create initial commit: `echo "# Test" > README.md && git add . && git commit -m "Initial commit"`

## Testing Workflow

### Phase 1: Basic Connectivity Tests

#### 1. Test Echo (Verify Connection)
**Purpose**: Confirm the MCP server is running and responding
```
Test command: Use test_echo tool with message "Hello DinCoder"
Expected output: "Echo: Hello DinCoder"
```

### Phase 2: Project Initialization Tests

#### 2. Initialize Project (specify_start)
**Purpose**: Create the .dincoder directory structure
```
Test command: Use specify_start tool with:
- projectName: "test-project"
- agent: "claude"
- path: "." (current directory)

Expected output:
✅ Created .dincoder directory structure:
- .dincoder/spec.json (project specification template)
- .dincoder/plan.json (planning template)
- .dincoder/tasks.json (tasks template)
- .dincoder/research.md (research document)

Verify files exist:
ls -la .dincoder/
```

#### 3. Describe Project (specify_describe)
**Purpose**: Update the project specification with details
```
Test command: Use specify_describe tool with:
- description: "A web application for task management with user authentication, real-time updates, and REST API"

Expected behavior:
- Updates .dincoder/spec.json with parsed description
- Automatically extracts goals and requirements from the description
- Check file: cat .dincoder/spec.json
```

### Phase 3: Planning Tests

#### 4. Create Plan (plan_create)
**Purpose**: Generate project plan with constraints
```
Test command: Use plan_create tool with:
- constraints: "Use React with TypeScript, implement authentication with JWT, follow TDD approach, deploy to Vercel"

Expected behavior:
- Updates .dincoder/plan.json
- Automatically extracts:
  - Technologies: ["React", "TypeScript", "JWT", "Vercel"]
  - Patterns: ["TDD"]
  - Phases: Infers from constraints
- Check file: cat .dincoder/plan.json
```

### Phase 4: Task Management Tests

#### 5. Generate Tasks (tasks_generate)
**Purpose**: Create actionable tasks from scope
```
Test command: Use tasks_generate tool with:
- scope: "Setup project structure, implement user model, create authentication endpoints, add login UI, write tests"

Expected behavior:
- Updates .dincoder/tasks.json with generated tasks
- Each task has:
  - id (UUID)
  - title
  - status: "pending"
  - dependencies: []
  - createdAt timestamp
- Check file: cat .dincoder/tasks.json
```

#### 6. Update Task Status (tasks_tick)
**Purpose**: Mark a task as completed
```
Test command: 
1. First check task IDs: cat .dincoder/tasks.json
2. Use tasks_tick tool with the first task's ID

Expected behavior:
- Updates task status to "completed"
- Sets completedAt timestamp
- Returns success message with task title
```

### Phase 5: Research Documentation Tests

#### 7. Add Research Notes (research_append)
**Purpose**: Document research findings
```
Test command: Use research_append tool with:
- content: "## Authentication Research\n\n- JWT provides stateless authentication\n- Refresh tokens should be stored securely\n- Consider OAuth2 for social login"

Expected behavior:
- Appends to .dincoder/research.md
- Adds timestamp header
- Check file: cat .dincoder/research.md
```

### Phase 6: Artifact Reading Tests

#### 8. Read All Artifacts (artifacts_read)
**Purpose**: Retrieve all project artifacts
```
Test command: Use artifacts_read tool

Expected output:
- Returns JSON with all artifacts:
  - spec: Contents of spec.json
  - plan: Contents of plan.json
  - tasks: Contents of tasks.json
  - research: Contents of research.md
```

### Phase 7: Git Integration Tests

#### 9. Create Feature Branch (git_create_branch)
**Purpose**: Create and switch to a new git branch
```
Test command: Use git_create_branch tool with:
- branchName: "feature/authentication"

Expected behavior:
- Creates new branch
- Switches to the branch
- Returns confirmation message
- Verify: git branch
```

#### 10. Check Git Status (git_check_status)
**Purpose**: Get current git repository status
```
Test command: Use git_check_status tool

Expected output:
- Current branch name
- List of modified files
- List of untracked files (should include .dincoder/)
- Staging status
```

### Phase 8: Error Handling Tests

#### 11. Test Invalid Inputs
**Purpose**: Verify error handling

##### Test 11a: Invalid Project Path
```
Test command: Use specify_start with:
- projectName: "test"
- agent: "claude"
- path: "/nonexistent/path"

Expected: Error message about directory not existing
```

##### Test 11b: Task Not Found
```
Test command: Use tasks_tick with:
- taskId: "invalid-uuid"

Expected: "Task not found" error message
```

##### Test 11c: Git Branch Already Exists
```
Test command: Use git_create_branch with:
- branchName: "main"

Expected: Error about branch already existing
```

## Verification Checklist

After running all tests, verify:

- [ ] `.dincoder/` directory exists with all 4 files
- [ ] `spec.json` contains project details
- [ ] `plan.json` has technologies and patterns extracted
- [ ] `tasks.json` has generated tasks with proper structure
- [ ] `research.md` contains appended research notes
- [ ] Git branch was created successfully
- [ ] All tools return appropriate error messages for invalid inputs

## Common Issues and Solutions

### Issue: Tools not appearing in Claude Desktop
**Solution**: Restart Claude Desktop after updating the MCP server

### Issue: "Command not found" errors
**Solution**: Ensure `npx mcp-dincoder` works in terminal first

### Issue: Permission denied errors
**Solution**: Check directory permissions, ensure write access to test directory

### Issue: Git operations failing
**Solution**: 
1. Ensure git is initialized: `git init`
2. Create initial commit: `git add . && git commit -m "Initial"`
3. Check for uncommitted changes: `git status`

## Expected Success Criteria

✅ All 15 tools respond without errors
✅ File system operations create expected structure
✅ JSON files are properly formatted
✅ Git operations work with clean repository
✅ Error messages are helpful and actionable
✅ Tool descriptions appear in Claude Desktop UI

## Testing Report Template

```markdown
## DinCoder v0.1.6 Test Results

Date: [DATE]
Tester: [NAME]
Environment: Claude Desktop [VERSION]

### Tool Test Results

| Tool | Status | Notes |
|------|--------|-------|
| test_echo | ✅/❌ | |
| specify_start | ✅/❌ | |
| specify_describe | ✅/❌ | |
| plan_create | ✅/❌ | |
| tasks_generate | ✅/❌ | |
| tasks_tick | ✅/❌ | |
| research_append | ✅/❌ | |
| artifacts_read | ✅/❌ | |
| git_create_branch | ✅/❌ | |
| git_check_status | ✅/❌ | |

### Issues Found
1. [Issue description and steps to reproduce]

### Recommendations
1. [Suggested improvements]
```

## Quick Test Script

For automated testing, you can use this sequence in Claude Desktop:

1. "Use test_echo tool with message 'Testing v0.1.6'"
2. "Use specify_start tool to initialize project 'test-app' with agent 'claude' in current directory"
3. "Use specify_describe tool to describe project as 'A modern web application with authentication and real-time features'"
4. "Use plan_create tool with constraints 'Use Next.js, TypeScript, Tailwind CSS, PostgreSQL, implement CI/CD'"
5. "Use tasks_generate tool with scope 'Setup development environment, create database schema, implement auth system'"
6. "Use artifacts_read tool to show all project files"
7. "Use git_check_status tool to check repository status"

## Support

If you encounter issues not covered in this guide:
1. Check the server logs: The MCP server logs to stderr
2. Verify the version: Should be 0.1.6
3. Report issues: https://github.com/dincoder/mcp-server/issues

---

*This testing guide covers all functionality added in v0.1.6, including the fixes for tool naming patterns and the new `.dincoder` directory structure.*