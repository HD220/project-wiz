# ADR-1: Project Architecture

## Context
This ADR documents the overall architecture of the project, including key components, patterns, and technologies used.

## Decision
The project architecture is based on the following:

- Client-side application built with Vite
- React as the UI framework
- TanStack Router for routing
- i18n for internationalization

Key components include:

- `src/client`: Contains the client-side application code
- `src/core`: Contains core application logic
- `src/locales`: Contains localization files
- `src/shared`: Contains shared components and utilities

## Alternatives Considered
N/A

## Consequences
- Provides a clear understanding of the project architecture
- Facilitates onboarding of new developers
- Enables informed decision-making about future development

## Implementation Guidelines
- Follow the existing architectural patterns and conventions
- Document any new architectural decisions in separate ADRs
- Ensure that all code is well-tested and maintainable