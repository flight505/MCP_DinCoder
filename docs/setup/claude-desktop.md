# Claude Desktop Setup Guide for MCP DinCoder

## Installation Methods

### Method 1: Using npx (Recommended - No Installation Required)

Configure Claude Desktop with npx:
```json
{
  "mcp": {
    "servers": {
      "dincoder": {
        "type": "stdio",
        "command": "npx",
        "args": ["mcp-dincoder@latest"]
      }
    }
  }
}
```

### Method 2: Global NPM Installation

Configure Claude Desktop with npx:
```json
{
  "mcp": {
    "servers": {
      "dincoder": {
        "command": "npx",
        "args": ["mcp-dincoder@latest"]
      }
    }
  }
}
```

### Method 3: Local Development

If you're developing locally:
```json
{
  "mcp": {
    "servers": {
      "dincoder": {
        "command": "node",
        "args": ["/path/to/your/MCP_DinCoder/dist/index-stdio.js"]
      }
    }
  }
}
```

## Verifying Installation

1. After updating `~/.claude.json`, restart Claude Desktop
2. Check the MCP status in Claude Desktop settings
3. The server should show as "running" with a green indicator

## Troubleshooting

### Server Shows as Failed

1. **Check Node.js version**: Ensure you have Node.js >= 20
   ```bash
   node --version
   ```

2. **Verify installation**:
   ```bash
   # For global install
   npm list -g mcp-dincoder
   
   # Test the command
   which mcp-dincoder
   ```

3. **Test the server manually**:
   ```bash
   # This should start and wait for input
   mcp-dincoder
   # Press Ctrl+C to exit
   ```

4. **Check Claude logs**: Look for error messages in Claude Desktop's developer console

### Common Issues

- **Permission errors**: On macOS/Linux, you might need to use `sudo` for global install
- **Path issues**: Ensure npm's global bin directory is in your PATH
- **Node version**: The server requires Node.js 20 or higher

## Available Tools

Once configured, you'll have access to all DinCoder tools:
- `specify_start`, `specify_describe`
- `plan_create`
- `tasks_generate`, `tasks_tick`, `tasks_list`
- `artifacts_read`
- `research_append`, `research_read`
- `git_create_branch`, `git_status`, `git_commit`, `git_list_branches`
- Quality tools: `quality_format`, `quality_lint`, `quality_test`, etc.

## Support

For issues or questions:
- GitHub: https://github.com/dincoder/mcp-server/issues
- NPM: https://www.npmjs.com/package/mcp-dincoder