# Web Application Template

This template provides a pre-configured constitution and sample specification for web application projects using modern frontend technologies.

## What's Included

- **constitution.md** - Pre-configured project principles, constraints, and preferences for web apps
- **spec-example.md** - Sample feature specification following web app best practices

## Technology Stack

This template is optimized for:
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query for server state
- **Build Tool**: Vite 5+ or Next.js 14+
- **Testing**: Vitest + React Testing Library + Playwright

## Quick Start

1. **Copy this template** to your project:
   ```bash
   cp -r templates/projects/web-app/.dincoder/ your-project/
   ```

2. **Review the constitution**:
   - Open `.dincoder/constitution.md`
   - Customize principles and constraints for your project
   - Adjust library preferences as needed

3. **Use the spec example**:
   - Copy `spec-example.md` as a starting point
   - Replace placeholders with your feature details
   - Follow the structure for consistent specifications

4. **Initialize with DinCoder**:
   ```bash
   # In your MCP client (Claude Code, VS Code Copilot, etc.)
   Use specify_start to initialize my-web-app with claude agent
   ```

## Constitution Highlights

### Key Principles
- User-centric design with accessibility first
- Performance targets: < 500KB bundle, < 2.5s LCP
- 80%+ test coverage requirement
- TypeScript strict mode enforced

### Preferred Stack
- React Query over Redux for state management
- Tailwind CSS for styling
- React Hook Form + Zod for forms
- Functional components with hooks

### Architecture Patterns
- Feature-based module organization
- Container/Presentational component pattern
- Atomic design hierarchy
- Server state via React Query

## Customization Guide

### Modify Principles
Edit `constitution.md` to change:
- Performance targets (bundle size, Core Web Vitals)
- Test coverage requirements
- Browser support matrix
- Accessibility compliance level

### Adjust Tech Stack
Update library preferences for:
- State management (Zustand, Jotai, etc.)
- Styling approach (CSS Modules, Styled Components)
- Form handling (Formik instead of React Hook Form)
- Build tool (Webpack instead of Vite)

### Change Patterns
Adapt architecture patterns:
- Module organization (pages vs features vs components)
- State management strategy
- Testing approach
- Error handling patterns

## Example Workflow

### 1. Create Specification
```
"Use specify_describe to create a new feature spec:

Build a user authentication system with email/password login,
OAuth providers (Google, GitHub), and password reset flow."
```

### 2. Generate Plan
```
"Use plan_create with our React + TypeScript stack from constitution.md"
```

### 3. Create Tasks
```
"Use tasks_generate to break down the authentication feature"
```

### 4. Track Progress
```
"Use tasks_stats to see our progress"
"Use tasks_filter with preset='next' to see what's next"
```

## Best Practices

### Specification Writing
- Focus on WHAT users need, not HOW to implement
- Include testable acceptance criteria with when/then statements
- Flag uncertainties with [NEEDS CLARIFICATION]
- Define edge cases and error handling
- Specify accessibility requirements

### Plan Creation
- Reference constitution for stack decisions
- Document architectural trade-offs
- Include data models and API contracts
- Plan for testing strategy
- Consider performance implications

### Task Management
- Keep tasks atomic (< 1 day of work)
- Add metadata: (phase: setup, type: frontend, priority: high)
- Use dependencies for ordering: (depends: T001, T002)
- Update status regularly

## Common Project Types

This template works well for:
- SaaS applications
- Admin dashboards
- E-commerce storefronts
- Social networking apps
- Content management systems
- Productivity tools

## Related Templates

- **API Service**: Backend REST/GraphQL APIs
- **Mobile App**: React Native mobile applications
- **CLI Tool**: Command-line interface tools

## Support

For questions or issues:
- **Documentation**: [docs/integration/](../../docs/integration/)
- **Examples**: See `spec-example.md` in this directory
- **GitHub**: [DinCoder Issues](https://github.com/flight505/mcp-dincoder/issues)

---

**Template Version**: 1.0.0
**Last Updated**: 2025-10-17
**Compatible with**: DinCoder v0.6.0+
