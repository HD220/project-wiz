## Title
ADR-0031: Electron Services Architecture

## Context
The project requires the implementation of several services in the Electron main process: HistoryService, WorkerService, GitHubTokenService, and SessionService. These services need to be designed with security, performance, and maintainability in mind.

## Decision
We will implement the services in the `src/core/services` directory, following the existing architecture patterns. Each service will have a corresponding interface in `src/shared/types/di.ts` and will be registered in the `inversify` container in `src/core/container.ts`. Security will be ensured by using the provided secure implementation template, which includes input sanitization and secure IPC handling.

## Alternatives Considered
1.  Implementing the services directly in the Electron main process without using a dependency injection container.
2.  Using a different dependency injection container.

## Consequences
-   The use of `inversify` provides a flexible and maintainable way to manage dependencies.
-   The secure implementation template ensures the security of the services.
-   The ADR provides a clear and concise description of the architecture.

## Implementation Guidelines
-   Implement the services in the `src/core/services` directory.
-   Create interfaces for each service in `src/shared/types/di.ts`.
-   Register the services in the `inversify` container in `src/core/container.ts`.
-   Follow the secure implementation template for each service.
-   Implement unit and integration tests for each service.