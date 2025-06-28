# Code Quality and Refactoring Guide

## 1. Introduction

This document serves as a guide for maintaining and improving code quality, organization, and maintainability within the Project Wiz codebase. Its purpose is to define a common set of standards and best practices, including Object Calisthenics, to guide current and future development, as well as targeted refactoring efforts. The ultimate aim is to enhance Developer Experience (DX) and ensure the long-term health of the software.

## 2. Core Principles

Our development will be guided by established software engineering principles:

*   **Clean Architecture:** Strict adherence to layering (Domain, Application, Infrastructure) and dependency rules (dependencies flow inwards). Core logic should be independent of frameworks and infrastructure details.
*   **SOLID:**
    *   **S**ingle Responsibility Principle: Each class or module should have one primary responsibility.
    *   **O**pen/Closed Principle: Software entities should be open for extension but closed for modification.
    *   **L**iskov Substitution Principle: Subtypes must be substitutable for their base types.
    *   **I**nterface Segregation Principle: Clients should not depend on interfaces they don't use.
    *   **D**ependency Inversion Principle: Depend on abstractions, not concretions.
*   **DRY (Don't Repeat Yourself):** Avoid duplication of code and logic.
*   **YAGNI (You Ain't Gonna Need It):** Implement only necessary functionality.
*   **KISS (Keep It Simple, Stupid):** Prefer simpler solutions where possible.

## 3. Object Calisthenics for This Project

Object Calisthenics provides a set of rules that, when followed, tend to lead to more maintainable, readable, and well-designed object-oriented code. We will strive to apply these, adapting pragmatically where necessary for TypeScript and the project's context.

1.  **Only One Level of Indentation Per Method.**
    *   **Intent:** Promotes small, focused methods by discouraging deep nesting of conditional logic or loops.
    *   **Application:** Extract complex conditional blocks or loop bodies into separate, well-named private methods or helper functions. Single `if` statements or simple loops are generally acceptable.
    *   *Project Relevance:* Methods like `GenericAgentExecutor.processJob` and `WorkerService.processJob` should be reviewed for opportunities to reduce indentation by extracting helper methods.

2.  **Don’t Use the ELSE Keyword.**
    *   **Intent:** Encourages clearer conditional logic through early returns (guard clauses), polymorphism, or state patterns, reducing nesting.
    *   **Application:** Prioritize guard clauses for preconditions. For more complex state-dependent logic, consider if a State pattern or strategy pattern could eliminate complex `if/else if/else` chains.
    *   *Project Relevance:* Review complex conditional structures in agent logic and service methods.

3.  **Wrap All Primitives and Strings.**
    *   **Intent:** Avoid "Primitive Obsession." If a primitive type (string, number, boolean) has inherent rules, constraints, or behavior associated with it, it should be encapsulated in a dedicated class or type (Value Object).
    *   **Application:**
        *   IDs (e.g., `JobId`, `PersonaId`): Currently UUID strings. This is acceptable, but if they start acquiring specific validation or formatting logic beyond simple string, consider wrapping.
        *   Domain-specific concepts passed as strings or numbers (e.g., status strings, priorities, configuration values like timeouts) could be candidates for wrapping if they have associated business rules or a constrained set of values (enums are a good TypeScript feature for this).
        *   `job.payload` and `job.data`: `job.data` has been improved with `AgentJobState`. `job.payload` should ideally use specific DTOs for different job types rather than `any`.
        *   Tool parameters defined by Zod schemas already provide a strong form of "wrapping" with validation.

4.  **First Class Collections.**
    *   **Intent:** A class that contains a collection should ideally not have other instance variables. The collection and its operations should be encapsulated within its own class.
    *   **Application:**
        *   `GenericAgentExecutor.agentState.conversationHistory` and `executionHistory`: If the logic for managing these histories (e.g., adding entries, summarizing, querying specific parts) becomes complex, they could be extracted into their own classes (e.g., `ConversationHistoryManager`, `ExecutionLog`).
        *   `ToolRegistry` is a good example of this rule applied.
    *   *Project Relevance:* Monitor the complexity of collection management within `GenericAgentExecutor`.

5.  **One Dot Per Line (Law of Demeter).**
    *   **Intent:** Reduce coupling by limiting method calls to direct collaborators. Avoid long chains like `object.getA().getB().doSomething()`.
    *   **Application:** If such chains are found, consider if the intermediate objects are exposing too much internal state, or if a method should be added to the direct collaborator to provide the needed information or perform the action.
    *   *Project Relevance:* Review interactions between services, use cases, and entities. For example, instead of `job.getData().getAgentState().getHistory()`, perhaps `job.getMostRecentHistoryEvent()` if that's a common need.

6.  **Don’t Abbreviate.**
    *   **Intent:** Use clear, explicit, and unambiguous names for variables, functions, classes, and files.
    *   **Application:** Maintain this practice. Avoid overly short or cryptic names. Standard industry abbreviations (like `CWD`, `DTO`, `ID`) are generally acceptable if widely understood in context.
    *   *Project Relevance:* Current naming is generally good. Continue vigilance.

7.  **Keep All Entities Small.**
    *   **Intent:** Classes should be small (e.g., <100 lines, ideally <50) and methods even smaller (e.g., <15 lines, ideally <5-10). This promotes Single Responsibility.
    *   **Application:** This is a key area for review.
    *   *Project Relevance:* `GenericAgentExecutor.ts` (especially `processJob`) and `WorkerService.ts` are prime candidates for refactoring into smaller, more focused methods and potentially helper classes/services if responsibilities can be further delineated.

8.  **No Classes With More Than Two Instance Variables.**
    *   **Intent:** A very strict rule to promote high cohesion and enforce SRP. Classes with many instance variables might be doing too much or could have their variables grouped into meaningful domain objects.
    *   **Application:** This is often the most challenging Calisthenics rule to apply strictly, especially with Dependency Injection where classes collaborate with several services/repositories.
    *   **Pragmatic Adaptation:** Focus on whether the instance variables represent a cohesive set of responsibilities. If a class's dependencies seem to serve multiple distinct high-level purposes, consider splitting the class. For `GenericAgentExecutor`, its core dependencies (`personaTemplate`, `toolRegistryInstance`, `internalAnnotationTool`) are all fundamental to its role of executing a job for a persona. Further decomposition here would need careful thought to avoid over-fragmentation.
    *   *Project Relevance:* Review classes like `GenericAgentExecutor` and `WorkerService`. Are all constructor-injected dependencies strictly necessary for *all* its public methods, or could some responsibilities be split?

9.  **No Getters/Setters/Properties (for direct state access/mutation).**
    *   **Intent:** Objects should expose behavior ("Tell, Don't Ask") rather than just raw data. State changes should occur as side effects of behavior methods.
    *   **Application:**
        *   **Entities (`Job`, `MemoryItem`, `Annotation`):** These currently have public `props` or individual getters, which is common for data-centric entities that need to be serialized/deserialized or read by other layers. They also have behavioral methods for state transitions (e.g., `Job.moveToActive()`, `MemoryItem.updateContent()`). This balance is often pragmatic. The goal is to ensure that *business rules* related to state changes are encapsulated in methods, not handled by external clients setting properties. Avoid public setters where a behavioral method is more appropriate.
        *   **DTOs and Config Objects:** These are primarily data containers and will naturally have properties.
    *   *Project Relevance:* Continue to favor behavioral methods on entities for state changes. Review if any current public property access could be better encapsulated by a method representing an operation.

## 4. Other Coding Standards & Best Practices

*   **Naming Conventions:**
    *   Files: `kebab-case.ts` (e.g., `generic-agent-executor.ts`). Interface/type files: `kebab-case.interface.ts` or `kebab-case.types.ts`.
    *   Classes, Interfaces, Types, Enums: `PascalCase` (e.g., `GenericAgentExecutor`, `IAgentTool`).
    *   Methods, Functions, Variables: `camelCase` (e.g., `processJob`, `toolRegistry`).
    *   Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_HISTORY_MESSAGES_BEFORE_SUMMARY`).
*   **Error Handling:**
    *   Strive for consistent error handling. Consider custom error classes for different failure domains (e.g., `ToolExecutionError`, `LLMError`, `ConfigurationError`).
    *   Provide clear, informative error messages.
    *   `GenericAgentExecutor` and `WorkerService` should robustly handle errors from components they call, logging appropriately and updating job status.
*   **TypeScript Usage:**
    *   Maximize type safety. Avoid `any` where possible; use specific types, interfaces, or `unknown`.
    *   Use `readonly` for properties not intended for modification post-instantiation.
    *   Utilize utility types (`Partial`, `Pick`, `Omit`, etc.) effectively.
    *   Ensure function and method signatures are clearly typed.
*   **Module Design:**
    *   Adhere to Single Responsibility Principle at module level.
    *   Use `index.ts` files judiciously for exporting public APIs of a module/directory.
    *   Ensure clear, minimal exports from modules.
*   **Commenting and Documentation:**
    *   Use JSDoc/TSDoc for all public classes, methods, interfaces, and complex functions.
    *   Add inline comments for non-obvious logic or important decisions.
    *   Keep Markdown documentation in `docs/` (like this guide and `./01-software-architecture.md`) current.

## 5. Code Organization & Structure

*   **Clean Architecture Layers:** Strictly maintain the separation:
    *   `src/core/domain/entities/`: Pure domain model objects.
    *   `src/core/domain/services/`: Domain services (e.g., `WorkerService`).
    *   `src/core/ports/`: Interfaces for repositories, external services, agent executors, tools.
    *   `src/core/application/use-cases/`: Application logic orchestrating domain and repository ports.
    *   `src/infrastructure/`: Concrete implementations (repositories, tools, agent executor), AI SDKs, DB setup (`drizzle`).
*   **Component Placement:**
    *   New tools: Class in `infrastructure/tools/`, interface definition (Zod schemas, result types) in `core/ports/tools/`.
    *   New repositories: Interface in `core/ports/repositories/`, implementation in `infrastructure/repositories/`.
    *   New UseCases: In `core/application/use-cases/` under an appropriate capability directory.
*   **Configuration:**
    *   Environment variables (`.env`) for secrets and runtime environment specifics.
    *   File-based configuration (e.g., `config/personas/` for `AgentPersonaTemplate`s).

## 6. Initial High-Level Observations & Areas for Review

Based on the initial codebase exploration, the following areas are flagged for closer review against these standards during a more detailed refactoring planning phase:

1.  **`GenericAgentExecutor` Class Size and Complexity:**
    *   **Concern:** The `GenericAgentExecutor` class, particularly its `processJob` method, handles many responsibilities (state loading, prompt construction, history summarization, LLM calls for planning/action, tool result processing, re-plan logic, error handling). This may violate "Keep All Entities Small" and "One Level of Indentation."
    *   **Potential Action:** Break down `processJob` into smaller private methods. Consider if some responsibilities (e.g., detailed state transition logic, specific LLM interaction patterns for planning vs. execution) could be extracted to helper classes or strategies.
2.  **`WorkerService` Method Complexity:**
    *   **Concern:** Similar to `GenericAgentExecutor`, the `WorkerService.processJob` method has significant logic for job state transitions and error handling.
    *   **Potential Action:** Review for opportunities to simplify or delegate parts of this logic.
3.  **Direct Infrastructure Dependencies in Application Layer:**
    *   **Concern:** `SaveMemoryItemUseCase` (application layer) currently has a direct dependency on `EmbeddingService` (infrastructure layer).
    *   **Potential Action:** Introduce an `IEmbeddingService` port in `core/ports/services/` and have `SaveMemoryItemUseCase` depend on this abstraction. `EmbeddingService` would implement this port. (This was already noted as a TODO).
4.  **Error Handling Consistency and Granularity:**
    *   **Concern:** While error handling exists, it could be more standardized. Different components might throw generic `Error`s.
    *   **Potential Action:** Define and use custom error classes for different failure types (e.g., `ToolError`, `LLMError`, `ConfigError`) to allow more specific handling. Ensure comprehensive logging of error details.
5.  **Configuration Management Centralization:**
    *   **Concern:** Some configurations (e.g., LLM model names for summarization/re-planning, summarization thresholds) are constants within `GenericAgentExecutor`.
    *   **Potential Action:** Evaluate if these should be moved to a more centralized configuration system or be part of `AgentPersonaTemplate` if they vary per persona.
6.  **Type Safety for `job.payload` and `job.data`:**
    *   **Concern:** `job.payload` is often `any`. `job.data` is `any` but now standardized to hold `agentState` and `lastFailureSummary`.
    *   **Potential Action:** For jobs targeting specific personas/goals, define more specific DTOs for `job.payload` where possible. Refine the type for `job.data` to strongly type `agentState` and `lastFailureSummary`.

## 7. Next Steps

This guide provides the foundational standards and initial observations. The next phase will involve:
1.  A more granular review of specific codebase sections identified above against these standards.
2.  Creating a detailed refactoring roadmap with specific, actionable tasks to address violations or areas for improvement.
3.  Iteratively implementing these refactoring tasks.

This document itself should be considered living and can be updated as new insights are gained or standards evolve.
```
