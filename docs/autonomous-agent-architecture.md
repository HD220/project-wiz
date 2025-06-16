# Autonomous Agent System Architecture (Refactored)

This document outlines the refactored architecture of the autonomous agent system, designed to adhere to Clean Architecture principles and support multiple, persona-driven, tool-using AI agents.

## 1. Core Principles

The architecture emphasizes:
-   **Separation of Concerns:** Distinct layers for domain logic, application services, and infrastructure.
-   **Dependency Inversion:** Core layers define abstractions (interfaces/ports), and outer layers (infrastructure) implement them. Dependencies flow inwards.
-   **Modularity & Reusability:** Components like the `GenericAgentExecutor` and `ToolRegistry` promote reuse.
-   **Testability:** Decoupled components are easier to test in isolation.

## 2. Layers Overview

The system is broadly divided into:

*   **Core Layer (Domain & Application Ports):**
    *   **Domain Entities:** (`src/core/domain/entities/`)
        -   `Job`: Represents a task, now includes `targetAgentRole` and `data.agentState` for agent-managed state (`AgentJobState`, `PlanStep`).
        -   `Queue`: For job organization.
        -   `AgentPersonaTemplate`: Defines agent blueprints (role, goal, backstory, toolset).
        -   `Annotation`: For agent notes/logs.
        -   (Other domain entities...)
    *   **Domain Services:** (`src/core/domain/services/`)
        -   `WorkerService`: Polls queues, retrieves jobs matching its `handlesRole`, and uses an `IAgentExecutor` to process them. Manages job lifecycle based on executor results, including saving updated `job.data.agentState`.
    *   **Application Ports (Interfaces):** (`src/core/ports/`)
        -   Repositories: `IJobRepository`, `IQueueRepository`, `IAnnotationRepository`, `IAgentPersonaTemplateRepository`.
        -   Agent Execution: `IAgentExecutor` - defines the contract for processing a job by an agent.
        -   Tools: `IAgentTool` - defines the contract for agent capabilities (name, description, Zod parameters, execute method).
    *   **Application UseCases (optional for direct tool actions):** (`src/core/application/use-cases/`)
        -   Encapsulate business logic. For instance, `AnnotationTool` and `TaskManagerTool` leverage UseCases (`SaveAnnotationUseCase`, `SaveJobUseCase`, etc.) because their operations involve domain entity manipulation and repository interactions with business rules.
        -   In contrast, `FileSystemTool` methods might directly use `fs/promises` (after Zod validation of input parameters passed to `IAgentTool.execute` and internal path sandboxing) for straightforward file operations, bypassing specific UseCases for each file action if the logic is simple and self-contained within the tool's `execute` method. The choice depends on the complexity and domain significance of the tool's action.

*   **Infrastructure Layer:**
    *   **Agent Implementation:** (`src/infrastructure/agents/`)
        -   `GenericAgentExecutor`: The concrete implementation of `IAgentExecutor`. It takes an `AgentPersonaTemplate` and `ToolRegistry`. It uses an AI SDK (e.g., `ai-sdk` with DeepSeek) for LLM-driven planning and execution of tool calls.
    *   **Tool Implementations & Registry:** (`src/infrastructure/tools/`)
        -   Concrete tools: `FileSystemTool`, `AnnotationTool`, `TaskManagerTool`. These implement the logic for their respective `IAgentTool` definitions.
        -   `ToolRegistry`: A singleton that holds instances of all available `IAgentTool` definitions, making them discoverable.
    *   **Repository Implementations:** (`src/infrastructure/repositories/`)
        -   Drizzle Repositories: `DrizzleJobRepository`, `DrizzleQueueRepository`, `DrizzleAnnotationRepository` (interacting with SQLite).
        -   `FileSystemAgentPersonaTemplateRepository`: Manages `AgentPersonaTemplate` definitions by loading them from JSON files in `config/personas/`.
    *   **External Service Integrations:** AI SDKs (e.g., `@ai-sdk/deepseek`), database drivers.
    *   **Application Entry Point / Setup:** (`src/main.ts`)
        -   Handles dependency injection: instantiates repositories, tools, registers tools with `ToolRegistry`, creates configured `GenericAgentExecutor` instances (as `IAgentExecutor`), and sets up `WorkerService` instances for specific roles.

## 3. Key Architectural Components and Flows

### 3.1. Agent Definition: `AgentPersonaTemplate`
-   **Location:** `src/core/domain/entities/agent/persona-template.types.ts`
-   **Purpose:** Defines the blueprint for an agent type, including its `role`, `goal`, `backstory`, and crucially, `toolNames` (a list of tool IDs it is proficient with).
-   **Managed by:** `IAgentPersonaTemplateRepository` (e.g., `FileSystemAgentPersonaTemplateRepository`, which loads them from JSON files in `config/personas/`).

