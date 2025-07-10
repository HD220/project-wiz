# Architectural Decision Records (ADRs)

This directory contains the Architectural Decision Records (ADRs) for Project Wiz. An ADR documents a significant architectural decision, the context and problem that led to it, the options considered, and the consequences of the chosen decision.

## Active ADRs

These ADRs describe patterns and decisions that are currently in effect and aligned with the **Adaptive Module Architecture (AMA)**.

| ADR Number | Title                                                 | Status   | Summary                                                                                                  |
| :--------- | :---------------------------------------------------- | :------- | :------------------------------------------------------------------------------------------------------- |
| ADR-004    | Drizzle ORM for Persistence                           | Accepted | Standardizes on Drizzle ORM with SQLite for all data persistence.                                        |
| ADR-006    | Strict Application of Object Calisthenics             | Accepted | Mandates adherence to the 9 rules of Object Calisthenics for cleaner, more maintainable OO code.         |
| ADR-007    | Domain Layer Validation with Zod                      | Accepted | Domain objects (Entities, VOs) are responsible for their own validation using Zod schemas.               |
| ADR-008    | Use Case Error Handling and Response DTO              | Accepted | Defines a standard `IUseCaseResponse` DTO for all application layer operations (now Commands/Queries).   |
| ADR-009    | Property Access Strategy for Domain Objects           | Accepted | Relaxes strict "No Getters" for VOs/Entities, allowing `readonly` properties for clearer data access.    |
| ADR-010    | Entity and Value Object (VO) Implementation Standards | Accepted | Defines implementation patterns for Entities and VOs, including immutability and validation.             |
| ADR-011    | Repository Interface Standards                        | Accepted | Standardizes the location (in domain) and design of repository interfaces (ports).                       |
| ADR-013    | Core Logging Strategy                                 | Accepted | Defines the use of an `ILogger` interface for structured, contextual logging throughout the application. |
| ADR-014    | Core Error Handling Strategy                          | Accepted | Establishes a hierarchy of custom `CoreError` classes for consistent error handling.                     |
| ADR-015    | Advanced TypeScript Usage and Best Practices          | Accepted | Sets standards for using advanced TypeScript features like utility types, generics, and type guards.     |
| ADR-016    | Practical Application of Object Calisthenics          | Accepted | Details how each of the 9 Object Calisthenics rules is applied within the project.                       |
| ADR-017    | Persistence Patterns with Drizzle ORM                 | Accepted | Defines patterns for schemas, mappers, and transactions, now updated for AMA's modular structure.        |
| ADR-018    | Adapter Design and Error Handling                     | Accepted | Standardizes the design of infrastructure adapters, which must implement a core port and handle errors.  |
| ADR-019    | Dependency Injection Strategy with InversifyJS        | Accepted | Formalizes the use of InversifyJS for DI, including tokens, scopes, and constructor injection.           |
| ADR-020    | Queue System Architecture                             | Accepted | Defines the architecture for the job queue system, including the Facade and internal services.           |
| ADR-021    | Job Processor Function Design                         | Accepted | Standardizes the signature and responsibilities of functions that process jobs from the queue.           |
| ADR-022    | WorkerService Design and Concurrency                  | Accepted | Details the design of the `WorkerService` that consumes jobs from the queue.                             |
| ADR-023    | Electron Main Process Setup and Security              | Accepted | Sets standards for the secure setup and lifecycle management of the Electron main process.               |
| ADR-024    | Electron IPC Patterns and Preload Script Security     | Accepted | Defines secure patterns for IPC, emphasizing `contextBridge` and validation in handlers.                 |
| ADR-025    | React Component Design and State Management           | Accepted | Outlines best practices for React development, including component structure and state management.       |
| ADR-026    | Styling Conventions with Tailwind CSS and Shadcn/UI   | Accepted | Standardizes the use of Tailwind CSS and Shadcn/UI for a consistent visual style.                        |
| ADR-027    | Frontend Directory Structure and Naming Conventions   | Accepted | Defines the Feature-Sliced Design structure for the frontend, aligned with AMA.                          |
| ADR-028    | Comprehensive Naming Conventions                      | Accepted | Mandates English and specific casing (`kebab-case` for files) for all identifiers in the codebase.       |
| ADR-029    | Automated Testing Strategy and Standards              | Accepted | Establishes Vitest as the testing framework and defines standards for unit and integration tests.        |
| ADR-030    | Application Security Guidelines                       | Accepted | Consolidates security best practices for Electron, data handling, and dependency management.             |
| ADR-031    | Configuration Management Strategy                     | Accepted | Defines how configurations are loaded, validated, and accessed in a type-safe manner.                    |

## Obsolete ADRs

These ADRs are no longer in effect and have been superseded by the **Adaptive Module Architecture (AMA)**. They are kept for historical context.

| ADR Number | Title                         | Status   | Reason for Obsolescence                                                                                                                             |
| :--------- | :---------------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-012    | Use Case and Service Patterns | Obsolete | The generic UseCase/Service pattern was replaced by the more specific **CQRS** pattern (Commands/Queries and their Handlers) introduced by the AMA. |
