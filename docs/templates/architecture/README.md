# Architecture Templates

This directory contains architectural documentation templates designed specifically for Project Wiz development. These templates are optimized for the **solution-architect** agent and follow Project Wiz's INLINE-FIRST philosophy and existing patterns.

## Template Index

| Template                                                | Purpose                                    | Complexity | Estimated Time |
| ------------------------------------------------------- | ------------------------------------------ | ---------- | -------------- |
| [ADR Template](./adr-template.md)                       | Architecture Decision Records              | Medium     | 1-2 hours      |
| [System Design Template](./system-design-template.md)   | High-level system specifications           | High       | 2-4 hours      |
| [Integration Template](./integration-template.md)       | Third-party and cross-system integration   | Medium     | 1-3 hours      |
| [Database Template](./database-template.md)             | Database architecture and migrations       | Medium     | 1-2 hours      |
| [IPC Template](./ipc-template.md)                       | Inter-process communication specifications | Medium     | 1-2 hours      |
| [Migration Plan Template](./migration-plan-template.md) | System migration and upgrade architectures | High       | 2-4 hours      |

## Usage Guidelines

### Agent Selection

These templates include metadata to help Claude Code select the appropriate agent:

```yaml
---
template_type: "architecture"
complexity: "high|medium|low"
primary_agent: "solution-architect"
estimated_time: "2-4 hours"
related_patterns: ["docs/developer/database-patterns.md"]
---
```

### Template Structure

All architecture templates follow a consistent structure:

1. **Context and Scope** - Problem definition and boundaries
2. **Architecture Analysis** - Current state and requirements analysis
3. **Proposed Solution** - Detailed architectural design
4. **Implementation Strategy** - Step-by-step implementation plan
5. **Documentation References** - Links to Project Wiz patterns and guidelines

### Project Wiz Specific Considerations

#### INLINE-FIRST Philosophy

All templates include sections for:

- Code simplicity analysis
- Function extraction decisions
- Abstraction vs. inline trade-offs

#### Technology Stack Integration

Templates reference Project Wiz's core technologies:

- **Electron 35.1.4** + **React 19.0.0** + **TypeScript**
- **SQLite + Drizzle ORM** with WAL mode
- **TanStack Router/Query** data loading patterns
- **shadcn/ui** + **Tailwind CSS** component patterns

#### Security Considerations

Desktop app security patterns:

- `contextIsolation: true` and `nodeIntegration: false`
- Database-based session management (NOT localStorage)
- Type-safe IPC communication patterns

## Related Documentation

### Core Patterns

- [Code Simplicity Principles](../developer/code-simplicity-principles.md)
- [Data Loading Patterns](../developer/data-loading-patterns.md)
- [Database Patterns](../developer/database-patterns.md)
- [IPC Communication Patterns](../developer/ipc-communication-patterns.md)

### Architecture Documentation

- [System Architecture](../developer/architecture/)
- [Technical Guides](../technical-guides/)

### Other Templates

- [Brainstorm Template](../brainstorm-template.md)
- [Requirements Template](../requirements-template.md)
- [Use Cases Template](../use-cases-template.md)

## Template Naming Convention

When creating architecture documents using these templates:

1. **File naming:** `kebab-case` format
   - Example: `user-authentication-redesign.md`
   - Example: `ai-provider-integration-architecture.md`

2. **Document titles:** Clear and descriptive
   - Example: "User Authentication Redesign - ADR"
   - Example: "AI Provider Integration Architecture"

3. **Save location:** `docs/architecture/` for completed documents

## Quick Start

1. Choose the appropriate template based on your architectural challenge
2. Copy the template content to a new file in `docs/architecture/`
3. Fill in the template sections following the Project Wiz patterns
4. Reference existing codebase examples where applicable
5. Include links to related documentation and patterns

## Best Practices

### Before Using Templates

- Review related Project Wiz patterns and guidelines
- Understand current system architecture and constraints
- Identify specific requirements and success criteria

### While Filling Templates

- Use concrete examples from the Project Wiz codebase
- Reference existing patterns and explain deviations
- Include code snippets following project conventions
- Consider impact on INLINE-FIRST philosophy

### After Completion

- Review against Project Wiz coding standards
- Validate architectural decisions with team requirements
- Update related documentation if patterns change
- Add cross-references to related architectural documents

## Agent Integration

These templates are designed for optimal collaboration with Claude Code agents:

- **solution-architect**: Primary agent for architectural decisions
- **technical-brainstorming-partner**: For exploring alternatives and trade-offs
- **system-architect**: For system-wide impact analysis
- **documentation-maintainer**: For maintaining architectural documentation consistency

The metadata in each template helps Claude Code route requests to the most appropriate agent based on complexity and domain expertise.
