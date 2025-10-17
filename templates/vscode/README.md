# VS Code + Copilot Template

This template provides configuration files for integrating DinCoder with VS Code and GitHub Copilot.

## Files Included

- `.vscode/mcp.json` - MCP server configuration
- `.vscode/settings.json` - VS Code MCP settings
- `.github/copilot-instructions.md` - Context for GitHub Copilot

## Installation

1. **Copy files to your project:**
   ```bash
   cp -r templates/vscode/.vscode your-project/
   cp -r templates/vscode/.github your-project/
   ```

2. **Open project in VS Code:**
   ```bash
   cd your-project
   code .
   ```

3. **Reload window:**
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Run: `Developer: Reload Window`

4. **Verify setup:**
   - Open Copilot Chat
   - Click tools icon
   - Verify "dincoder" appears in tools list

## Usage

In Copilot Chat, use MCP prompts:

```
/mcp.dincoder.start_project my-app
/mcp.dincoder.create_spec "Build a task management API"
/mcp.dincoder.generate_plan
/mcp.dincoder.create_tasks
```

Or reference tools directly:

```
#dincoder.specify_start
#dincoder.tasks_stats
```

## Documentation

See full integration guide: [docs/integration/vscode.md](../../docs/integration/vscode.md)

## Troubleshooting

- **Server not appearing?** Reload VS Code window
- **Permission errors?** Check `.vscode/settings.json` has correct approval mode
- **Slash commands not working?** Ensure you're in Copilot Chat agent mode
