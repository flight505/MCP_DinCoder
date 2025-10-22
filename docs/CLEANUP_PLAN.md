# MCP DinCoder - Repository Cleanup Plan

## Issues Found

### 1. ❌ `.claude/` directory in repo (should be ignored)
- Location: `.claude/` in root
- Issue: Claude Code IDE files shouldn't be in Git
- Action: Add to .gitignore, remove from repo

### 2. ❌ `.dincoder/` directory in repo (test artifacts)
- Location: `.dincoder/` in root
- Issue: Test-generated specs from running tools on itself
- Action: Add to .gitignore, remove from repo

### 3. ❌ Loose documentation files in root
Files that should be in `docs/`:
- `CLAUDE_DESKTOP_SETUP.md` → `docs/setup/claude-desktop.md`
- `DINCODER_TEST_REPORT.md` → `docs/testing/test-report-2025-10-13.md`
- `INTEGRATION_STRATEGY.md` → `docs/integration/strategy.md`
- `TESTING_GUIDE.md` → `docs/testing/guide.md`

### 4. ❌ Outdated documentation in `docs/`
Files to review:
- `docs/stdio-migration-guide.md` - STDIO deprecated, archive?
- `docs/smithery-migration-guide.md` - Still relevant?
- `docs/SPEC_KIT_RESEARCH.md` - Archive (research complete)?
- `docs/ANALYSIS_SUMMARY.md` - Archive (old analysis)?

### 5. ⚠️ Missing from .gitignore
- `.claude/` - IDE files
- `.dincoder/` - Test artifacts
- `specs/` - Example specs (or should we keep?)

### 6. ❌ `.DS_Store` in repo
- macOS metadata file
- Should be in .gitignore (it is, but still tracked)

## Cleanup Actions

### Phase 1: Update .gitignore
```gitignore
# Add these entries:

# Claude Code IDE
.claude/

# DinCoder test artifacts
.dincoder/
specs/*/

# macOS
.DS_Store
```

### Phase 2: Remove tracked files
```bash
git rm -r --cached .claude
git rm -r --cached .dincoder
git rm --cached .DS_Store
git commit -m "chore: remove IDE and test artifacts from tracking"
```

### Phase 3: Reorganize documentation
```bash
# Move setup guides
mkdir -p docs/setup
mv CLAUDE_DESKTOP_SETUP.md docs/setup/claude-desktop.md

# Move testing docs
mkdir -p docs/testing
mv DINCODER_TEST_REPORT.md docs/testing/test-report-2025-10-13.md
mv TESTING_GUIDE.md docs/testing/guide.md

# Move integration docs
mkdir -p docs/integration
mv INTEGRATION_STRATEGY.md docs/integration/strategy.md
```

### Phase 4: Archive outdated docs
```bash
mkdir -p docs/archive
mv docs/stdio-migration-guide.md docs/archive/
mv docs/smithery-migration-guide.md docs/archive/
mv docs/SPEC_KIT_RESEARCH.md docs/archive/
mv docs/ANALYSIS_SUMMARY.md docs/archive/
```

### Phase 5: Update references
- Update README.md to point to new doc locations
- Update CLAUDE.md if it references moved files
- Check plan.md for broken links

## Pre-Publish Checklist

### Testing
- [ ] Run full test suite: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Run build: `npm run build:local`
- [ ] Verify dist/ is clean

### Version Check
- [ ] Verify package.json version: 0.5.0
- [ ] Check npm published version: `npm view mcp-dincoder version`
- [ ] Decide if patch/minor bump needed

### Quality Gates
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Documentation up to date
- [ ] CHANGELOG.md reflects latest changes

### Git Hygiene
- [ ] No uncommitted changes
- [ ] No untracked files that should be ignored
- [ ] Clean git status after cleanup

## Post-Cleanup Verification

```bash
# Should show clean status
git status

# Should not show these files
ls .claude 2>/dev/null && echo "ERROR: .claude still exists"
ls .dincoder 2>/dev/null && echo "ERROR: .dincoder still exists"
ls .DS_Store 2>/dev/null && echo "ERROR: .DS_Store still exists"

# Docs should be organized
tree docs/
```

## Execution Order

1. ✅ Run pre-publish tests
2. ✅ Update .gitignore
3. ✅ Remove tracked files from Git
4. ✅ Reorganize documentation
5. ✅ Archive outdated docs
6. ✅ Update documentation references
7. ✅ Commit all changes
8. ✅ Push to GitHub
9. ✅ Verify npm package is current
10. ✅ Test plugin installation

## Expected Final Structure

```
MCP_DinCoder/
├── .github/              # CI/CD workflows
├── docs/
│   ├── setup/            # Setup guides
│   ├── testing/          # Test documentation
│   ├── integration/      # Integration guides
│   ├── research/         # Research notes (keep)
│   ├── archive/          # Outdated docs
│   ├── conformance.md
│   ├── FEATURE_ANALYSIS.md
│   ├── FEATURE_VOTING.md
│   ├── PRE_COMMIT_SETUP.md
│   ├── PROMPT_TEST.md
│   ├── server_tools&prompts.md
│   └── WHY_SDD.md
├── examples/             # Usage examples
├── scripts/              # Build/dev scripts
├── src/                  # Source code
├── templates/            # Spec Kit templates
├── tests/                # Test suites
├── CHANGELOG.md
├── CLAUDE.md
├── LICENSE
├── package.json
├── plan.md
├── README.md
├── ROADMAP.md
└── SECURITY.md
```