### 3.2. Tool Definition and Management
-   **Interface (`IAgentTool`):** `src/core/tools/tool.interface.ts` - common contract for all tools (name, description, `parameters` Zod schema, `execute` method).
-   **Implementations:** Concrete tool classes (e.g., `FileSystemTool`, `AnnotationTool`, `TaskTool`) are in `src/infrastructure/tools/`. Each of these files also exports a `get<ToolName>ToolDefinitions(toolInstance: ToolClass): IAgentTool[]` function. These functions create an array of `IAgentTool` definitions, one for each method of the tool class instance, correctly binding the `execute` method and associating the appropriate Zod schema for its parameters.
-   **`ToolRegistry`:** `src/infrastructure/tools/tool-registry.ts` - a singleton where all individual `IAgentTool` definitions (generated by the `get<ToolName>ToolDefinitions` functions) are registered at startup.
-   **AI SDK Tool Preparation**: The `GenericAgentExecutor`, in its `prepareAiToolsForPersona` method, retrieves the relevant `IAgentTool` definitions from the `ToolRegistry` based on the persona's `toolNames`. It then converts these `IAgentTool` definitions into the format expected by the `ai-sdk` (specifically, objects compatible with `ai-sdk`'s `tool` helper function) for use in LLM calls. The `ToolRegistry` itself no longer handles this conversion.

### 3.3. Agent Execution: `IAgentExecutor` and `GenericAgentExecutor`
-   **Interface (`IAgentExecutor`):** `src/core/ports/agent/agent-executor.interface.ts` - defines `processJob(job: Job): Promise<AgentExecutorResult>`. This is the abstraction the `WorkerService` uses.
-   **Implementation (`GenericAgentExecutor`):** `src/infrastructure/agents/generic-agent-executor.ts`
    -   Instantiated with a specific `AgentPersonaTemplate` and the `ToolRegistry`.
    -   Dynamically prepares the tools allowed for its persona for use with `ai-sdk` (using `aiToolHelper`).
    -   **Iterative Processing Logic:**
        -   The `processJob` method manages an iterative conversation with an LLM.
        -   `AgentJobState` (stored in `job.data.agentState`) now primarily uses `conversationHistory: Message[]` to maintain the state of the interaction. The old `currentPlan` and `completedSteps` are removed.
        -   In each call to `processJob` (if the task is not yet complete):
            -   It calls `ai-sdk`'s `generateObject` (or similar LLM interaction functions).
            -   The LLM decides on the next step: either call a tool or provide a final answer.
            -   If the LLM calls a tool:
                -   `ai-sdk` executes the tool (as `IAgentTool.execute` methods are provided in the tool definitions passed to the LLM).
                -   The tool call and its result are added to `conversationHistory` by `ai-sdk`.
                -   `GenericAgentExecutor` updates `job.data.agentState` with the new history.
                -   It returns an `AgentExecutorResult` with `status: 'CONTINUE_PROCESSING'`.
            -   If the LLM provides a final answer (matching a predefined Zod schema for the final output):
                -   The interaction is considered complete.
                -   `GenericAgentExecutor` returns `status: 'COMPLETED'`.
        -   **Error Handling & Re-planning:** The system prompt for `GenericAgentExecutor` now includes instructions for the LLM to analyze tool errors (which will be part of `conversationHistory`) and adapt its approach, either by retrying a tool with different parameters or by acknowledging that the goal cannot be achieved.
    -   **State Management:** Relies on `job.data.agentState` (specifically `conversationHistory`) being persisted by `WorkerService` between `CONTINUE_PROCESSING` steps.
    -   **Returns:** `AgentExecutorResult` (`status: 'COMPLETED' | 'FAILED' | 'CONTINUE_PROCESSING'`).

