# Changelog

All notable changes to the DinCoder MCP Server project will be documented in this file.

## [0.1.14] - 2025-10-03

### Fixed - SMITHERY RUNTIME ERROR (v2)
- **Improved __dirname Detection** - Simplified CJS/ESM compatibility approach
  - Removed function wrapper, using inline expression with fallback chain
  - Uses `typeof __dirname !== 'undefined'` check for CJS detection
  - Properly declares `__dirname` type for TypeScript in ESM mode
  - More reliable than try-catch approach for bundled contexts

### Technical Details
- **Previous Issue (v0.1.13):** Function-based approach still had edge cases
- **New Solution:** Direct expression with short-circuit evaluation
  ```typescript
  declare const __dirname: string | undefined;
  const _dirname =
    (typeof __dirname !== 'undefined' && __dirname) ||
    (import.meta.url ? dirname(fileURLToPath(import.meta.url)) : null) ||
    process.cwd();
  ```
- **Why This Works:**
  - In CJS bundle: `__dirname` is defined, first condition succeeds
  - In ESM: `import.meta.url` is available, second condition succeeds
  - Fallback: `process.cwd()` for any other context

### Impact
- ✅ Cleaner, more maintainable code
- ✅ Works in Smithery CJS bundle (`.smithery/index.cjs`)
- ✅ Works in local ESM development
- ✅ All 32 tests passing

## [0.1.13] - 2025-10-03

### Fixed - SMITHERY RUNTIME ERROR
- **CommonJS/ESM Compatibility** - Fixed `fileURLToPath` crash in Smithery deployment
  - Created `getDirname()` function in `src/speckit/templates.ts`
  - Detects runtime context: checks for `__dirname` (CJS) before `import.meta.url` (ESM)
  - Replaced `__dirname` with `_dirname` variable throughout templates.ts
  - Resolves "path argument must be of type string" error during Smithery inspect

### Technical Details
- **Root Cause:** Smithery CLI bundles to CommonJS (`.smithery/index.cjs`)
  - In CJS context, `import.meta.url` is `undefined`
  - `fileURLToPath(undefined)` threw TypeError at runtime
- **Solution:** Runtime detection with graceful fallback
  ```typescript
  function getDirname(): string {
    if (typeof __dirname !== 'undefined') return __dirname;  // CJS
    if (import.meta.url) return dirname(fileURLToPath(import.meta.url));  // ESM
    return process.cwd();  // Fallback
  }
  ```

### Impact
- ✅ Works in local ESM development (`npm run dev:local`)
- ✅ Works in Smithery CJS bundle (`.smithery/index.cjs`)
- ✅ All 32 tests passing
- ✅ Ready for Smithery runtime verification

## [0.1.12] - 2025-10-03

### Fixed - SMITHERY DEPLOYMENT (FINAL)
- **Correct Module Entry Point** - Fixed critical configuration error
  - Changed `"module": "dist/index.js"` to `"module": "src/index.ts"`
  - Smithery TypeScript runtime requires SOURCE file, not built output
  - This was the root cause of Docker build failures

- **Removed Conflicting Files** - Cleaned up deployment configuration
  - Deleted `Dockerfile` (not used in TypeScript runtime)
  - Deleted `smithery.config.js` (using Smithery CLI defaults)
  - TypeScript runtime = Smithery CLI builds and containerizes automatically

- **Simplified Configuration** - Minimal smithery.yaml
  - Only `runtime: "typescript"` needed
  - Smithery handles HTTP transport, containerization, and deployment
  - No Docker management required

### Technical Details
- Build command: `npm run build` → `@smithery/cli build`
- Build output: `.smithery/index.cjs` (1.69MB)
- Build time: ~60ms
- Warnings about import.meta in CJS output (non-blocking)

### Impact
- ✅ Smithery CLI build succeeds locally
- ✅ Ready for Smithery platform deployment
- ✅ All local tests still passing

### Key Learning
**TypeScript Runtime vs Container Runtime:**
- TypeScript runtime (`runtime: "typescript"`) = Smithery CLI builds from SOURCE
- Container runtime (`runtime: "container"`) = You provide Dockerfile
- We were mixing both approaches, causing build failures

## [0.1.11] - 2025-10-03

### Fixed - SMITHERY BUILD
- **Added @smithery/sdk Dependency** - Required for Smithery CLI builds
  - Installed `@smithery/sdk` as runtime dependency
  - Created `smithery.config.js` with external package configuration
  - Marked `@smithery/sdk`, `@modelcontextprotocol/sdk`, and other deps as external
  - Build now completes successfully with `@smithery/cli build`

