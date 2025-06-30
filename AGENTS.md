# AGENT INSTRUCTIONS FOR PROJECT WIZ

## 1. Project Overview

Project Wiz is an ElectronJS desktop application with a React frontend and a Node.js/TypeScript backend/core.

**Fundamental Instruction: Internalize These Guidelines**

Before starting ANY development, refactoring, or analysis task that involves modifications to the code or its structure, it is **mandatory** that you CAREFULLY review all sections of this document. Your understanding of the system and the quality of your work depend on it.

Failure to follow these guidelines will result in work that is misaligned with the project's objectives and structure.

## 2. Software Architecture and Mandatory Principles

### 2.1. General Architecture

Project Wiz adopts **Clean Architecture**. This approach organizes code into concentric layers with a strict inward flow of dependencies:

*   **Domain Layer:** Contains the core business logic and entities. It is the innermost layer and does not depend on any other layer.
*   **Application Layer:** Orchestrates the application's use cases. It contains application-specific logic and depends only on the Domain layer.
*   **Infrastructure Layer:** Deals with external details such as frameworks, databases, third-party APIs, and the user interface (UI). This layer depends on the Application layer (through ports and adapters).

**The dependency flow is always: Infrastructure -> Application -> Domain.**

For a complete detailing of the architecture, components of each layer, key technologies, and data flows, you **must** consult the document:
*   `docs/reference/01-software-architecture.md` (This is the primary document for understanding the system architecture. It details Clean Architecture, layers (Domain, Application, Infrastructure), dependency flows, and key components. **Reading and understanding this document is crucial.**)

### 2.2. Design and Coding Principles

Strict adherence to the following principles is crucial:

#### 2.2.1. Clean Architecture Principles

This rule promotes strict adherence to Clean Architecture principles, ensuring the development of robust, testable, and scalable applications by clearly defining layer responsibilities and dependency rules.

*   **Dependency Rule:** Strictly enforce the Dependency Rule: dependencies must always point inwards. Inner circles (Entities, Use Cases) must not know anything about outer circles (Adapters, Frameworks/Drivers).
*   **Layer Separation:** Maintain clear separation between the four main layers:
    *   **Entities:** Core business rules, data structures, and enterprise-wide business rules. Pure domain objects.
    *   **Use Cases (Interactors):** Application-specific business rules. Orchestrates the flow of data to and from entities.
    *   **Adapters (Controllers, Gateways, Presenters):** Convert data from inner layers to outer layers (and vice-versa). Bridges between use cases and external frameworks/drivers.
    *   **Frameworks & Drivers (Web, DB, UI):** The outermost layer, dealing with specific technologies and external systems.
*   **Inversion of Control (IoC):** Utilize the Dependency Inversion Principle. Inner layers define interfaces (abstractions), and outer layers implement them. Dependencies are injected from the outside in.
*   **Testability:** Prioritize testability. Each layer, especially Entities and Use Cases, should be independently testable without reliance on external frameworks or databases.
*   **No Direct Framework Imports in Core:** Core business logic (Entities, Use Cases) must have zero direct imports or dependencies on any external framework (e.g., React, Express, Database ORMs).
*   **Data Flow:** Define explicit data flow between layers. Use simple data structures (Plain Old JavaScript Objects/interfaces) for input and output across layer boundaries.
*   **Well-Defined Interfaces:** Define clear interfaces (ports) between layers to describe communication contracts. Avoid implicit dependencies.
*   **Persistence Ignorance:** Entities and Use Cases should be unaware of how data is persisted. This concern belongs to the Gateway or Repository adapters.
*   **Avoid Global State:** Minimize or avoid global state where possible, especially in core layers. Pass data explicitly between components and layers.
*   **Error Handling:** Define a consistent error handling strategy across all layers. Errors should be passed inwards, but their handling and presentation can be adapted outwards.

#### 2.2.2. Object Calisthenics

All 9 Object Calisthenics principles must be strictly applied. This is a key non-functional requirement.

1.  **Only One Level of Indentation Per Method.**
    *   **Intent:** Promotes small, focused methods by discouraging deep nesting of conditional logic or loops.
    *   **Application:** Extract complex conditional blocks or loop bodies into separate, well-named private methods or helper functions. Single `if` statements or simple loops are generally acceptable.
