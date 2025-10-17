# OpenAI Codex Integration Guide

**Integration Strategy D: OpenAI Codex + DinCoder MCP Server**

This guide shows how to integrate DinCoder with OpenAI Codex (CLI and IDE extension) for spec-driven development workflows.

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

DinCoder integrates with OpenAI Codex through:
- **MCP Server** - Configured via `~/.codex/config.toml`
- **CLI Support** - Direct command-line usage
- **IDE Extension** - Integration with VS Code/Cursor/Windsurf
- **MCP Prompts** - Workflow commands (`/mcp.dincoder.*`)
- **Shared Config** - Same setup for CLI and extension

### Benefits

✅ **CLI and IDE support** - Works in both environments
✅ **Shared config** - Same setup for CLI and extension
✅ **Prompt support** - MCP prompts as workflow commands
✅ **OAuth support** - For future cloud integrations
✅ **Flexible approval modes** - agent, chat, or full-access

---

## Prerequisites

Before you begin, ensure you have:

1. **OpenAI Codex** installed (CLI or IDE extension)
2. **Node.js** 20 or later (for running the MCP server)
3. **npm** or **npx** available
4. **Git** installed

### Install OpenAI Codex

**CLI:**
```bash
# Install via npm (if available)
npm install -g @openai/codex-cli

# Or follow OpenAI's official installation guide
```

**IDE Extension:**
- **VS Code**: Install from Extensions marketplace
- **Cursor**: Built-in Codex support
- **Windsurf**: Install Codex extension

### Verify Installation

```bash
# Check Codex CLI
codex --version

# Check Node.js
node --version
# Should output: v20.x.x or higher

# Check npm/npx
npx --version
```

---

## Quick Start

### Option 1: CLI Installation (Recommended)

Add DinCoder MCP server via Codex CLI:

```bash
# Add DinCoder MCP server
codex mcp add dincoder -- npx -y mcp-dincoder@latest

# Verify installation
codex mcp list
# Should show: dincoder
```

### Option 2: Manual Configuration

1. **Locate config file:**
   ```bash
   # Config location
   ~/.codex/config.toml
   ```

2. **Edit config.toml:**
   ```toml
   [mcp_servers.dincoder]
   command = "npx"
   args = ["-y", "mcp-dincoder@latest"]

   # Optional: Timeout configuration
   startup_timeout_sec = 30
   tool_timeout_sec = 120
   ```

3. **Restart Codex:**
   ```bash
   # CLI: Restart terminal session
   # IDE: Reload window or restart extension
   ```

### Option 3: IDE Extension Setup

**In VS Code/Cursor/Windsurf:**

1. Click gear icon in Codex panel
2. Select "MCP settings → Open config.toml"
3. Add DinCoder server configuration (see above)
4. Restart Codex

---

## Configuration Files

### `~/.codex/config.toml` (Global Configuration)

**Basic Configuration:**
```toml
[mcp_servers.dincoder]
command = "npx"
args = ["-y", "mcp-dincoder@latest"]
```

**Advanced Configuration:**
```toml
[mcp_servers.dincoder]
command = "npx"
args = ["-y", "mcp-dincoder@0.5.0"]

# Timeout settings (optional)
startup_timeout_sec = 30
tool_timeout_sec = 120

# Environment variables (optional)
[mcp_servers.dincoder.env]
NODE_ENV = "development"
LOG_LEVEL = "info"

# Approval mode (optional)
approval_mode = "chat"  # Options: "agent", "chat", "full-access"
```

**Approval Modes:**
- `"agent"` - Codex decides when to use tools (most autonomous)
- `"chat"` - Ask user before each tool use (balanced)
- `"full-access"` - No confirmation required (least safe)

### `.codex/instructions.md` (Workspace Configuration)

Create this file in your project root to provide Codex with project-specific context:

```markdown
# DinCoder Spec-Driven Development

This project uses DinCoder MCP server for structured development workflows.

## Available Tools

The DinCoder MCP server provides 26 tools organized by phase:

### Project Setup
- `specify_start` - Initialize .dincoder/ directory
- `prereqs_check` - Verify Node.js, npm, git availability
- `constitution_create` - Define project principles

### Specification Phase (WHAT)
- `specify_describe` - Create detailed specification
- `spec_validate` - Check quality (4 validation rules)
- `spec_refine` - Update specific sections
- `clarify_add/resolve/list` - Manage ambiguities

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
- `quality_format/lint/test` - Code quality checks
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

## Best Practices

**Specifications:**
- Focus on WHAT, not HOW
- Include testable acceptance criteria (when/then statements)
- Flag assumptions as clarifications
- Be explicit about out-of-scope items

**Tasks:**
- Keep atomic (completable in one session)
- Add metadata (phase, type, priority, effort)
- Use dependencies to enforce order
- Update status regularly

**Progress:**
- Run `tasks_stats` regularly
- Focus on unblocked tasks
- Visualize dependencies before starting
- Celebrate completed milestones
```

---

## Usage

### CLI Usage

**Using MCP Prompts:**

```bash
# Start a new project
codex "use /mcp.dincoder.start_project my-app"

# Create specification
codex "use /mcp.dincoder.create_spec 'Build a REST API for task management'"

# Generate implementation plan
codex "use /mcp.dincoder.generate_plan"

# Create actionable tasks
codex "use /mcp.dincoder.create_tasks"

# Check progress
codex "use /mcp.dincoder.review_progress"

# Validate spec quality
codex "use /mcp.dincoder.validate_spec"

# Show next tasks
codex "use /mcp.dincoder.next_tasks"
```

**Using Tools Directly:**

```bash
# Initialize project
codex "Initialize .dincoder directory for my-app using specify_start"

# Create specification
codex "Create a specification for user authentication using specify_describe"

# Generate plan
codex "Generate an implementation plan using plan_create"

# Create tasks
codex "Generate tasks from the plan using tasks_generate"

# Show statistics
codex "Show project progress using tasks_stats"
```

### IDE Extension Usage

In Codex panel (VS Code/Cursor/Windsurf):

1. **Open Codex Chat**
2. **Use natural language** - Codex will discover and use tools automatically
3. **Reference tools explicitly** (optional):
   ```
   @dincoder.specify_start
   @dincoder.tasks_filter
   ```

---

## Troubleshooting

### Server Not Found

**Problem:** `codex mcp list` doesn't show dincoder

**Solutions:**
1. Verify config.toml exists: `cat ~/.codex/config.toml`
2. Check syntax is valid TOML
3. Restart terminal/Codex
4. Try manual installation: `npx -y mcp-dincoder@latest` to verify server works

### Command Not Recognized

**Problem:** `codex: command not found`

**Solutions:**
1. Install Codex CLI: Follow OpenAI's installation guide
2. Check PATH includes Codex binary
3. Restart terminal after installation
4. Use full path to Codex binary if needed

### MCP Prompts Not Working

**Problem:** `/mcp.dincoder.*` commands not recognized

**Solutions:**
1. Ensure MCP server is configured in config.toml
2. Check server is running: `codex mcp list`
3. Try restarting Codex
4. Verify Node.js is available: `node --version`

### Permission Denied

**Problem:** Codex can't execute npx command

**Solutions:**
1. Check npm/npx permissions: `which npx`
2. Try global install: `npm install -g mcp-dincoder`
3. Update config.toml to use `mcp-dincoder` instead of `npx`
4. Check firewall/antivirus isn't blocking Node.js

### Server Timeout

**Problem:** "Server took too long to start"

**Solutions:**
1. Increase timeout in config.toml:
   ```toml
   [mcp_servers.dincoder]
   startup_timeout_sec = 60  # Default: 30
   tool_timeout_sec = 180     # Default: 120
   ```
2. Pre-install package: `npm install -g mcp-dincoder`
3. Check network connectivity (npx downloads on first run)

### Tools Not Discovered

**Problem:** Codex doesn't see DinCoder tools

**Solutions:**
1. Verify server is in `codex mcp list`
2. Check logs: `codex mcp logs dincoder`
3. Test server manually: `npx -y mcp-dincoder@latest`
4. Restart Codex after config changes

---

## Best Practices

### 1. Pin Version for Stability

For production projects:

```toml
[mcp_servers.dincoder]
command = "npx"
args = ["-y", "mcp-dincoder@0.5.0"]  # Specific version
```

### 2. Use Workspace Instructions

Create `.codex/instructions.md` in each project with:
- Project-specific workflow
- Custom task metadata conventions
- Team conventions

### 3. Configure Approval Mode

