# Project Templates

This directory contains comprehensive templates for Project Wiz development, designed to ensure consistency, quality, and adherence to the project's INLINE-FIRST philosophy and architectural patterns.

## Template Categories

### Planning and Analysis Templates

| Template                                        | Purpose                            | Complexity | Primary Agent                   | Estimated Time |
| ----------------------------------------------- | ---------------------------------- | ---------- | ------------------------------- | -------------- |
| [Brainstorm Template](./brainstorm-template.md) | Structured brainstorming sessions  | Low        | technical-brainstorming-partner | 1-2 hours      |
| [Requirements Template](./requirements.md)      | Feature requirements documentation | Medium     | solution-architect              | 2-3 hours      |
| [Use Cases Template](./use-cases.md)            | User workflow documentation        | Medium     | solution-architect              | 1-2 hours      |

### Architecture Templates

| Template                                                             | Purpose                                    | Complexity | Primary Agent      | Estimated Time |
| -------------------------------------------------------------------- | ------------------------------------------ | ---------- | ------------------ | -------------- |
| [ADR Template](./architecture/adr-template.md)                       | Architecture Decision Records              | Medium     | solution-architect | 1-2 hours      |
| [System Design Template](./architecture/system-design-template.md)   | High-level system specifications           | High       | solution-architect | 2-4 hours      |
| [Integration Template](./architecture/integration-template.md)       | Third-party and cross-system integration   | Medium     | solution-architect | 1-3 hours      |
| [Database Template](./architecture/database-template.md)             | Database architecture and migrations       | Medium     | solution-architect | 1-2 hours      |
| [IPC Template](./architecture/ipc-template.md)                       | Inter-process communication specifications | Medium     | solution-architect | 1-2 hours      |
| [Migration Plan Template](./architecture/migration-plan-template.md) | System migration and upgrade architectures | High       | solution-architect | 2-4 hours      |

## Template Usage Guidelines

### Agent-Optimized Templates

All templates include metadata to help Claude Code select the appropriate agent:

```yaml
---
template_type: "planning|architecture"
complexity: "high|medium|low"
primary_agent: "solution-architect|technical-brainstorming-partner|..."
estimated_time: "1-2 hours"
related_patterns: ["docs/developer/pattern.md"]
---
```

### Project Wiz Specific Features

- **INLINE-FIRST Compliance:** All templates emphasize inline-first development principles
- **Technology Stack Integration:** Templates reference Electron, React, SQLite, TanStack Router/Query
- **Security Considerations:** Desktop app security patterns built into templates
- **Type Safety:** End-to-end TypeScript type safety requirements

## Quick Start Guide

### 1. Choose Your Template

Select the appropriate template based on your task:

- **Planning new features:** Use [Requirements Template](./requirements.md)
- **Exploring solutions:** Use [Brainstorm Template](./brainstorm-template.md)
- **Architectural decisions:** Use [ADR Template](./architecture/adr-template.md)
- **System design:** Use [System Design Template](./architecture/system-design-template.md)
- **Database changes:** Use [Database Template](./architecture/database-template.md)

### 2. Follow the Structure

Each template provides:

- **Context sections** - Problem definition and scope
- **Analysis sections** - Current state and requirements
- **Solution sections** - Proposed approach and implementation
- **Implementation sections** - Step-by-step execution plans
- **Reference sections** - Links to Project Wiz patterns and guidelines

### 3. Complete All Sections

Templates are designed for thorough documentation:

- Replace all `[PLACEHOLDER]` text with specific content
- Include actual code examples from the Project Wiz codebase
- Reference existing patterns and explain any deviations
- Add cross-references to related documentation

## File Naming Conventions

### Completed Documents

When creating documents from templates, follow these naming conventions:

**Planning Documents:**

- `requirements-[feature-name].md`
- `brainstorm-[session-topic].md`
- `use-cases-[feature-name].md`

**Architecture Documents:**

- `adr-[number]-[decision-title].md`
- `system-design-[system-name].md`
- `integration-[external-system].md`
- `database-[feature-name].md`
- `ipc-[feature-name].md`
- `migration-plan-[migration-name].md`

### Storage Locations

Save completed documents in appropriate directories:

