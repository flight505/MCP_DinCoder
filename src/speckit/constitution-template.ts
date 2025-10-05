/**
 * Constitution template for Spec-Driven Development
 *
 * This template generates a constitution.md file that defines project
 * principles, constraints, and preferences to guide AI-generated artifacts.
 */

interface ConstitutionParams {
  projectName: string;
  principles: string[];
  constraints: string[];
  preferences: {
    libraries?: string[];
    patterns?: string[];
    style?: string;
  };
}

export function generateConstitutionFromTemplate(params: ConstitutionParams): string {
  const { projectName, principles, constraints, preferences } = params;
  const timestamp = new Date().toISOString();

  return `# ${projectName} Constitution

**Created:** ${timestamp}
**Purpose:** Define principles and constraints that guide all AI-generated artifacts

---

## 🎯 Project Principles

These principles guide all technical decisions and implementations:

${principles.map((p, i) => `${i + 1}. **${p}**`).join('\n')}

### Why These Principles?

The principles above ensure consistency, maintainability, and alignment with project values. All specifications, plans, and tasks should respect these principles.

---

## 🔒 Technical Constraints

These constraints are non-negotiable requirements:

${constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

### Constraint Rationale

Technical constraints protect against scope creep, ensure compatibility, and maintain quality standards. Violating these constraints requires explicit approval and documentation.

---

## 📚 Preferences

### Preferred Libraries
${preferences.libraries && preferences.libraries.length > 0
  ? preferences.libraries.map(lib => `- ${lib}`).join('\n')
  : '_No library preferences specified_'}

### Preferred Patterns
${preferences.patterns && preferences.patterns.length > 0
  ? preferences.patterns.map(pattern => `- ${pattern}`).join('\n')
  : '_No pattern preferences specified_'}

### Code Style
${preferences.style || '_No style preference specified_'}

---

## 🤖 AI Agent Guidelines

When generating specifications, plans, or tasks for this project:

1. **Respect Principles:** All recommendations should align with project principles
2. **Honor Constraints:** Never suggest solutions that violate technical constraints
3. **Prefer Specified Options:** Use preferred libraries/patterns when applicable
4. **Document Deviations:** If deviating from preferences, explain why
5. **Ask for Clarification:** When principles conflict, flag for human decision

---

## 📊 Diagram Standards (Optional)

When creating architecture or technical diagrams in specs/plans/research, use Mermaid syntax for consistency:

### System Architecture Example
\`\`\`mermaid
graph TB
  subgraph "Presentation Layer"
    UI[User Interface]
  end
  subgraph "Application Layer"
    API[REST API]
    Auth[Auth Service]
  end
  subgraph "Data Layer"
    DB[(Database)]
  end
  UI --> API
  UI --> Auth
  API --> DB
  Auth --> DB
\`\`\`

### Sequence Diagram Example
\`\`\`mermaid
sequenceDiagram
  User->>+API: Request
  API->>+Database: Query
  Database-->>-API: Data
  API-->>-User: Response
\`\`\`

### Data Model Example
\`\`\`mermaid
erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : "ordered in"
\`\`\`

**Note:** AI assistants should write these diagrams directly in markdown files. Users will see rendered diagrams when opening files in VS Code, GitHub, or other Mermaid-compatible viewers.

---

## 📝 Amendment Process

This constitution is a living document. To amend:

1. Propose change with rationale
2. Update this document
3. Document change in research.md
4. Validate all existing specs/plans/tasks still comply
5. Git commit with clear amendment message

---

## ✅ Compliance Checklist

Use this checklist when reviewing AI-generated artifacts:

- [ ] All principles respected
- [ ] No constraint violations
- [ ] Preferred libraries used (when applicable)
- [ ] Preferred patterns followed (when applicable)
- [ ] Code style matches preference
- [ ] Any deviations documented with rationale

---

**Constitution Version:** 1.0
**Last Updated:** ${timestamp}
`;
}
