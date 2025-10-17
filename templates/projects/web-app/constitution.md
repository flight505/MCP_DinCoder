# Project Constitution: Web Application

## Project Principles

### 1. User-Centric Design
- Prioritize user experience and accessibility
- Design for mobile-first, responsive layouts
- Maintain fast page load times (<3s on 3G)

### 2. Code Quality & Maintainability
- Write clean, self-documenting code
- Follow SOLID principles
- Aim for 80%+ test coverage
- Use TypeScript for type safety

### 3. Performance First
- Optimize bundle size (target: <500KB initial load)
- Implement code splitting and lazy loading
- Use caching strategies effectively
- Monitor Core Web Vitals

### 4. Security & Privacy
- Follow OWASP Top 10 guidelines
- Implement proper authentication and authorization
- Sanitize all user inputs
- Use HTTPS everywhere

### 5. Iterative Development
- Ship small, incremental changes
- Use feature flags for gradual rollouts
- Collect and act on user feedback
- Maintain backward compatibility

## Technical Constraints

### Platform Requirements
- **Node.js**: >= 20.0.0 LTS
- **Browsers**: Last 2 versions of Chrome, Firefox, Safari, Edge
- **Mobile**: iOS 14+, Android 10+

### Bundle Size
- **Initial Load**: < 500KB (gzipped)
- **Route Chunks**: < 200KB each
- **Third-Party Dependencies**: Maximum 10 for core functionality

### Performance Targets
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1

### Accessibility
- **WCAG**: 2.1 Level AA compliance minimum
- **Keyboard Navigation**: Full support required
- **Screen Readers**: Test with NVDA and VoiceOver

## Library Preferences

### Frontend Framework
- **Primary**: React 18+ with hooks
- **Alternative**: Next.js 14+ for SSR/SSG needs
- **State Management**: React Query over Redux (prefer server state caching)
- **Forms**: React Hook Form with Zod validation

### Styling
- **Primary**: Tailwind CSS 3+ for utility-first styling
- **Component Library**: shadcn/ui or Radix UI primitives
- **Icons**: Lucide React or Heroicons
- **Animations**: Framer Motion for complex animations

### Data Fetching
- **API Client**: TanStack Query (React Query) v5+
- **REST**: Axios or native fetch with TypeScript
- **GraphQL**: Apollo Client or urql (if needed)
- **Validation**: Zod for runtime type checking

### Build Tools
- **Bundler**: Vite 5+ (preferred) or Next.js
- **TypeScript**: 5.0+ with strict mode
- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier with consistent config

## Code Style Preferences

### Functional > OOP
- Prefer pure functions and immutability
- Use composition over inheritance
- Leverage React hooks for state and effects

### Declarative > Imperative
- Use JSX for UI declaratively
- Prefer `.map()`, `.filter()`, `.reduce()` over loops
- Express intent clearly in code

### Type Safety
- Use TypeScript strict mode
- Avoid `any` type - use `unknown` or proper types
- Leverage discriminated unions for state
- Use Zod for runtime validation

### Component Patterns
- Prefer function components over class components
- Keep components small and focused (< 200 lines)
- Extract custom hooks for shared logic
- Use compound components for complex UI

## Architecture Patterns

### Project Structure
```
src/
├── components/     # Reusable UI components
├── features/       # Feature-based modules
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and configurations
├── pages/          # Route components
├── services/       # API and external service integrations
├── stores/         # Global state management
└── types/          # TypeScript type definitions
```

### Component Organization
- **Container/Presentational**: Separate data fetching from presentation
- **Feature Modules**: Group related components, hooks, and logic
- **Atomic Design**: Use atoms → molecules → organisms hierarchy

### State Management Strategy
- **Server State**: React Query for API data caching
- **UI State**: React useState/useReducer for local state
- **Global State**: Context API for theme, auth, i18n
- **URL State**: React Router for navigation state

### Error Handling
- Use Error Boundaries for React component errors
- Implement global error tracking (Sentry, LogRocket)
- Show user-friendly error messages
- Provide fallback UI for critical errors

## Testing Strategy

### Unit Tests
- **Framework**: Vitest or Jest
- **Coverage**: 80% minimum for critical paths
- **Mocking**: Mock external dependencies and API calls

### Integration Tests
- **Framework**: React Testing Library
- **Focus**: User interactions and workflows
- **Accessibility**: Test with @testing-library/jest-dom

### E2E Tests
- **Framework**: Playwright or Cypress
- **Critical Paths**: Authentication, checkout, core features
- **Frequency**: Run on pre-deployment

## Deployment & CI/CD

### Environments
- **Development**: Local development server
- **Staging**: Pre-production testing environment
- **Production**: Live user-facing environment

### Continuous Integration
- Run tests on every pull request
- Enforce code coverage thresholds
- Check bundle size and performance budgets
- Run accessibility audits

### Deployment Strategy
- Use preview deployments for pull requests
- Implement blue-green or canary deployments
- Automate rollback on errors
- Monitor error rates post-deployment

## Documentation Requirements

### Code Documentation
- JSDoc comments for public APIs
- README for complex features
- Architecture Decision Records (ADRs) for major choices

### User Documentation
- Component storybook with Storybook or Histoire
- API documentation with OpenAPI/Swagger
- User guides for complex features

---

*This constitution should be referenced when creating specifications, plans, and tasks to ensure consistency across the project.*
