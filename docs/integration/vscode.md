# VS Code Integration Guide

**Integration Strategy C: GitHub Copilot + DinCoder MCP Server**

This guide shows how to integrate DinCoder with VS Code and GitHub Copilot for spec-driven development workflows.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Configuration Files](#configuration-files)
5. [Usage](#usage)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Overview

DinCoder integrates seamlessly with VS Code through:
- **MCP Server** - Automatic tool discovery via `.vscode/mcp.json`
- **GitHub Copilot** - Native integration with Copilot Chat
- **MCP Prompts** - Workflow slash commands (`/mcp.dincoder.*`)
- **Workspace Config** - Shareable configuration via git

### Benefits

✅ **Native VS Code integration** - No separate installations
✅ **GitHub Copilot compatibility** - Works with existing workflows
✅ **Workspace-level config** - Shareable via git
✅ **Enterprise-friendly** - IT can deploy managed configs
✅ **Autodiscovery** - Detects Claude Desktop configs

---

## Prerequisites

Before you begin, ensure you have:

1. **VS Code** installed (version 1.80 or later)
2. **GitHub Copilot** subscription (Free, Pro, or Enterprise)
3. **Node.js** 20 or later (for running the MCP server)
4. **Git** installed

### Verify Installation

```bash
# Check Node.js version
node --version
# Should output: v20.x.x or higher

# Check npm
npm --version

# Check git
git --version
```

---

## Quick Start

### 1. Create Configuration Files

In your project root, create a `.vscode/` directory:

```bash
mkdir -p .vscode
```

### 2. Create `.vscode/mcp.json`

```json
{
  "mcpServers": {
    "dincoder": {
      "command": "npx",
      "args": ["-y", "mcp-dincoder@latest"],
      "env": {}
    }
  }
}
```

### 3. Create `.vscode/settings.json`

```json
{
  "chat.mcp.access": "registry",
  "chat.mcp.discovery.enabled": true,
  "chat.mcp.approval": "workspace"
}
```

### 4. Create `.github/copilot-instructions.md` (Optional but Recommended)

This file provides context to Copilot about the DinCoder workflow:

```markdown
# DinCoder Spec-Driven Development

This project uses DinCoder for spec-driven development workflows.

## Available MCP Tools

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
- `tasks_visualize` - Show dependency graphs
- `tasks_filter` - Smart filtering
- `tasks_search` - Fuzzy search across tasks
- `tasks_stats` - Progress analytics
- `tasks_tick` - Mark single task complete
- `tasks_tick_range` - Batch completion

## MCP Prompts (Slash Commands)

Use these in Copilot Chat (agent mode):

- `/mcp.dincoder.start_project` - Initialize new project
- `/mcp.dincoder.create_spec` - Create specification
- `/mcp.dincoder.generate_plan` - Generate implementation plan
- `/mcp.dincoder.create_tasks` - Generate task list
- `/mcp.dincoder.review_progress` - View progress report
- `/mcp.dincoder.validate_spec` - Check spec quality
- `/mcp.dincoder.next_tasks` - Show next actionable tasks

## Workflow

1. **Specify** - Define what to build
2. **Plan** - Design how to build it
3. **Execute** - Build following tasks
4. **Track** - Monitor progress
```

### 5. Reload VS Code

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run: `Developer: Reload Window`
3. Open Copilot Chat panel
4. Click tools icon → verify "dincoder" appears

---

## Configuration Files

### `.vscode/mcp.json` (Required)

This file tells VS Code where to find the DinCoder MCP server.

**Basic Configuration:**
```json
{
  "mcpServers": {
    "dincoder": {
      "command": "npx",
      "args": ["-y", "mcp-dincoder@latest"]
    }
  }
}
```

**Advanced Configuration (with environment variables):**
```json
{
  "mcpServers": {
    "dincoder": {
      "command": "npx",
      "args": ["-y", "mcp-dincoder@0.5.0"],
      "env": {
        "NODE_ENV": "development",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### `.vscode/settings.json` (Recommended)

Controls MCP behavior in VS Code.

```json
{
  "chat.mcp.access": "registry",
  "chat.mcp.discovery.enabled": true,
  "chat.mcp.approval": "workspace"
}
```

**Settings Explained:**
- `chat.mcp.access: "registry"` - Allow MCP servers from registry
- `chat.mcp.discovery.enabled: true` - Auto-discover MCP configs
- `chat.mcp.approval: "workspace"` - Require approval per workspace

### `.github/copilot-instructions.md` (Optional)

Provides Copilot with project-specific context. This file is automatically read by GitHub Copilot.

---

## Usage

### Using Slash Commands

In Copilot Chat, use MCP prompt slash commands:

```
# Start a new project
/mcp.dincoder.start_project my-app

# Create a specification
/mcp.dincoder.create_spec "Build a REST API for task management"

# Generate implementation plan
/mcp.dincoder.generate_plan

# Create actionable tasks
/mcp.dincoder.create_tasks

# Check progress
/mcp.dincoder.review_progress

# Validate spec quality
/mcp.dincoder.validate_spec

# Show next tasks
/mcp.dincoder.next_tasks
```

### Using Tools Directly

Reference tools with `#` in Copilot Chat:

```
# Initialize project
#dincoder.specify_start

# Create specification
#dincoder.specify_describe

# Generate plan
#dincoder.plan_create

# Create tasks
#dincoder.tasks_generate

# Show progress
#dincoder.tasks_stats
```

### Adding Context

Include DinCoder artifacts as context:

1. Click "Add Context" in Copilot Chat
2. Select "MCP Resources"
3. Choose:
   - `dincoder/spec.md` - Project specification
   - `dincoder/plan.md` - Implementation plan
   - `dincoder/tasks.md` - Task list

---

## Troubleshooting

### MCP Server Not Appearing

**Problem:** DinCoder doesn't show up in Copilot Chat tools

**Solutions:**
1. Verify `.vscode/mcp.json` exists and is valid JSON
2. Check Node.js is installed: `node --version`
3. Reload VS Code window: `Cmd+Shift+P` → `Developer: Reload Window`
4. Check Copilot extension is updated
5. Try manual installation: `npx -y mcp-dincoder@latest` to verify server works

### Permission Denied Errors

**Problem:** VS Code shows permission dialogs for MCP server

**Solutions:**
1. Check `.vscode/settings.json` has `"chat.mcp.approval": "workspace"`
2. Click "Allow for this workspace" when prompted
3. Add workspace to trusted workspaces

### Slash Commands Not Working

**Problem:** `/mcp.dincoder.*` commands not recognized

**Solutions:**
1. Ensure you're in Copilot Chat **agent mode** (not inline mode)
2. Type `/` to see available commands - verify `mcp.dincoder` appears
3. Check MCP server is running: Look for "dincoder" in tools list
4. Try refreshing tools: Reload window

### Server Timeout

**Problem:** MCP server takes too long to start

**Solutions:**
1. Pre-install package: `npm install -g mcp-dincoder`
2. Update mcp.json to use local installation:
   ```json
   {
     "mcpServers": {
       "dincoder": {
         "command": "mcp-dincoder"
       }
     }
   }
   ```
3. Increase timeout in settings (if available)

### Tools Not Discovered

**Problem:** Copilot doesn't see DinCoder tools

**Solutions:**
1. Verify `"chat.mcp.discovery.enabled": true` in settings
2. Check server logs in Output panel (View → Output → MCP)
3. Test server manually: `npx -y mcp-dincoder@latest`
4. Ensure firewall isn't blocking localhost connections

---

## Best Practices

### 1. Commit Configuration to Git

Add VS Code config to version control:

```bash
git add .vscode/mcp.json .vscode/settings.json .github/copilot-instructions.md
git commit -m "Add DinCoder MCP configuration for VS Code"
```

**Benefits:**
- Team members get same setup automatically
- Configuration travels with project
- Easier onboarding for new developers

### 2. Use Workspace-Specific Settings

Keep MCP settings at workspace level (`.vscode/settings.json`) rather than user settings to avoid conflicts across projects.

### 3. Version Lock for Stability

For production projects, pin to specific version:

```json
{
  "mcpServers": {
    "dincoder": {
      "command": "npx",
      "args": ["-y", "mcp-dincoder@0.5.0"]
    }
  }
}
```

### 4. Update Copilot Instructions

Keep `.github/copilot-instructions.md` updated with:
- Project-specific workflow preferences
- Custom task metadata conventions
- Team-specific clarification processes

### 5. Regular Updates

Update DinCoder periodically:

```bash
# Check current version
npx -y mcp-dincoder@latest --version

# Update to latest
npm install -g mcp-dincoder@latest

# Or use @latest in mcp.json to auto-update
```

### 6. Team Consistency

Ensure all team members:
- Use same DinCoder version
- Have same VS Code/Copilot setup
- Commit .dincoder/ directory to git for shared context

---

## Example Workflow

### Starting a New Feature

```
1. Open Copilot Chat
2. Type: /mcp.dincoder.create_spec "Add user authentication"
3. Answer Copilot's clarifying questions
4. Review generated spec.md
5. Type: /mcp.dincoder.validate_spec
6. Fix any validation issues
7. Type: /mcp.dincoder.generate_plan
8. Review plan.md
9. Type: /mcp.dincoder.create_tasks
10. Start working on tasks from /mcp.dincoder.next_tasks
```

### Daily Workflow

```
1. Open project in VS Code
2. Copilot Chat: /mcp.dincoder.next_tasks
3. Work on highest-priority unblocked task
4. Mark complete when done
5. End of day: /mcp.dincoder.review_progress
```

---

## File Structure

After setup, your project will have:

```
my-project/
├── .vscode/
│   ├── mcp.json              # MCP server config
│   └── settings.json         # VS Code MCP settings
├── .github/
│   └── copilot-instructions.md # Context for Copilot
├── .dincoder/                # Generated by DinCoder
│   ├── spec.md               # Project specification
│   ├── plan.md               # Implementation plan
│   ├── tasks.md              # Task list
│   ├── research.md           # Technical decisions
│   └── constitution.json     # Project principles
└── ...
```

---

## Quality Gates

DinCoder enforces quality at each phase:

- ✅ **Spec Validation** - Before planning (`spec_validate`)
- ✅ **Plan-Spec Alignment** - Before tasks (`artifacts_analyze`)
- ✅ **Dependency Check** - Before starting tasks (`tasks_visualize`)
- ✅ **Progress Review** - Regularly during execution (`tasks_stats`)

---

## Additional Resources

- **DinCoder GitHub**: https://github.com/flight505/MCP_DinCoder
- **npm Package**: https://www.npmjs.com/package/mcp-dincoder
- **Integration Strategy**: See INTEGRATION_STRATEGY.md in main repo
- **VS Code MCP Docs**: https://code.visualstudio.com/docs/copilot/customization/mcp-servers

---

## Support

If you encounter issues:

1. Check this troubleshooting guide first
2. Search existing issues: https://github.com/flight505/MCP_DinCoder/issues
3. Create new issue with:
   - VS Code version
   - Copilot version
   - Node.js version
   - Error messages
   - `.vscode/mcp.json` content

---

**Last Updated:** 2025-10-17
**DinCoder Version:** 0.5.0
**VS Code Version:** 1.80+
