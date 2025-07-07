# Coding Standards and Development Guidelines

## 1. Introduction

This document is the master guide and single source of truth for all coding standards, style, and development best practices within Project Wiz. Its purpose is to ensure the creation of a consistent, high-quality, maintainable, readable, and robust codebase.

Adherence to this document is mandatory for all new code and refactoring efforts, for both human and AI developers.

## 2. Core Design Principles

Our development is guided by the following fundamental software design principles:

*   **DRY (Don't Repeat Yourself):** Eliminate code duplication. Abstract common logic into reusable functions, classes, or modules.
*   **KISS (Keep It Simple, Stupid):** Design solutions that are as simple as possible. Avoid unnecessary complexity and over-engineering.
*   **YAGNI (You Aren't Gonna Need It):** Implement only what is currently required. Avoid adding features speculatively.
*   **Clean Code:** Write code that is easy to read, understand, and modify. This includes using descriptive names, writing small functions, and maintaining a clear structure.

## 3. Architectural Principles: Adaptive Module Architecture (AMA)

The project's structure is dictated by the **Adaptive Module Architecture (AMA)**. All code must adhere to its principles. For a complete overview, see the main [Software Architecture document](../concepts/software-architecture.md).

*   **Clear Main/Renderer Division:** Strictly separate backend (`main`) and frontend (`renderer`) logic. Communication occurs only via a well-defined IPC contract.
*   **Vertical Slices by Business Module:** Organize the backend into self-contained modules representing business functionality (e.g., `project-management`).
*   **Radical Co-location:** All code related to a feature (domain, persistence, commands, queries) lives within that feature's module.
*   **Explicit Communication via CQRS:** Use `Commands` (for writes) and `Queries` (for reads), each with a dedicated `Handler`, instead of generic services or use cases.
*   **Event-Driven Reactivity:** Use a central `Event Bus` for asynchronous communication *between* modules.
*   **Dependency Inversion:** Core layers must define abstractions (interfaces/ports) that the outer layers implement. The core must not depend on any framework or infrastructure detail.

## 4. Object-Oriented Design: Object Calisthenics

We apply the Object Calisthenics rules to produce clean, modular, and maintainable object-oriented code. See **ADR-016** for detailed application.

1.  **One Level of Indentation Per Method:** Keep methods small and focused.
2.  **Don’t Use the ELSE Keyword:** Use guard clauses and early returns.
3.  **Wrap All Primitives and Strings:** Use Value Objects (VOs) for domain concepts (see **ADR-010**).
4.  **First-Class Collections:** Encapsulate collection logic into its own class.
5.  **One Dot Per Line (Law of Demeter):** Limit method calls to direct collaborators.
6.  **Don’t Abbreviate:** Use clear, explicit, and unambiguous names.
7.  **Keep All Entities Small:** Classes should be small and cohesive (<100 lines); methods even smaller (<15 lines).
8.  **No Classes With More Than Two Instance Variables:** Applied pragmatically, focusing on internal state.
9.  **No Getters/Setters for Behavior:** Expose behavior, not just state. State changes should occur via methods representing business operations.

## 5. Language and Tooling Guidelines

### 5.1. TypeScript Best Practices (Ref: ADR-015)

*   **Strict Mode:** `strict: true` is mandatory in `tsconfig.json`.
*   **`unknown` over `any`:** Always prefer `unknown` for values of unknown type and perform explicit type checking. `any` is forbidden unless absolutely necessary and justified with a comment.
*   **Utility Types:** Leverage TypeScript's built-in utility types (`Partial`, `Readonly`, `Pick`, `Omit`, etc.) to create robust and maintainable types.
*   **Type Guards & Discriminated Unions:** Use type guards and the discriminated union pattern to handle different data structures safely and exhaustively.

### 5.2. Naming Conventions (Ref: ADR-028)

*   **Language:** All identifiers (variables, functions, classes, files, etc.) **must** be in **English**.
*   **Casing:**
    *   `camelCase` for variables, parameters, and functions.
    *   `PascalCase` for classes, interfaces, types, and enums.
    *   `UPPER_SNAKE_CASE` for constants and DI tokens.
*   **File Naming:**
    *   **`kebab-case`** is the universal standard for all files and directories in `src/`.
    *   Use descriptive suffixes: `.entity.ts`, `.vo.ts`, `.service.ts`, `.repository.ts`, `.adapter.ts`, `.command.ts`, `.query.ts`, `.handler.ts`, `.schema.ts`, `.types.ts`, `.tsx`, `.hook.ts`.

### 5.3. Code Formatting (Prettier)

*   Code formatting is managed automatically by Prettier. The configuration is in `.prettierrc.js`. All committed code must be formatted.

### 5.4. Linting (ESLint)

*   ESLint is used for static analysis. The configuration is in `eslint.config.js`. All code must pass linting without errors.

## 6. Other Key Practices

*   **Error Handling (Ref: ADR-014):** Use the custom `CoreError` hierarchy. Catch specific errors and wrap external errors in `InfrastructureError`.
*   **Logging (Ref: ADR-013):** Use the `ILogger` interface via DI. Avoid `console.*`. Use structured, contextual logging.
*   **Testing (Ref: ADR-029):** Use Vitest. Co-locate tests in a `__tests__` directory. Write unit tests for all logic and integration tests for component interactions.
*   **Security (Ref: ADR-030):** Follow all security guidelines, especially for Electron (`contextIsolation`) and IPC (input validation).
*   **Git (Ref: ADR-028):** Use atomic commits with Conventional Commit messages (`feat:`, `fix:`, etc.). Use `kebab-case` for branch names.