### 3.4. Job Processing by `WorkerService`
-   **Location:** `src/core/domain/services/worker.service.ts`
-   **Configuration:** Each `WorkerService` instance is configured for a specific `handlesRole` in `main.ts` (or other setup locations) and injected with an `IAgentExecutor` instance (which is a `GenericAgentExecutor` pre-configured for that role's persona template and the global `toolRegistry`).
-   **Workflow:**
    1.  Polls its assigned queue for jobs using `this.jobRepository.findPendingByRole(queueId, this.handlesRole, limit)`, which efficiently filters jobs at the database level.
    2.  Marks the job as `ACTIVE` and saves it (important for locking and initial state).
    3.  Calls `this.agentExecutor.processJob(job)`.
    4.  Handles the `AgentExecutorResult`:
        -   **`CONTINUE_PROCESSING`**: `GenericAgentExecutor` has updated `job.data.agentState`. `WorkerService` saves the job (persisting this state) and sets its status to `WAITING` (or `DELAYED`) for the next processing cycle.
        -   **`COMPLETED`**: Updates job status to `COMPLETED` with output from executor, saves job.
        -   **`FAILED`**: Updates job status to `FAILED` with error message, saves job.

### 3.5. Dependency Flow
-   **Infrastructure -> Core Ports/Domain:** `GenericAgentExecutor` implements `IAgentExecutor`. Drizzle repositories implement `IRepository` interfaces. Concrete tools provide `IAgentTool` definitions.
-   **Core Domain/Services -> Core Ports:** `WorkerService` depends on `IAgentExecutor` and `IRepository` interfaces.
-   **Entry Point (`main.ts`):** Composes the application by instantiating concrete classes from infrastructure and injecting them into services that expect core abstractions.

## 4. How to Define and Run a New Autonomous Agent Type

1.  **Define `AgentPersonaTemplate`:** Add a new template object to `InMemoryAgentPersonaTemplateRepository` (or your chosen storage), specifying its `id`, `role`, `goal`, `backstory`, and `toolNames` it's allowed to use (these tool names must match those registered in `ToolRegistry`).
2.  **Ensure Tools are Registered:** If the new persona requires new tools, implement them as `IAgentTool` definitions and register them in `ToolRegistry` (typically in `main.ts`).
3.  **Configure `WorkerService` in `main.ts`:**
    *   Fetch the new `AgentPersonaTemplate` using `IAgentPersonaTemplateRepository`.
    *   Instantiate a `GenericAgentExecutor` with this template and the `ToolRegistry`.
    *   Instantiate a `WorkerService`, providing it with the necessary repositories, the new `IAgentExecutor` instance, and the `role` this worker will handle.
    *   Define/assign a queue for this worker and start it.
4.  **Create Jobs:** Create jobs with `targetAgentRole` matching the new persona's role and a `payload.goal` for the agent to achieve.

## 5. Diagram (Conceptual)

\`\`\`mermaid
graph LR
    subgraph "Core Layer"
        direction TB
        subgraph "Domain Entities"
            Job["Job Entity (targetAgentRole, data.agentState)"]
            QueueEntity["Queue Entity"]
            PersonaTemplate["AgentPersonaTemplate"]
            AnnotationEntity["Annotation Entity"]
            JobProcessingTypes["JobProcessingTypes (AgentJobState w/ conversationHistory, etc.)"]
        end
        subgraph "Domain Services"
            WorkerService["WorkerService (handlesRole, IAgentExecutor, findPendingByRole)"]
        end
        subgraph "Ports (Interfaces)"
            IJobRepo["IJobRepository"]
            IQueueRepo["IQueueRepository"]
            IAnnotationRepo["IAnnotationRepository"]
            IPersonaRepo["IAgentPersonaTemplateRepository"]
            IAgentExecutorPort["IAgentExecutor"]
            IAgentToolPort["IAgentTool"]
        end
        subgraph "Application UseCases"
            JobUseCases["Job UseCases"]
            AnnotationUseCases["Annotation UseCases"]
        end
    end

    subgraph "Infrastructure Layer"
        direction TB
        Main["main.ts (Composition Root)"]
        subgraph "Agent Implementation"
            GenericAgentExecutorImpl["GenericAgentExecutor (implements IAgentExecutor)"]
        end
        subgraph "Tools"
            ToolRegistryInfra["ToolRegistry"]
            FileSystemToolInfra["FileSystemTool"]
            AnnotationToolInfra["AnnotationTool"]
            TaskManagerToolInfra["TaskManagerTool"]
        end
        subgraph "Repositories"
            DrizzleJobRepo["DrizzleJobRepository (implements IJobRepo)"]
            DrizzleQueueRepo["DrizzleQueueRepository (implements IQueueRepo)"]
            DrizzleAnnotationRepo["DrizzleAnnotationRepository (implements IAnnotationRepo)"]
            FileSystemPersonaRepoInfra["FileSystemAgentPersonaTemplateRepository (implements IPersonaRepo)"]
        end
        subgraph "External Services"
            AISDK["AI SDK (e.g., @ai-sdk/deepseek)"]
            SQLiteDB["SQLite Database"]
        end
    end

    Main --> DrizzleJobRepo
    Main --> DrizzleQueueRepo
    Main --> DrizzleAnnotationRepo
    Main --> FileSystemPersonaRepoInfra
    Main --> JobUseCases
    Main --> AnnotationUseCases
    Main --> FileSystemToolInfra
    Main --> AnnotationToolInfra
    Main --> TaskManagerToolInfra
    Main --> ToolRegistryInfra
    Main --> WorkerService

    JobUseCases --> IJobRepo
    AnnotationUseCases --> IAnnotationRepo

    FileSystemToolInfra --> IAgentToolPort
    AnnotationToolInfra --> IAgentToolPort
    TaskManagerToolInfra --> IAgentToolPort

    ToolRegistryInfra -. uses .-> IAgentToolPort

    WorkerService --> IQueueRepo
    WorkerService --> IJobRepo
    WorkerService --> IAgentExecutorPort
    WorkerService --> Job

    GenericAgentExecutorImpl --> PersonaTemplate
    GenericAgentExecutorImpl --> ToolRegistryInfra
    GenericAgentExecutorImpl --> AISDK
    GenericAgentExecutorImpl --> JobProcessingTypes
    GenericAgentExecutorImpl -. uses .-> IAgentToolPort # Through registry

    DrizzleJobRepo --> SQLiteDB
    DrizzleQueueRepo --> SQLiteDB
    DrizzleAnnotationRepo --> SQLiteDB
\`\`\`


This refactored architecture provides a clear separation of concerns, enhances testability, and makes the system more extensible for adding new agent capabilities and personas.
