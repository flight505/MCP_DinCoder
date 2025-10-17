# OpenAI Codex Template

This template provides configuration files for integrating DinCoder with OpenAI Codex (CLI and IDE extension).

## Files Included

- `config.toml` - Codex MCP server configuration (for `~/.codex/config.toml`)
- `.codex/instructions.md` - Workspace-specific instructions

## Installation

### Option 1: CLI (Recommended)

```bash
# Add DinCoder MCP server
codex mcp add dincoder -- npx -y mcp-dincoder@latest

# Verify
codex mcp list
```

### Option 2: Manual Configuration

1. **Copy global config:**
   ```bash
   cp templates/codex/config.toml ~/.codex/config.toml
   ```

2. **Copy workspace instructions:**
   ```bash
   cp templates/codex/.codex your-project/
   ```

3. **Restart Codex:**
   ```bash
   # CLI: Restart terminal
   # IDE: Reload window
   ```

## Usage

### CLI Commands

```bash
# Start a new project
codex "use /mcp.dincoder.start_project my-app"

# Create specification
codex "use /mcp.dincoder.create_spec 'Build a REST API'"

# Generate plan
codex "use /mcp.dincoder.generate_plan"

# Create tasks
codex "use /mcp.dincoder.create_tasks"

# Check progress
codex "use /mcp.dincoder.review_progress"
```

### IDE Extension

In Codex panel:

```
@dincoder.specify_start
@dincoder.tasks_filter preset="next"
```

## Documentation

See full integration guide: [docs/integration/codex.md](../../docs/integration/codex.md)

## Troubleshooting

- **Server not found?** Check `~/.codex/config.toml` syntax
- **Command not recognized?** Ensure Codex CLI is installed
- **Permission errors?** Check npm/npx permissions
- **Timeout?** Increase `startup_timeout_sec` in config.toml