- **Planning:** `docs/planning/[document-name].md`
- **Architecture:** `docs/architecture/[category]/[document-name].md`
  - `docs/architecture/decisions/` - ADRs
  - `docs/architecture/systems/` - System designs
  - `docs/architecture/integrations/` - Integration specifications
  - `docs/architecture/database/` - Database architectures
  - `docs/architecture/ipc/` - IPC specifications
  - `docs/architecture/migrations/` - Migration plans

## Template Integration with Claude Code

### Agent Routing

Templates help Claude Code agents work more effectively:

- **solution-architect:** Primary agent for complex architectural decisions
- **technical-brainstorming-partner:** For exploring alternatives and trade-offs
- **system-architect:** For system-wide impact analysis
- **documentation-maintainer:** For maintaining documentation consistency

### Workflow Integration

Templates support the complete development workflow:

1. **Discovery Phase:** Brainstorm and requirements templates
2. **Design Phase:** System design and architecture templates
3. **Implementation Phase:** Database and IPC templates for specific implementations
4. **Evolution Phase:** Migration templates for system changes

## Project Wiz Pattern References

### Core Development Patterns

All templates reference and reinforce Project Wiz's core patterns:

- [Code Simplicity Principles](../developer/code-simplicity-principles.md) - INLINE-FIRST philosophy
- [Data Loading Patterns](../developer/data-loading-patterns.md) - TanStack Router/Query hierarchy
- [Database Patterns](../developer/database-patterns.md) - SQLite + Drizzle ORM best practices
- [IPC Communication Patterns](../developer/ipc-communication-patterns.md) - Secure Electron IPC

### Architecture Documentation

- [System Architecture](../developer/architecture/) - Overall system design
- [Technical Guides](../technical-guides/) - Implementation guides
- [Folder Structure](../developer/folder-structure.md) - Code organization

## Best Practices

### Before Using Templates

1. **Review related patterns** - Understand existing Project Wiz patterns
2. **Analyze current state** - Understand system constraints and requirements
3. **Define success criteria** - Set clear, measurable goals

### While Using Templates

1. **Follow INLINE-FIRST** - Prefer inline code over unnecessary abstractions
2. **Include real examples** - Use actual Project Wiz code patterns
3. **Reference existing docs** - Link to related patterns and guidelines
4. **Consider security** - Apply desktop app security best practices

### After Completing Templates

1. **Review for consistency** - Ensure alignment with Project Wiz standards
2. **Validate decisions** - Check against project requirements and constraints
3. **Update related docs** - Cross-reference new documents
4. **Share with team** - Ensure team understanding and buy-in

## Template Maintenance

### Updating Templates

Templates are living documents that evolve with the project:

- **Regular reviews** - Templates updated as patterns evolve
- **Feedback integration** - Improvements based on usage experience
- **Pattern alignment** - Templates kept in sync with development patterns

### Contributing to Templates

To improve templates:

1. Identify gaps or improvements in existing templates
2. Propose changes that maintain consistency with Project Wiz patterns
3. Test changes with real project scenarios
4. Update related documentation and cross-references

## Related Documentation

### Development Guidelines

- [Contributing Guide](../developer/contributing.md) - Development workflow
- [Coding Standards](../developer/coding-standards.md) - Code quality standards
- [Error Handling](../developer/error-handling-patterns.md) - Error management patterns

### Project Documentation

- [Quick Start Guide](../quick-start-guide.md) - Project overview
- [Technical Guides](../technical-guides/) - Detailed implementation guides
- [Planning Documentation](../planning/) - Project requirements and features

### Navigation

- [Main Documentation](../README.md) - Documentation home
- [Search & Glossary](../glossary-and-search.md) - Find specific concepts
- [Developer Guide](../developer/README.md) - Core development patterns

---

## Support and Questions

For questions about template usage or improvements:

1. Check the [Search & Glossary](../glossary-and-search.md) for related concepts
2. Review [existing examples](../architecture/) of completed documents
3. Consult the [Developer Guide](../developer/README.md) for pattern guidance
4. Use the [technical-brainstorming-partner](../../.claude/agents/technical-brainstorming-partner.md) agent for template selection guidance

**Remember:** Templates are tools to ensure consistency and quality. The goal is creating clear, actionable documentation that supports Project Wiz's development principles and helps the team make informed decisions.