2.  **Don’t Use the ELSE Keyword.**
    *   **Intent:** Encourages clearer conditional logic through early returns (guard clauses), polymorphism, or state patterns, reducing nesting.
    *   **Application:** Prioritize guard clauses for preconditions. For more complex state-dependent logic, consider if a State pattern or Strategy pattern could eliminate complex `if/else if/else` chains.
3.  **Wrap All Primitives and Strings.**
    *   **Intent:** Avoid "Primitive Obsession." If a primitive type (string, number, boolean) has inherent rules, constraints, or behavior associated with it, it should be encapsulated in a dedicated class or type (Value Object).
    *   **Application:** IDs (e.g., `JobId`), domain-specific concepts passed as strings or numbers (e.g., status, priorities) can be candidates for wrapping if they have associated business rules or a constrained set of values (TypeScript enums are good for this). Tool parameters defined by Zod schemas already provide a strong form of "wrapping" with validation.
4.  **First Class Collections.**
    *   **Intent:** A class that contains a collection should ideally not have other instance variables. The collection and its operations should be encapsulated in its own class.
    *   **Application:** If the logic for managing collections (e.g., adding entries, summarizing, querying specific parts) becomes complex, they could be extracted into their own classes.
5.  **One Dot Per Line (Law of Demeter).**
    *   **Intent:** Reduce coupling by limiting method calls to direct collaborators. Avoid long chains like `object.getA().getB().doSomething()`.
    *   **Application:** If such chains are found, consider if the intermediate objects are exposing too much internal state, or if a method should be added to the direct collaborator to provide the needed information or perform the action.
6.  **Don’t Abbreviate.**
    *   **Intent:** Use clear, explicit, and unambiguous names for variables, functions, classes, and files.
    *   **Application:** Maintain this practice. Avoid overly short or cryptic names. Standard industry abbreviations (like `CWD`, `DTO`, `ID`) are generally acceptable if widely understood in context.
7.  **Keep All Entities Small.**
    *   **Intent:** Classes should be small (e.g., <100 lines, ideally <50) and methods even smaller (e.g., <15 lines, ideally <5-10). This promotes Single Responsibility.
    *   **Application:** This is a key area for review. Long functions and classes must be refactored.
8.  **No Classes With More Than Two Instance Variables.**
    *   **Intent:** A very strict rule to promote high cohesion and enforce SRP. Classes with many instance variables might be doing too much or could have their variables grouped into meaningful domain objects.
    *   **Application:** Focus on whether the instance variables represent a cohesive set of responsibilities. If a class's dependencies seem to serve multiple distinct high-level purposes, consider splitting the class.
9.  **No Getters/Setters/Properties (for direct state access/mutation).**
    *   **Intent:** Objects should expose behavior ("Tell, Don't Ask") rather than just raw data. State changes should occur as side effects of behavior methods.
    *   **Application:** Entities may have public `props` or individual getters, which is common for data-centric entities that need to be serialized/deserialized or read by other layers. They should also have behavioral methods for state transitions. The goal is to ensure that *business rules* related to state changes are encapsulated in methods, not handled by external clients setting properties. Avoid public setters where a behavioral method is more appropriate. DTOs and configuration objects are primarily data containers and will naturally have properties.

#### 2.2.3. Other Design and Coding Principles (SOLID, DRY, KISS, YAGNI)

*   **SOLID:**
    *   **S**ingle Responsibility Principle: Classes and methods should have a single, well-defined responsibility.
    *   **O**pen/Closed Principle: Entities should be open for extension but closed for modification.
    *   **L**iskov Substitution Principle: Subtypes should be substitutable for their base types.
    *   **I**nterface Segregation Principle: Clients should not depend on interfaces they do not use.
    *   **D**ependency Inversion Principle: Depend on abstractions (interfaces/ports), not concrete implementations.
