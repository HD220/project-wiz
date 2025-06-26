# Queue System Integration and Implementation Plan

## 1. Introduction

This document outlines the plan for integrating and implementing the new BullMQ-inspired job queue system (detailed in `bullmq-inspired-queue-system.md`) within the `src_refactored/` codebase of Project Wiz. It covers the proposed directory structure, mapping of components to architectural layers, a phased implementation plan, and initial considerations for integrating with existing application components.

## 2. Architectural Layer Mapping

The components of the new queue system will be mapped to the Clean Architecture layers as follows:

*   **`Job` Entity & Value Objects (`JobId`, `JobStatus`, `JobOptions`, `RetryPolicy`, etc.):**
    *   **Layer:** `core/domain/job/`
    *   **Details:** The existing `job.entity.ts` and its VOs will be evolved to match the new design, serving as the rich domain model for jobs.

*   **`IJobRepository` Interface:**
    *   **Layer:** `core/domain/job/ports/`
    *   **Details:** The existing interface will be the contract for job persistence.

*   **`DrizzleJobRepository` Implementation:**
    *   **Layer:** `infrastructure/persistence/drizzle/job/`
    *   **Details:** Concrete implementation of `IJobRepository` using Drizzle ORM.

*   **`Queue` (API Class - `JobQueueService`):**
    *   **Layer:** `core/application/queue/`
    *   **Details:** Application service providing the producer and management API for a named queue. Uses `IJobRepository` and `JobEventEmitter`. May consult `Queue` domain entity for configuration.

*   **`Worker` (API Class - `JobWorkerService`):**
    *   **Layer:** `core/application/queue/`
    *   **Details:** Application service for consuming and processing jobs from a queue. Takes a `JobQueueService` instance and a processor function.

*   **`QueueSchedulerService`:**
    *   **Layer:** `core/application/queue/`
    *   **Details:** Application service for background tasks like promoting delayed jobs, handling stalled jobs, and managing repeatable jobs.

*   **`JobEventEmitter`:**
    *   **Layer:** `infrastructure/events/` (e.g., `InMemoryJobEventEmitter.ts`) or `shared/events/`.
    *   **Details:** Handles in-process event publication and subscription for job lifecycle events.

*   **Use Cases (e.g., `CreateJobUseCase`, `GetJobUseCase`):**
    *   **Layer:** `core/application/queue/use-cases/`
    *   **Details:** Encapsulate specific job-related operations, used by services like `JobQueueService`.

*   **DTOs (`JobOptions`, `WorkerOptions`, etc.):**
    *   **Layer:** `core/application/queue/dtos/`
    *   **Details:** Data transfer objects for service and use case APIs.

*   **Shared Types (`JobEventType`):**
    *   **Layer:** `core/application/queue/types.ts` or `shared/types/`
    *   **Details:** Common enumerations and type aliases used by the queue system.

## 3. Proposed Directory Structure

The following structure is proposed within `src_refactored/`:

```
src_refactored/
├── core/
│   ├── application/
│   │   ├── queue/  // New directory
│   │   │   ├── dtos/
│   │   │   │   ├── job-options.dto.ts
│   │   │   │   ├── repeat-options.dto.ts
│   │   │   │   └── worker-options.dto.ts
│   │   │   ├── use-cases/
│   │   │   │   ├── create-job.use-case.ts
│   │   │   │   ├── get-job.use-case.ts
│   │   │   │   └── ...
│   │   │   ├── job-queue.service.ts         // API class 'Queue'
│   │   │   ├── job-worker.service.ts        // API class 'Worker'
│   │   │   ├── queue-scheduler.service.ts
│   │   │   └── queue.types.ts               // JobEventType etc.
│   │   └── ... // Other application services/use-cases
│   │
│   ├── domain/
│   │   ├── job/ // Existing, to be augmented
│   │   │   ├── value-objects/
│   │   │   │   └── ... // JobId, JobStatus, JobOptions (as VO), RetryPolicy etc.
│   │   │   ├── ports/
│   │   │   │   └── job-repository.interface.ts // Existing
│   │   │   └── job.entity.ts // Existing, to be augmented
│   │   │
│   │   ├── queue/ // Existing
│   │   │   └── queue.entity.ts // For queue metadata/configuration
│   │   │   └── ports/queue-metadata-repository.interface.ts
│   │   └── ...
│   └── ... // common, ports, tools
│
├── infrastructure/
│   ├── persistence/
│   │   └── drizzle/
│   │       ├── job/ // New
│   │       │   └── drizzle-job.repository.ts
│   │       ├── queue/ // For DrizzleQueueMetadataRepository
│   │       ├── schema/
│   │       │   ├── jobs.table.ts
│   │       │   └── repeatable-job-schedules.table.ts
│   │       └── ...
│   │
│   ├── events/ // New
│   │   └── in-memory-job-event-emitter.ts
│   ├── scheduler/ // New - For startup/config of QueueSchedulerService
│   └── ...
│
├── presentation/
└── shared/
```