- **Build Configuration** - Optimized for Smithery deployment
  - esbuild configured for Node.js 20 target
  - ESM output format
  - Sourcemaps enabled for debugging
  - Minification enabled for production

### Added
- `smithery.config.js` - Smithery build configuration
- `.smithery/` added to `.gitignore` (build output directory)

### Impact
- Smithery deployment now works correctly
- Build output: `.smithery/index.cjs` (102KB)
- Ready for deployment on Smithery platform

## [0.1.10] - 2025-10-03

### Fixed - SMITHERY DEPLOYMENT
- **Smithery TypeScript Runtime Configuration** - Fixed deployment configuration
  - Removed incorrect `build.dockerfile` from `smithery.yaml` (only needed for custom containers)
  - Simplified to minimal `runtime: "typescript"` configuration
  - Updated package.json scripts to use Smithery CLI (`build` and `dev`)
  - Fixed default export to return McpServer instance (not wrapper)
  - Added `configSchema` export for Smithery configuration validation

- **Default Export Structure** - Aligned with Smithery requirements
  - Changed from returning McpHttpServer wrapper to McpServer instance
  - Smithery CLI now handles HTTP transport and port binding
  - Configuration passed via `{ config }` parameter
  - Environment variables set from config for tool access

### Changed
- Package.json scripts: `build` and `dev` now use `@smithery/cli`
- Local development scripts renamed to `build:local` and `dev:local`
- Version bumped to 0.1.10 in src/index.ts

### Impact
- Server can now deploy correctly on Smithery platform
- TypeScript runtime approach (simpler than custom Docker)
- Automatic containerization and scaling by Smithery

## [0.1.9] - 2025-10-03

### Fixed - CRITICAL BUGS
- **Template Loading** - Fixed absolute path issue preventing template loading
  - Changed from `process.cwd()` to `__dirname` resolution
  - Templates now load correctly after npm install
  - Added templates to package.json "files" array for distribution

- **Workspace Path Resolution** - Fixed `/specs` absolute path error
  - Created `workspace.ts` helper with `resolveWorkspacePath()`
  - Handles empty strings, whitespace, and root path edge cases
  - Prevents creating directories in filesystem root
  - Falls back to `process.cwd()` when path is invalid

- **Core Functionality Restored**
  - `specify_start` now works correctly
  - `specify_describe` now works correctly
  - `tasks_tick` now works correctly
  - Template files properly bundled in npm package

### Technical
- All 32/33 tests passing
- Templates included in dist: `templates/speckit/*.md`
- Workspace resolution with safety checks
- Better error messages with actual paths in errors

### Impact
- Users can now initialize projects successfully
- Core Spec-Driven workflow functional end-to-end
- Production-ready for real use

## [0.1.8] - 2025-10-03

### Fixed
- **TypeScript Compilation Errors** - Fixed all type errors preventing production builds
  - Fixed `config/index.ts` rateLimit configuration type issues
  - Fixed `plan.ts` and `tasks.ts` optional parameter handling
  - Fixed `server-enhanced.ts` SessionManager method name (removeSession → deleteSession)
  - All TypeScript strict mode checks now passing

- **Build Configuration** - Improved bundling setup
  - Added `tsup.config.ts` with proper Node.js externals configuration
  - Ensures Node.js built-in modules (path, fs, etc.) are not bundled
  - Fixed module resolution issues in production builds

### Changed
- **Dependency Management** - Updated build pipeline
  - Better separation of bundled vs external dependencies
  - Improved tree-shaking for smaller bundle sizes
  - Node 20+ as minimum required version (target: node20)

### Technical
- 32/33 tests passing (1 skipped by design)
- Zero TypeScript compilation errors
- Clean build output with proper type definitions
- Production-ready for NPM distribution

## [0.1.7] - 2025-01-12

### Added
- **Real Spec Kit Integration** - Transformed from mock implementation to authentic Spec-Driven Development
  - Created `speckit/detector.ts` module for detecting Spec Kit document types
  - Created `speckit/parser.ts` module for parsing Spec Kit markdown to structured JSON
  - Created `speckit/templates.ts` module with official Spec Kit markdown templates
  - Cached official Spec Kit templates locally in `templates/speckit/` directory

