# Publishing DinCoder v0.4.1 to NPM

## Pre-Publish Checklist

✅ Documentation fixes complete:
- README.md MCP Prompts section corrected
- CLAUDE.md clarification added
- Version in package.json: 0.4.1

⚠️ **Package NOT yet published to npm** - verified via web search

## Publishing Steps

### 1. Verify Build

```bash
npm run build:local
```

Expected output: Successful TypeScript compilation to `dist/` directory

### 2. Run Quality Checks

```bash
npm run lint
npm run test
```

Expected: All tests pass, no linting errors

### 3. Test Package Contents

```bash
npm pack --dry-run
```

Review files that will be included in the package.

### 4. Login to NPM (if not already logged in)

```bash
npm login
```

Enter your npm credentials.

### 5. Publish to NPM

```bash
npm publish --access public
```

**Note:** Use `--access public` because this is a public package.

### 6. Verify Publication

After publishing, verify at:
- https://www.npmjs.com/package/mcp-dincoder

Check that version 0.4.1 is live and README displays correctly.

### 7. Test Installation

In a different directory:

```bash
# Test global install
npm install -g mcp-dincoder@latest

# Verify version
npx mcp-dincoder --version

# Test with Claude Code
claude mcp add dincoder -- npx -y mcp-dincoder@latest
```

### 8. Test MCP Prompts Discovery

After installing in Claude Code:

1. Start a chat in Claude Code
2. Say: "Let's start a new project called test-app"
3. **Expected:** Claude should automatically use the `start_project` prompt workflow
4. **Verify:** Claude calls `specify_start` tool and guides you through setup

**Note:** You won't see a slash command - the AI will just start helping you with the workflow!

## Post-Publish Tasks

### Update Smithery

If the package is on Smithery, users can install via:

```bash
npx -y @smithery/cli install @flight505/mcp_dincoder
```

Verify the Smithery listing shows the correct version and documentation.

### Create Git Tag

```bash
git tag -a v0.4.1 -m "v0.4.1 - Documentation fixes for MCP prompts"
git push origin main --tags
```

### Create GitHub Release

Using GitHub CLI:

```bash
gh release create v0.4.1 \
  --title "v0.4.1 - Documentation Fixes" \
  --notes "## Documentation Fixes

- Fixed README.md MCP Prompts section - clarified they're AI workflows, not slash commands
- Added critical clarification to CLAUDE.md about MCP prompts vs slash commands
- Corrected misconception about @ syntax in Claude Code
- Explained how MCP prompts work programmatically via prompts/list and prompts/get

## What Changed

**Before:** Documentation incorrectly suggested users type @mcp__dincoder__start_project
**Now:** Documentation correctly explains AI agents automatically use prompts when users describe goals

## No Code Changes

This is a documentation-only release. Functionality remains the same as v0.4.0."
```

Or create manually at: https://github.com/flight505/mcp-dincoder/releases/new

## Troubleshooting

### If publish fails with "You do not have permission to publish"

1. Verify you're logged in: `npm whoami`
2. Verify package name isn't taken: `npm view mcp-dincoder`
3. If name is taken, change package name in package.json

### If prompts don't appear after install

1. Verify MCP server is connected: check Claude Code MCP settings
2. Check server logs for errors
3. Test with MCP inspector tool
4. Verify prompts are registered: check src/server/prompts.ts

### If README doesn't render correctly on npm

NPM uses a specific Markdown renderer. Test locally:

```bash
npm pack
tar -xzf mcp-dincoder-0.4.1.tgz
cat package/README.md | head -100
```

## Success Criteria

✅ Package published to npm
✅ Version 0.4.1 visible on npm registry
✅ README displays correctly on npm page
✅ Package installable via `npm install -g mcp-dincoder`
✅ MCP prompts discoverable by AI agents
✅ Git tag created and pushed
✅ GitHub release created with documentation

---

**Current Status:** Ready to publish!
**Blocking Issues:** None
**Estimated Time:** 15 minutes