## 4. High-Level Implementation Plan

The implementation will proceed in the following phases:

**Phase 1: Core Domain Modeling & Persistence Layer**
*   **Objective:** Establish the foundational `Job` entity, VOs, repository interface, and Drizzle persistence.
*   **Tasks:**
    1.  Refine/Augment `Job` Entity & VOs (`core/domain/job/`).
    2.  Define/Confirm `IJobRepository` Interface (`core/domain/job/ports/`).
    3.  Implement `DrizzleJobRepository` (`infrastructure/persistence/drizzle/job/`).
    4.  Define Drizzle Schema for `jobs`, `repeatable_job_schedules` (`infrastructure/persistence/drizzle/schema/`) and run migrations.
    5.  Unit tests for VOs, `Job` entity, and `DrizzleJobRepository`.

**Phase 2: Job Production & Basic Management API (`JobQueueService`)**
*   **Objective:** Implement the API for adding jobs and basic inspection.
*   **Tasks:**
    1.  Implement `InMemoryJobEventEmitter` (`infrastructure/events/`).
    2.  Implement core Job Use Cases (e.g., `CreateJobUseCase`) (`core/application/queue/use-cases/`).
    3.  Implement `JobQueueService` (`core/application/queue/job-queue.service.ts`).
    4.  Unit & Integration tests for `JobQueueService`.

**Phase 3: Job Consumption API (`JobWorkerService`) & Processing Logic**
*   **Objective:** Implement the worker API for fetching and processing jobs.
*   **Tasks:**
    1.  Implement `JobWorkerService` (`core/application/queue/job-worker.service.ts`), including polling, locking, processor execution, and lock renewal.
    2.  Refine `Job` entity/interface methods (`updateProgress`, `log`) for worker context.
    3.  Unit & Integration tests for `JobWorkerService`, including concurrency and error handling.

**Phase 4: `QueueSchedulerService` Implementation**
*   **Objective:** Implement the background service for time-dependent job management.
*   **Tasks:**
    1.  Implement `QueueSchedulerService` (`core/application/queue/queue-scheduler.service.ts`) with logic for delayed jobs, stalled jobs, repeatable jobs, and dependencies.
    2.  Unit & Integration tests for `QueueSchedulerService` functions.

**Phase 5: Integration, Refinement & Comprehensive Testing**
*   **Objective:** Integrate the new system into the application and ensure its stability.
*   **Tasks:**
    1.  Integrate with `GenericAgentExecutor`, `TaskManagerTool`, UI components.
    2.  Set up Dependency Injection.
    3.  Implement Configuration mechanisms.
    4.  Conduct comprehensive End-to-End testing.
    5.  Update all relevant project documentation.

## 5. Integration with Existing Components

*   **`GenericAgentExecutor`:**
    *   The `GenericAgentExecutor.processJob(job)` method is a strong candidate to be the *processor function* passed to a `JobWorkerService`.
    *   A `JobWorkerService` instance would be created for the specific queue/role that the `GenericAgentExecutor` handles.
    *   The `job` object received by `GenericAgentExecutor.processJob` would be an instance of our new `Job` entity/interface, providing methods like `job.updateProgress()` and access to `job.data.agentState`.
    *   The `GenericAgentExecutor` would no longer be responsible for fetching jobs or directly managing their lifecycle outside its execution scope; this would be handled by the `JobWorkerService` and the queue system.

*   **`TaskManagerTool` (and other job-creating tools/services):**
    *   Currently, these tools might create job-like structures or interact with an older job system.
    *   They will be refactored to use the new `JobQueueService.add()` method.
    *   This involves constructing the `JobOptions` (priority, delay, retries, dependencies) as needed and providing the correct `queueName`, `jobName`, and `payload`.

*   **Dependency Injection (DI):**
    *   Services like `DrizzleJobRepository`, `InMemoryJobEventEmitter`, `JobQueueService`, `JobWorkerService`, and `QueueSchedulerService` should be managed by a DI container (e.g., InversifyJS, if already in use in `src_refactored`, or a simple factory pattern).
    *   The Drizzle client instance and `JobEventEmitter` instance will be key dependencies injected into queue services.

*   **Configuration:**
    *   Queue names, default job options per queue, worker concurrency levels, and scheduler polling intervals should be configurable. This might involve a new configuration service or extending existing configuration mechanisms.
    *   The existing `Queue` domain entity (`core/domain/queue/queue.entity.ts`) could be used to store and retrieve some of these configurations from the database.

*   **UI Components:**
    *   Any UI components that list jobs, show queue status, or allow manual job operations will need to be updated to use the new `JobQueueService` API for fetching data and performing actions.

This integration plan provides a roadmap for incorporating the new queue system. Detailed API contracts and interaction patterns will be further refined during each implementation phase.