Choose based on your workflow:

```toml
# Most autonomous (Codex decides when to use tools)
approval_mode = "agent"

# Balanced (Ask before each tool use)
approval_mode = "chat"

# Least safe (No confirmation required)
approval_mode = "full-access"
```

### 4. Regular Updates

Update DinCoder periodically:

```bash
# Check current version
npx -y mcp-dincoder@latest --version

# Update via CLI
codex mcp update dincoder

# Or update config.toml to @latest
```

### 5. Share Configuration

Commit `.codex/instructions.md` to git for team consistency:

```bash
git add .codex/instructions.md
git commit -m "Add Codex instructions for DinCoder workflow"
```

### 6. Monitor Resource Usage

DinCoder runs as a subprocess. Monitor with:

```bash
# View server logs
codex mcp logs dincoder

# Check server status
codex mcp status

# Restart server if needed
codex mcp restart dincoder
```

---

## Example Workflow

### Starting a New Feature

```bash
# 1. Create specification
codex "use /mcp.dincoder.create_spec 'Add user authentication'"

# 2. Validate specification
codex "use /mcp.dincoder.validate_spec"

# 3. Generate implementation plan
codex "use /mcp.dincoder.generate_plan"

# 4. Create actionable tasks
codex "use /mcp.dincoder.create_tasks"

# 5. Show next tasks to work on
codex "use /mcp.dincoder.next_tasks"

# 6. Start working on tasks...
# (Codex helps implement)

# 7. Track progress
codex "use /mcp.dincoder.review_progress"
```

### Daily Workflow

```bash
# Morning: Check what to work on
codex "use /mcp.dincoder.next_tasks"

# Work on tasks throughout the day
codex "Help me implement task T042"

# Evening: Review progress
codex "use /mcp.dincoder.review_progress"
```

---

## File Structure

After setup, your project will have:

```
my-project/
├── .codex/
│   └── instructions.md       # Codex workspace instructions
├── .dincoder/                # Generated by DinCoder
│   ├── spec.md               # Project specification
│   ├── plan.md               # Implementation plan
│   ├── tasks.md              # Task list
│   ├── research.md           # Technical decisions
│   └── constitution.json     # Project principles
└── ...
```

**Global config:**
```
~/.codex/
└── config.toml               # MCP server configuration
```

---

## Quality Gates

DinCoder enforces quality at each phase:

- ✅ **Spec Validation** - Before planning (`spec_validate`)
- ✅ **Plan-Spec Alignment** - Before tasks (`artifacts_analyze`)
- ✅ **Dependency Check** - Before starting tasks (`tasks_visualize`)
- ✅ **Progress Review** - Regularly during execution (`tasks_stats`)

---

## Advanced Configuration

### OAuth Support (Experimental)

For cloud-hosted projects:

```toml
[mcp_servers.dincoder]
command = "npx"
args = ["-y", "mcp-dincoder@latest"]
oauth_enabled = true  # Experimental feature
```

### Custom Environment Variables

```toml
[mcp_servers.dincoder.env]
NODE_ENV = "production"
LOG_LEVEL = "warn"
DINCODER_WORKSPACE = "/path/to/workspace"
```

### Multiple Projects

Configure different servers for different projects:

```toml
[mcp_servers.dincoder_project_a]
command = "npx"
args = ["-y", "mcp-dincoder@0.5.0"]

[mcp_servers.dincoder_project_b]
command = "npx"
args = ["-y", "mcp-dincoder@0.4.0"]
```

---

## Additional Resources

- **DinCoder GitHub**: https://github.com/flight505/MCP_DinCoder
- **npm Package**: https://www.npmjs.com/package/mcp-dincoder
- **Integration Strategy**: See INTEGRATION_STRATEGY.md in main repo
- **OpenAI Codex Docs**: https://developers.openai.com/codex/

---

## Support

If you encounter issues:

1. Check this troubleshooting guide first
2. View server logs: `codex mcp logs dincoder`
3. Search existing issues: https://github.com/flight505/MCP_DinCoder/issues
4. Create new issue with:
   - Codex version (`codex --version`)
   - Node.js version (`node --version`)
   - Error messages
   - `~/.codex/config.toml` content (redact sensitive info)

---

**Last Updated:** 2025-10-17
**DinCoder Version:** 0.5.0
**Codex Version:** Latest