*   **DRY (Don't Repeat Yourself):** Eliminate code duplication. Abstract common logic into reusable functions, classes, or modules instead of copying and pasting.
*   **KISS (Keep It Simple, Stupid):** Design solutions that are as simple as possible, but no simpler. Avoid unnecessary complexity.
*   **YAGNI (You Aren't Gonna Need It):** Implement only the functionality that is currently required. Avoid adding features or abstractions speculatively for future needs.
*   **Descriptive Naming:** Use clear, unambiguous, and descriptive names for variables, functions, classes, and files. Names should convey intent and purpose.
*   **Fail Fast:** Detect errors as early as possible and exit gracefully. Validate inputs at the earliest opportunity to prevent the propagation of invalid states.
*   **Consistent Formatting:** Adhere to a consistent code formatting style (e.g., Prettier, ESLint rules). Maintain uniform indentation, spacing, and bracket placement.
*   **Comprehensive Testing:** Write automated tests (unit, integration, end-to-end) for all critical paths and business logic. Aim for high test coverage.
*   **Idempotent Operations:** Design operations to be idempotent where applicable, meaning executing them multiple times has the same effect as executing them once.
*   **Immutable Data:** Prefer immutable data structures when possible. Avoid modifying objects or arrays in place; instead, create new instances with updated values.
*   **Version Control Discipline:** Commit small, atomic changes with clear and descriptive commit messages. Use feature branches and pull requests for collaboration.
*   **Dependency Management:** Manage project dependencies explicitly (e.g., package.json). Keep dependencies updated and monitor for vulnerabilities.
*   **Error Handling:** Implement robust error handling mechanisms. Catch and log errors, provide meaningful error messages, and handle exceptions gracefully to prevent crashes.
*   **Performance Awareness:** Consider the performance impacts of code choices. Optimize critical paths, reduce unnecessary computations, and minimize resource consumption.
*   **Security Best Practices:** Be mindful of security vulnerabilities. Sanitize all user inputs, avoid hardcoding sensitive information, and follow secure coding guidelines.
*   **Refactoring Regularly:** Continuously refactor code to improve its design, readability, and maintainability. Don't defer technical debt indefinitely.
*   **Avoid Magic Numbers/Strings:** Replace hardcoded numbers or strings with named constants or configuration variables to improve readability and maintainability.
*   **Loose Coupling, High Cohesion:** Design modules to be loosely coupled (minimize dependencies between them) and highly cohesive (elements within a module are functionally related).
*   **Code Reviews:** Participate in and conduct thorough code reviews to catch errors, share knowledge, and improve code quality.

#### 2.2.4. Code and Style Standards

*   **Main Language:** TypeScript.
    *   We use the `strict` configuration activated (`noImplicitAny`, `strictNullChecks`) for greater type safety.
    *   Path aliases like `@/components`, `@/lib` are used to facilitate imports.
    *   Prioritize strong typing; avoid `any` whenever possible and justify its use if strictly necessary.
*   **Formatting (Prettier):**
    *   The project uses Prettier to ensure consistency in code formatting.
    *   Main settings: 2-space indentation, single quotes (`singleQuote: true`), semicolons at the end of statements (`semi: true`).
    *   Configure your editor to format on save or run `npm run format`.
*   **Linting (ESLint):**
    *   ESLint is used for static code analysis and to enforce standards.
    *   The base configuration extends from presets like `eslint:recommended`, `@typescript-eslint/recommended`, and `import/recommended`.
    *   **Crucial Instruction:** After creating or modifying a file, **ALWAYS run ESLint (`npx eslint path/to/your/file.tsx --fix` or the project script `npm run lint`) and perform ALL necessary adjustments and refactorings to eliminate errors and warnings.** Do not proceed until the file is clean of linting issues.
*   **Naming Conventions:**
    *   Use clear, descriptive names in **English** for variables, functions, classes, files, and folders.
    *   Folders should be named in English.
*   **Version Control (Git):**
    *   Make small, atomic commits.
    *   Write clear, descriptive commit messages in English. Follow the [Semantic Commits](https://www.conventionalcommits.org/) pattern (e.g., `feat: Add new Tool X`, `fix: Correct login issue when using Y`).
*   **Comments:**
    *   **Avoid comments as much as possible.** The code should be self-explanatory.
    *   If a comment is *absolutely necessary* (e.g., to explain complex business logic that cannot be simplified, or a temporary workaround for an external issue), it should explain the *why* of the logic, not just the *what*.
    *   Write comments in English.
    *   **Do not use comments to disable code (commented-out lines).** If the code is not needed, remove it. Git history maintains previous versions.

#### 2.2.5. Technology/Tool - Specific Best Practices

##### Electron.js
*   **Separate Main and Renderer Processes:** Strictly separate logic. The main process handles app lifecycle and native APIs. Renderer processes handle the UI. Avoid mixing concerns.
*   **IPC Communication:** Use `ipcMain` and `ipcRenderer` for all communication between main and renderer processes. Define clear, descriptive channel names and send only necessary data.
*   **Security Best Practices:** Implement strict security: enable `contextIsolation`, disable `nodeIntegration` in renderer processes, and use preload scripts to expose only safe APIs via `contextBridge`.
*   **Preload Scripts:** All inter-process communication (IPC) for renderer processes must be handled via a secure preload script. Do not expose Node.js APIs directly to the renderer.
*   **Context Bridge Usage:** Expose only specific, safe functions and objects from the main process to the renderer via `contextBridge` in the preload script. Avoid exposing `ipcRenderer` directly.
*   **Resource Handling:** Manage application resources (files, database connections) primarily in the main process. Renderers should request these resources via IPC.
*   **Performance Considerations:** Optimize startup time and resource usage. Lazy-load modules, minimize synchronous operations, and manage memory efficiently, especially for multiple windows.
*   **Error Handling and Logging:** Implement robust error handling across both processes. Centralize logging for main and renderer errors to facilitate debugging.
*   **Native Module Integration:** When using native Node.js modules, ensure they are correctly rebuilt for Electron and handled exclusively in the main process.

##### React
*   **Functional Components & Hooks:** Always use functional components and React Hooks (useState, useEffect, useContext, useCallback, useMemo, etc.) for state management and side effects. Avoid class components.
*   **Component Structure:** Organize components logically (e.g., Atomic Design). Each component should ideally adhere to the Single Responsibility Principle, doing one thing well. Break down complex components.
*   **Prop Drilling Avoidance:** Minimize prop drilling. For deeply nested data, consider `useContext` or a dedicated state management library.
*   **Memoization for Performance:** Use `React.memo`, `useCallback`, and `useMemo` judiciously to prevent unnecessary re-renders of components, functions, and expensive calculations.
*   **Key Prop for Lists:** Always provide a stable, unique `key` prop when rendering lists of elements. The key should ideally be derived from the item's ID, not its index.
*   **Accessibility (A11y):** Prioritize web accessibility. Use semantic HTML, `aria-*` attributes where necessary, and ensure keyboard navigation and screen reader compatibility.
*   **Conditional Rendering:** Use clear and readable conditional rendering techniques.
*   **State Management:** Manage component local state with `useState`. For shared or global state, evaluate `useContext` or a state management library.
*   **Custom Hooks for Logic Reuse:** Extract reusable, stateful logic into custom Hooks. Name them starting with `use`.
*   **Side Effects with useEffect:** Handle all side effects (data fetching, subscriptions, DOM manipulations) within `useEffect` hooks. Ensure correct dependency arrays to prevent infinite loops or stale closures.

##### TypeScript
*   **Type Safety Enforcement:** Explicitly define types for all variables, function arguments, and return values. Avoid `any` unless absolutely necessary and justified.
*   **Interface/Type Definition:** Use `interface` or `type` for object shapes and complex types.
*   **Readonly Properties:** Apply `readonly` to properties that should not be reassigned after initialization.
*   **Enums vs. Union Types:** Prefer union types (`'value1' | 'value2'`) for simple literal sets. Use `enum` for distinct sets of related constants with symbolic names.
*   **Generics for Reusability:** Employ generics to create reusable components and functions that maintain type safety across different types.
*   **Null and Undefined Handling:** Explicitly handle `null` or `undefined` values using optional chaining (`?.`), nullish coalescing (`??`), or type guards.
*   **ESM Modules:** Always prefer ES module syntax (`import`/`export`).
*   **Strict Compiler Options:** Assume strict TypeScript compiler options (e.g., `strict: true`) are enabled and write code compatible with them.

##### Vite.js
*   **Vite Native Features:** Utilize Vite's native ES module imports for fast Hot Module Replacement (HMR) and development server.
*   **Configuration (vite.config.ts):** Keep `vite.config.ts` clean and minimal. Use plugins for extended functionality.
*   **Asset Handling:** Manage static assets using Vite's built-in asset handling. Use the `public` folder for static assets that need to be served directly.
*   **Environment Variables:** Use `import.meta.env` for accessing environment variables, following Vite's convention (prefix `VITE_`).

##### Zod
*   **Schema First Approach:** Always define a Zod schema for input validation before processing any external data.
*   **Strict Object Schemas:** Prefer `z.object().strict()` for object schemas to disallow unknown keys by default.
*   **Type Inference:** Utilize Zod's `z.infer<typeof yourSchema>` to derive TypeScript types directly from your schemas.
*   **Refinement for Complex Logic:** Use `z.refine()` or `z.superRefine()` for complex validation logic.
*   **Error Message Customization:** Provide descriptive custom error messages.
*   **Optional and Nullable Fields:** Clearly distinguish between optional (`z.optional()`), nullable (`z.nullable()`), and default (`z.default()`) fields.
*   **Transformations (`.transform()`):** Use `.transform()` for data transformations *after* validation.
*   **Validation in API Endpoints/Entry Points:** Perform Zod validation at the earliest possible entry point for external data.

## 3. Key Technologies

Consult `package.json` and `docs/reference/01-software-architecture.md` for the complete list. Key technologies include:

*   **Language:** TypeScript (`strict` configuration).
*   **Backend/Core:** Node.js.
*   **Desktop App:** ElectronJS.
*   **Frontend UI:** React, Vite, Tailwind CSS, Radix UI, ShadCN UI conventions.
*   **Routing (UI):** TanStack Router.
*   **i18n (UI):** LinguiJS.
*   **Forms (UI):** React Hook Form + Zod.
*   **DI (Backend):** InversifyJS.
*   **Database:** SQLite with Drizzle ORM.
*   **AI/LLM:** `ai-sdk`.
*   **Testing:** Vitest.

## 4. Controlled Modifications: Dependencies, Configurations, and Code Organization

Any proposal to add new dependencies (npm packages, libraries), significant changes to existing configurations (e.g., `tsconfig.json`, `vite.config.ts`, CI/CD settings), or structural changes in code organization (e.g., moving main folders, significantly altering module structure) must follow a formal approval process.

**Mandatory Process:**

1.  **Prior Analysis and Research:**
    *   Before proposing any of the above changes, you must conduct detailed research and analysis.
    *   Identify the need for the change and the problems it aims to solve.
    *   If it's a new dependency, compare alternatives, considering factors like popularity, maintenance, licensing, impact on bundle size, security, and alignment with the existing architecture.
    *   For configuration or organizational changes, evaluate the pros and cons of the change and the potential impact on the rest of the system.
2.  **Creation of an ADR (Architecture Decision Record):**
    *   Document the results of your analysis and research in a new ADR file.
    *   Use a standard ADR template (if one doesn't exist, create a simple one with sections for Context, Proposed Decision, Considered Alternatives, Pros, Cons, and Justification).
    *   Save the ADR in the `docs/analise-e-pesquisa/` folder with a descriptive name (e.g., `adr-XXX-use-new-graphics-library.md` or `adr-XXX-restructure-services-folder.md`).
3.  **Request for Approval:**
    *   Inform the user (your human supervisor) about the new ADR created and request a review and approval.
    *   Clearly point out the problem being solved and why the proposed solution (new dependency, configuration change, etc.) is the best option.
4.  **Implementation Only After Approval:**
    *   **You MUST NOT install new dependencies, apply significant configuration changes, or perform structural code reorganizations without explicit approval of the corresponding ADR by the user.**
    *   Once the ADR is approved, you may proceed with implementing the documented decision.

This process ensures that all significant changes are well-considered, documented, and aligned with the project's long-term goals.

## 5. Working with Legacy Code (During Phase 5)

*   Legacy code in `src/` and `src2/` exists for consultation and understanding.
*   **DO NOT MODIFY LEGACY CODE.**
*   **ALL NEW CODE MUST BE WRITTEN IN `src_refactored/`.**
*   If you find a VO, entity, or utility function in the legacy code that is of high quality and PERFECTLY aligns with the new principles (Clean Arch, OC), you may adapt it for `src_refactored/`. However, **rewriting is the norm**.

Remember, the goal is to create an exemplary codebase. Think carefully about each design and implementation decision. If anything is unclear, ask for clarification.
[end of AGENTS.md]