### Changed
- **All Spec Kit tools** now generate real markdown documents instead of mock JSON
  - `specify_describe` generates authentic spec.md with GitHub SDD format
  - `plan_create` generates real plan.md with research and architecture sections
  - `tasks_generate` creates proper tasks.md with numbered task lists
  - Maintains backward compatibility with JSON format for existing integrations

### Fixed
- **CI/CD Pipeline** - Resolved smoke test failure by setting PORT=3000 in CI environment
  - All 33 tests now passing (100% pass rate)

### Improved
- **Smithery Deployment** - Full deployment configuration ready
  - smithery.yaml with runtime: "typescript"
  - Default export function for Smithery compatibility
  - Base64 config parameter support implemented
  - Added "Deploy on Smithery" button to README

### Documentation
- Updated CLAUDE.md with v0.1.7 achievements
- Updated plan.md to reflect 74% project completion (17/23 stories)
- Added comprehensive "Lessons Learned from v0.1.7" section

## [0.1.6] - 2025-01-10

### Fixed
- **CRITICAL**: Fixed tool naming pattern validation error that prevented Claude Desktop integration
  - Changed all 15 tool names from periods (.) to underscores (_) to comply with MCP pattern `^[a-zA-Z0-9_-]{1,64}$`
  - Example: `specify.start` → `specify_start`

### Changed
- **Major Refactor**: Standardized all tools to use `.dincoder` directory structure
  - All project files now stored in `.dincoder/` instead of scattered directories
  - Simplified file management and improved consistency
  
### Improved
- **specify_start**: Complete rewrite to create directory structure directly instead of calling external `uvx` command
  - Now creates `.dincoder/` with spec.json, plan.json, tasks.json, and research.md templates
  
- **specify_describe**: Enhanced with intelligent parsing to extract goals and requirements from natural language
  
- **plan_create**: Added smart extraction of technologies, patterns, and phases from constraints
  
- **tasks_generate**: Complete rewrite for JSON-based task management with automatic generation from scope
  
- **tasks_tick**: Added dependency checking and proper status management
  
- **git tools**: Enhanced error messages with actionable next steps for common scenarios
  
- **artifacts_read**: Updated to read from unified `.dincoder` directory

### Added
- Comprehensive testing guide (TESTING_GUIDE.md) for Claude Desktop integration
- Detailed tool descriptions for better AI understanding
- Better error handling across all tools with helpful messages

### Developer Experience
- All 32 tests passing
- Build completes successfully with TypeScript strict mode
- Ready for npm publication

## [0.1.3] - 2025-01-10

### Fixed
- **CRITICAL**: Removed circular dependency (package was depending on itself)
- Fixed server auto-start issue that caused Claude Code connection failures
- Fixed session management issues in stateful mode
- Fixed all ESLint errors (reduced from 13 to 0)
- Fixed Smithery deployment configuration for TypeScript runtime

### Changed
- Server no longer auto-starts when imported as a module
- Added proper default export for Smithery compatibility
- Updated package.json exports field for proper module resolution
- Cleaned up test files and removed duplicates

### Removed
- Removed 11 unnecessary test files from root directory
- Removed backup Dockerfile.original
- Removed self-referencing dependency from package.json

## [0.1.2] - 2025-01-10

### Fixed
- Lowered Node.js requirement from >=20 to >=18 for Claude Desktop compatibility
- Resolved npm EBADENGINE warning when installing in Claude Desktop (Node v18.20.8)

### Changed
- Updated engines.node in package.json to support wider Node.js version range

## [0.1.1] - 2025-01-10

### Fixed
- Resolved Smithery deployment connection timeout issues
- Server now explicitly binds to 0.0.0.0 for Docker container compatibility
- Fixed "connection refused" errors during Smithery tool scanning
- Removed import.meta usage for CommonJS compatibility

### Added
- Comprehensive startup logging for better debugging
- MCP_HOST environment variable support
- Enhanced error handling during server initialization

### Changed
- Restructured Smithery deployment configuration
- Updated Dockerfile to multi-stage build pattern
- Improved smithery.yaml with startCommand configuration

## [0.1.0] - 2025-01-10

### Initial Release
- Spec-Driven Development (SDD) tools for AI coding
- Four-phase workflow: Specify → Plan → Tasks → Implement
- HTTP and STDIO transport support
- Stateless and stateful modes
- Session management for stateful operations
- Security middleware with CORS and API key support
- GitHub Actions CI/CD pipeline
- NPM package: mcp-dincoder
- Smithery platform support