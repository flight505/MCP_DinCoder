# Changelog

All notable changes to the DinCoder MCP Server project will be documented in this file.

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