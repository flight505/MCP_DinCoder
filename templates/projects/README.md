# DinCoder Project Templates

Pre-configured constitutions and examples for different project types, optimized for spec-driven development with DinCoder MCP tools.

## Available Templates

### 🌐 Web Application
**Path**: `templates/projects/web-app/`

Modern frontend applications with React, TypeScript, and Tailwind CSS.

**Ideal for**: SaaS apps, admin dashboards, e-commerce, social platforms

**Stack**: React 18+, TypeScript, Tailwind CSS, Vite, React Query

**[View Template →](./web-app/)**

---

### 🚀 API Service
**Path**: `templates/projects/api-service/`

RESTful APIs and GraphQL services with Node.js or Python.

**Ideal for**: Backend APIs, microservices, integration platforms

**Stack**: Express/Fastify or FastAPI, PostgreSQL/MongoDB, Redis

**[View Template →](./api-service/)**

---

### 📱 Mobile Application
**Path**: `templates/projects/mobile-app/`

Cross-platform mobile apps with React Native or Flutter.

**Ideal for**: Consumer apps, B2B mobile, e-commerce apps

**Stack**: React Native 0.72+ or Flutter 3.10+, cross-platform

**[View Template →](./mobile-app/)**

---

### ⌨️ CLI Tool
**Path**: `templates/projects/cli-tool/`

Command-line interface tools with Node.js, Python, Go, or Rust.

**Ideal for**: Developer tools, build systems, automation scripts

**Stack**: Commander.js, Click, Cobra, or clap

**[View Template →](./cli-tool/)**

---

## Quick Start

### 1. Choose a Template

Pick the template that matches your project type:

```bash
# Web Application
cp -r templates/projects/web-app/.dincoder/ your-web-project/

# API Service
cp -r templates/projects/api-service/.dincoder/ your-api-project/

# Mobile App
cp -r templates/projects/mobile-app/.dincoder/ your-mobile-project/

# CLI Tool
cp -r templates/projects/cli-tool/.dincoder/ your-cli-project/
```

### 2. Customize Constitution

Review and customize the `constitution.md` file for your specific needs:

- Adjust performance targets
- Modify library preferences
- Update architectural patterns
- Change testing requirements

### 3. Create Your Specification

Use DinCoder MCP tools to create specifications:

```
# In your MCP client (Claude Code, VS Code Copilot, etc.)
Use specify_describe to create a feature spec for [your feature]
```

### 4. Generate Plan and Tasks

```
Use plan_create to generate implementation plan
Use tasks_generate to break down into tasks
```

## What's in Each Template

### Constitution File
Pre-configured project principles, constraints, and preferences:
- **Principles**: Core values guiding development
- **Constraints**: Technical requirements and limits
- **Library Preferences**: Recommended tools and frameworks
- **Code Style**: Preferred patterns and practices
- **Architecture**: Structural guidelines
- **Testing Strategy**: Coverage and approach

### README File
Quick start guide and customization instructions:
- Technology stack overview
- Quick start commands
- Key principles summary
- Ideal use cases
- Customization guide

### Example Spec (Web App Only)
Sample feature specification showing:
- Goal setting and success metrics
- User stories with acceptance criteria
- Feature requirements
- UI/UX considerations
- Technical specifications
- Edge cases and error handling

## Customization Guide

### Modify Principles
Edit constitution.md to adjust:
- Performance targets
- Code coverage requirements
- Browser/platform support
- Accessibility standards

### Change Tech Stack
Update library preferences for:
- Different frameworks or libraries
- Alternative state management
- Different testing tools
- Custom build tools

### Adapt Patterns
Customize architecture patterns:
- Module organization
- Component structure
- State management approach
- Error handling strategy

## Usage with DinCoder

### Workflow Example

1. **Initialize Project**:
   ```
   Use specify_start to initialize my-project with claude agent
   ```

2. **Create Specification**:
   ```
   Use specify_describe: "Build a user authentication system
   with email/password login and OAuth providers"
   ```

3. **Generate Plan** (references constitution):
   ```
   Use plan_create with constraints from constitution.md
   ```

4. **Break Down Tasks**:
   ```
   Use tasks_generate to create actionable tasks
   ```

5. **Track Progress**:
   ```
   Use tasks_stats to see progress
   Use tasks_filter with preset='next' for next tasks
   ```

## Template Features

### ✅ Pre-Configured Best Practices
- Industry-standard principles
- Performance targets
- Security requirements
- Accessibility standards

### 📐 Architecture Guidance
- Proven patterns
- Module organization
- Separation of concerns
- Scalability considerations

### 🛠️ Technology Recommendations
- Modern, well-supported tools
- Performance-optimized choices
- Developer-friendly libraries
- Community-backed solutions

### 📊 Quality Standards
- Test coverage targets
- Code quality metrics
- Performance benchmarks
- Documentation requirements

## Support & Resources

### Documentation
- **Integration Guides**: [docs/integration/](../../docs/integration/)
- **DinCoder Docs**: [CLAUDE.md](../../CLAUDE.md)
- **Project Plan**: [plan.md](../../plan.md)

### Examples
- Each template includes example files
- Web app has complete spec example
- READMEs show usage patterns

### Community
- **GitHub**: [DinCoder Repository](https://github.com/flight505/mcp-dincoder)
- **Issues**: [Report Issues](https://github.com/flight505/mcp-dincoder/issues)
- **Discussions**: [Ask Questions](https://github.com/flight505/mcp-dincoder/discussions)

## Contributing

Have a template idea? Want to improve existing templates?

1. Fork the repository
2. Create a new template or enhance existing ones
3. Follow the template structure (constitution.md + README.md)
4. Submit a pull request with your improvements

---

**Template Collection Version**: 1.0.0
**Last Updated**: 2025-10-17
**Compatible with**: DinCoder v0.6.0+
