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
        -   `Job`: Represents a task, includes `targetAgentRole`, and `data.agentState` (which holds `conversationHistory` and `executionHistory`).
        -   `Queue`: For job organization.
        -   `AgentPersonaTemplate`: Defines agent blueprints (role, goal, backstory, toolset).
        -   `Annotation`: For agent notes/logs.
        -   `MemoryItem`: For agent's persistent knowledge, including embeddings.
        -   `job-processing.types.ts`: Contains `AgentJobState`, `ExecutionHistoryEntry`, `AgentExecutorResult` types.
    *   **Domain Services:** (`src/core/domain/services/`)
        -   `WorkerService`: Polls queues, retrieves jobs matching its `handlesRole` (using `findPendingByRole`), and uses an `IAgentExecutor` to process them. Manages job lifecycle based on executor results, including saving updated `job.data.agentState`.
    *   **Application Ports (Interfaces):** (`src/core/ports/`)
        -   Repositories: `IJobRepository`, `IQueueRepository`, `IAnnotationRepository`, `IAgentPersonaTemplateRepository`, `IMemoryRepository`.
        -   Agent Execution: `IAgentExecutor` - defines the contract for processing a job by an agent.
        -   Tools: `IAgentTool` - defines the contract for agent capabilities (name, description, Zod `parameters` schema, `execute` method).
    *   **Application UseCases:** (`src/core/application/use-cases/`)
        -   Encapsulate business logic. For instance, `AnnotationTool`, `TaskManagerTool`, and `MemoryTool` leverage UseCases (e.g., `SaveMemoryItemUseCase`, `SearchSimilarMemoryItemsUseCase`) due to their interactions with domain entities and repositories.
        -   `FileSystemTool` methods might directly use `fs/promises` (after Zod validation and path sandboxing) for simpler file operations, bypassing specific UseCases if the logic is self-contained.
        -   `EmbeddingService` is used by `SaveMemoryItemUseCase` and `SearchSimilarMemoryItemsUseCase` to generate embeddings. *Ideally, these use cases would depend on an `IEmbeddingService` port.*

*   **Infrastructure Layer:**
    *   **Agent Implementation:** (`src/infrastructure/agents/`)
        -   `GenericAgentExecutor`: The concrete implementation of `IAgentExecutor`. It takes an `AgentPersonaTemplate` and `ToolRegistry`. It uses an AI SDK (e.g., `ai-sdk` with DeepSeek) for LLM-driven iterative planning and execution of tool calls based on `conversationHistory`.
    *   **Tool Implementations & Registry:** (`src/infrastructure/tools/`)
        -   Concrete tools: `FileSystemTool`, `AnnotationTool`, `TaskManagerTool`, `TerminalTool`, `MemoryTool`. Each provides `get<ToolName>ToolDefinitions` functions that return `IAgentTool[]`.
        -   `ToolRegistry`: A singleton that holds all registered `IAgentTool` definitions.
    *   **Repository Implementations:** (`src/infrastructure/repositories/`)
        -   Drizzle Repositories: `DrizzleJobRepository`, `DrizzleQueueRepository`, `DrizzleAnnotationRepository`, `DrizzleMemoryRepository` (interacting with SQLite).
        -   `FileSystemAgentPersonaTemplateRepository`: Manages `AgentPersonaTemplate` definitions by loading them from JSON files in `config/personas/`.
    *   **Database & Vector Storage:**
        -   The system uses SQLite as its primary database, managed by Drizzle ORM.
        -   It utilizes the `sqlite-vec` SQLite extension for efficient vector similarity searches, crucial for the `MemoryTool`'s semantic retrieval.
        -   `sqlite-vec` is loaded as an extension in `src/infrastructure/services/drizzle/index.ts` (requires the user to provide the binary in `./sqlite_extensions/`).
        -   A virtual table, `vss_memory_items`, is created via a custom Drizzle migration (see `docs/manual-migrations/create_vss_memory_items.sql`) to index embeddings from the `memory_items` table. This table uses `sqlite-vec`'s `vss0` module.
        -   `DrizzleMemoryRepository` handles synchronization between `memory_items` (storing `embedding` as BLOB) and `vss_memory_items`.
    *   **AI Services:** (`src/infrastructure/services/ai/`)
        -   `EmbeddingService`: Responsible for generating text embeddings. It uses `ai-sdk`'s `embed` function, defaulting to OpenAI's `text-embedding-3-small` model (1536 dimensions), requiring an `OPENAI_API_KEY`. It provides `generateEmbedding(text: string): Promise<EmbeddingResult>` and exposes embedding `dimensions`.
    *   **External Service Integrations:** AI SDKs (`ai`, `@ai-sdk/deepseek`, etc.), database drivers.
    *   **Application Entry Point / Setup:** (`src/main.ts`)
        -   Handles dependency injection: instantiates repositories, AI services (like `EmbeddingService`), tools, registers tools with `ToolRegistry`, creates configured `GenericAgentExecutor` instances (as `IAgentExecutor`), and sets up `WorkerService` instances for specific roles.

## 3. Key Architectural Components and Flows

### 3.1. Agent Definition: `AgentPersonaTemplate`
-   **Location:** `src/core/domain/entities/agent/persona-template.types.ts`
-   **Purpose:** Defines the blueprint for an agent type, including its `role`, `goal`, `backstory`, and crucially, `toolNames` (a list of tool IDs it is proficient with).
-   **Managed by:** `IAgentPersonaTemplateRepository` (implemented by `FileSystemAgentPersonaTemplateRepository`, which loads them from JSON files in `config/personas/`).

### 3.2. Tool Definition and Management
-   **Interface (`IAgentTool`):** `src/core/tools/tool.interface.ts` - common contract for all tools (name, description, `parameters` Zod schema, `execute` method).
-   **Implementations:** Concrete tool classes (e.g., `FileSystemTool`, `AnnotationTool`, `TaskTool`, `TerminalTool`, `MemoryTool`) are in `src/infrastructure/tools/`. Each of these files also exports a `get<ToolName>ToolDefinitions(toolInstance: ToolClass): IAgentTool[]` function. These functions create an array of `IAgentTool` definitions, one for each method of the tool class instance, correctly binding the `execute` method and associating the appropriate Zod schema for its `parameters`.
-   **`ToolRegistry`:** `src/infrastructure/tools/tool-registry.ts` - a singleton where all individual `IAgentTool` definitions (generated by the `get<ToolName>ToolDefinitions` functions) are registered at startup.
-   **AI SDK Tool Preparation**: The `GenericAgentExecutor`, in its `prepareAiToolsForPersona` method, retrieves the relevant `IAgentTool` definitions from the `ToolRegistry` based on the persona's `toolNames`. It then converts these `IAgentTool` definitions into the format expected by the `ai-sdk` (specifically, objects compatible with `ai-sdk`'s `tool` helper function) for use in LLM calls. The `ToolRegistry` itself is now simpler and does not handle this conversion.

### 3.3. Agent Execution: `IAgentExecutor` and `GenericAgentExecutor`
-   **Interface (`IAgentExecutor`):** `src/core/ports/agent/agent-executor.interface.ts` - defines `processJob(job: Job): Promise<AgentExecutorResult>`. This is the abstraction the `WorkerService` uses. The `GenericAgentExecutor` instance is pre-configured with its persona, so it's not passed in `processJob`.
-   **Implementation (`GenericAgentExecutor`):** `src/infrastructure/agents/generic-agent-executor.ts`
    -   Instantiated with a specific `AgentPersonaTemplate` and the `ToolRegistry`.
    -   Dynamically prepares the tools allowed for its persona for use with `ai-sdk` (using `aiToolHelper`).
    -   **Iterative Processing Logic:**
        -   The `processJob` method manages an iterative conversation with an LLM.
        -   `AgentJobState` (stored in `job.data.agentState`) now primarily uses `conversationHistory: Message[]` (from `ai` package) to maintain the state of the interaction. The explicit `currentPlan` and `completedSteps` fields have been removed from `AgentJobState`.
        -   In each call to `processJob` (if the task is not yet complete):
            -   If `conversationHistory` is empty, an initial system prompt (with persona, goal, available tools, error handling guidance) and a user prompt (with the job's goal) are added.
            -   It calls `ai-sdk`'s `generateObject` function, passing the current `conversationHistory` and the prepared tools. It uses `maxToolRoundtrips: 1` to handle one tool call cycle per `processJob` invocation.
            -   The LLM decides the next step: either call a tool or provide a final answer (matching a Zod schema for the final output).
            -   If the LLM calls a tool:
                -   `ai-sdk` executes the tool. The tool call and its result (or error) are automatically added to `conversationHistory` by `ai-sdk`.
                -   `GenericAgentExecutor` updates `job.data.agentState` with the new history and records the action in `executionHistory`.
                -   It returns an `AgentExecutorResult` with `status: 'CONTINUE_PROCESSING'`.
            -   If the LLM provides a final answer:
                -   The interaction is considered complete. `GenericAgentExecutor` returns `status: 'COMPLETED'`.
        -   **Error Handling & Re-planning:** The system prompt guides the LLM to analyze tool errors present in the `conversationHistory` and adapt its approach (retry, use different tool, or conclude failure). `GenericAgentExecutor` also has try-catch blocks for LLM/tool errors.
        -   **Context Summarization:** To manage context length for long-running tasks, `GenericAgentExecutor` now implements a history summarization mechanism. If the `conversationHistory` (stored in `job.data.agentState`) exceeds a configurable threshold (e.g., `MAX_HISTORY_MESSAGES_BEFORE_SUMMARY = 20 messages`), a private method `_summarizeOldestMessages` is invoked before the main LLM call for the current turn. This method preserves a few initial messages (like system prompt and initial goal), then takes a chunk of the subsequent oldest messages (e.g., 10 messages) and uses an LLM to generate a concise summary. This summary then replaces the original chunk in the `conversationHistory`, effectively reducing its length while attempting to retain key information from earlier parts of the interaction. This process is crucial for maintaining operational capability within LLM token limits during extended tasks.

        #### LLM-Driven Re-planning on Significant Errors

        To handle situations where a sequence of tool calls (an implicit plan) leads to unrecoverable errors, `GenericAgentExecutor` supports LLM-driven re-planning:

        1.  **LLM Signal:** The system prompt guides the LLM to analyze tool execution errors (available in `conversationHistory`). If the LLM determines its current approach is fundamentally flawed and a new plan is needed, it can signal this by including `requestReplan: true` in its structured response (as defined by the Zod schema used in `generateObject`). It should also provide a reason for the re-plan in its `finalSummary`.
        2.  **Agent Action on Re-plan Signal:** If `GenericAgentExecutor` receives `requestReplan: true` from the LLM:
            *   It logs the initiation of a re-plan.
            *   It calls an internal helper method (`_summarizeFailedAttempt`) which uses another LLM call (e.g., `generateText`) to create a concise summary of the conversation history that led to the failure and the LLM's reason for requesting the re-plan.
            *   The `agentState.conversationHistory` is then effectively reset for a new planning cycle by clearing it.
            *   The generated `failureSummary` is stored in `job.data.lastFailureSummary`.
            *   The executor returns `status: 'CONTINUE_PROCESSING'`.
        3.  **New Planning Cycle:** On the next processing turn for the job, the `GenericAgentExecutor` will find an empty `conversationHistory`. Its logic for constructing initial prompts has been enhanced to check for `job.data.lastFailureSummary`. If present, this summary is included in the initial user prompt to the LLM, providing context about the previous failure before the LLM generates a completely new plan (sequence of tool calls).

        This mechanism allows the agent to autonomously decide to abandon a failing strategy and attempt a new one, leveraging the LLM's reasoning to learn from the context of the failure.
    -   **State Management:** Relies on `job.data.agentState` (specifically `conversationHistory` and `executionHistory`) being persisted by `WorkerService` between `CONTINUE_PROCESSING` steps.
    -   **Returns:** `AgentExecutorResult` (`status: 'COMPLETED' | 'FAILED' | 'CONTINUE_PROCESSING'`).

### 3.4. Job Processing by `WorkerService`
-   **Location:** `src/core/domain/services/worker.service.ts`
-   **Configuration:** Each `WorkerService` instance is configured for a specific `handlesRole` in `main.ts` (or other setup locations) and injected with an `IAgentExecutor` instance (which is a `GenericAgentExecutor` pre-configured for that role's persona template and the global `toolRegistry`).
-   **Workflow:**
    1.  Polls its assigned queue for jobs using `this.jobRepository.findPendingByRole(queueId, this.handlesRole, limit)`, which efficiently filters jobs at the database level based on the `targetAgentRole` of the job.
    2.  Marks the job as `ACTIVE` and saves it (important for locking and persisting initial state, including any existing `job.data.agentState`).
    3.  Calls `this.agentExecutor.processJob(job)`.
    4.  Handles the `AgentExecutorResult`:
        -   **`CONTINUE_PROCESSING`**: `GenericAgentExecutor` has updated `job.data.agentState` (with new `conversationHistory` etc.). `WorkerService` saves the job (persisting this state) and sets its status back to `WAITING` (or `DELAYED`) for the next processing cycle/iteration.
        -   **`COMPLETED`**: Updates job status to `COMPLETED` with output from executor, saves job.
        -   **`FAILED`**: Updates job status to `FAILED` with error message, saves job.

### 3.5. Dependency Flow
-   **Infrastructure -> Core Ports/Domain:** `GenericAgentExecutor` implements `IAgentExecutor`. Drizzle repositories implement `IRepository` interfaces. Concrete tools (via their `get<ToolName>ToolDefinitions` functions) provide `IAgentTool` definitions.
-   **Core Domain/Services -> Core Ports:** `WorkerService` depends on `IAgentExecutor` and `IRepository` interfaces.
-   **Entry Point (`main.ts`):** Composes the application by instantiating concrete classes from infrastructure (Repositories, `EmbeddingService`, Tool classes, `GenericAgentExecutor`) and injecting them into services or other components that expect core abstractions. Tools are registered into `ToolRegistry`.

## 4. How to Define and Run a New Autonomous Agent Type

1.  **Define `AgentPersonaTemplate`:** Create a new JSON file in `config/personas/` (e.g., `my_new_agent_v1.json`). This file will be automatically loaded by `FileSystemAgentPersonaTemplateRepository`. Specify its `id`, `role`, `goal`, `backstory`, and `toolNames` it's allowed to use (these tool names must match those registered in `ToolRegistry`).
2.  **Ensure Tools are Registered:** If the new persona requires new tools not yet implemented, create their `IAgentTool` definitions, classes, and UseCases as needed, then register them in `ToolRegistry` (typically in `main.ts` during application startup).
3.  **Configure `WorkerService` in `main.ts`:**
    *   In `main.ts`, add the new role to the `rolesToActivate` array.
    *   The existing loop will then:
        *   Fetch the new `AgentPersonaTemplate` using `personaTemplateRepository.findByRole()`.
        *   Instantiate a `GenericAgentExecutor` with this template and the global `ToolRegistry`.
        *   Instantiate a `WorkerService`, providing it with repositories, the new `IAgentExecutor` instance, and the `role` this worker will handle.
        *   Define/assign a queue for this worker (e.g., based on role name) and start the worker.
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
            MemoryItemEntity["MemoryItem Entity (embedding)"]
            JobProcessingTypes["JobProcessingTypes (AgentJobState w/ conversationHistory, etc.)"]
        end
        subgraph "Domain Services"
            WorkerService["WorkerService (handlesRole, IAgentExecutor, findPendingByRole)"]
        end
        subgraph "Ports (Interfaces)"
            IJobRepo["IJobRepository (findPendingByRole)"]
            IQueueRepo["IQueueRepository"]
            IAnnotationRepo["IAnnotationRepository"]
            IMemoryRepo["IMemoryRepository (searchSimilar)"]
            IPersonaRepo["IAgentPersonaTemplateRepository"]
            IAgentExecutorPort["IAgentExecutor"]
            IAgentToolPort["IAgentTool (parameters)"]
        end
        subgraph "Application UseCases"
            JobUseCases["Job UseCases"]
            AnnotationUseCases["Annotation UseCases"]
            MemoryUseCases["Memory UseCases (SaveMemoryItem, SearchSimilarMemoryItems)"]
        end
    end

    subgraph "Infrastructure Layer"
        direction TB
        Main["main.ts (Composition Root)"]
        subgraph "Agent Implementation"
            GenericAgentExecutorImpl["GenericAgentExecutor (implements IAgentExecutor, iterative, conversationHistory)"]
        end
        subgraph "Tools"
            ToolRegistryInfra["ToolRegistry (stores IAgentTool definitions)"]
            FileSystemToolInfra["FileSystemTool (+ getFileSystemToolDefinitions)"]
            AnnotationToolInfra["AnnotationTool (+ getAnnotationToolDefinitions)"]
            TaskManagerToolInfra["TaskManagerTool (+ getTaskToolDefinitions)"]
            TerminalToolInfra["TerminalTool (+ getTerminalToolDefinitions)"]
            MemoryToolInfra["MemoryTool (+ getMemoryToolDefinitions, uses semantic search)"]
        end
        subgraph "Repositories"
            DrizzleJobRepo["DrizzleJobRepository (implements IJobRepo)"]
            DrizzleQueueRepo["DrizzleQueueRepository (implements IQueueRepo)"]
            DrizzleAnnotationRepo["DrizzleAnnotationRepository (implements IAnnotationRepo)"]
            DrizzleMemoryRepo["DrizzleMemoryRepository (implements IMemoryRepo, syncs with VSS)"]
            FileSystemPersonaRepoInfra["FileSystemAgentPersonaTemplateRepository (implements IPersonaRepo, loads from JSON)"]
        end
        subgraph "AI & Database Services"
            AISDK["AI SDK (ai, @ai-sdk/deepseek)"]
            EmbeddingServiceInfra["EmbeddingService (uses AI SDK)"]
            SQLiteDB["SQLite Database (+ sqlite-vec extension)"]
            VSSMemoryTable["vss_memory_items (Virtual Table)"]
        end
    end

    Main --> EmbeddingServiceInfra
    Main --> FileSystemPersonaRepoInfra
    Main --> DrizzleAnnotationRepo
    Main --> DrizzleMemoryRepo
    Main --> DrizzleJobRepo
    Main --> DrizzleQueueRepo

    Main --> AnnotationUseCases
    Main --> MemoryUseCases
    Main --> JobUseCases

    Main --> FileSystemToolInfra
    Main --> AnnotationToolInfra
    Main --> TaskManagerToolInfra
    Main --> TerminalToolInfra
    Main --> MemoryToolInfra
    Main --> ToolRegistryInfra

    Main --> WorkerService
    Main --> GenericAgentExecutorImpl # For WorkerService instantiation

    AnnotationUseCases --> IAnnotationRepo
    MemoryUseCases --> IMemoryRepo
    MemoryUseCases --> EmbeddingServiceInfra # Ideally via Port
    JobUseCases --> IJobRepo

    FileSystemToolInfra -- provides --> IAgentToolPort
    AnnotationToolInfra -- provides --> IAgentToolPort
    TaskManagerToolInfra -- provides --> IAgentToolPort
    TerminalToolInfra -- provides --> IAgentToolPort
    MemoryToolInfra -- provides --> IAgentToolPort

    ToolRegistryInfra -. registers/gets .-> IAgentToolPort

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
    DrizzleMemoryRepo --> SQLiteDB
    DrizzleMemoryRepo --> VSSMemoryTable # For VSS operations
    VSSMemoryTable -. uses .-> SQLiteDB # sqlite-vec extension
\`\`\`


This refactored architecture provides a clear separation of concerns, enhances testability, and makes the system more extensible for adding new agent capabilities and personas.
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
        -   `Job`: Represents a task, includes `targetAgentRole`, and `data.agentState` (which holds `conversationHistory` and `executionHistory`).
        -   `Queue`: For job organization.
        -   `AgentPersonaTemplate`: Defines agent blueprints (role, goal, backstory, toolset).
        -   `Annotation`: For agent notes/logs.
        -   `MemoryItem`: For agent's persistent knowledge, including embeddings.
        -   `job-processing.types.ts`: Contains `AgentJobState`, `ExecutionHistoryEntry`, `AgentExecutorResult` types.
    *   **Domain Services:** (`src/core/domain/services/`)
        -   `WorkerService`: Polls queues, retrieves jobs matching its `handlesRole` (using `findPendingByRole`), and uses an `IAgentExecutor` to process them. Manages job lifecycle based on executor results, including saving updated `job.data.agentState`.
    *   **Application Ports (Interfaces):** (`src/core/ports/`)
        -   Repositories: `IJobRepository`, `IQueueRepository`, `IAnnotationRepository`, `IAgentPersonaTemplateRepository`, `IMemoryRepository`.
        -   Agent Execution: `IAgentExecutor` - defines the contract for processing a job by an agent.
        -   Tools: `IAgentTool` - defines the contract for agent capabilities (name, description, Zod `parameters` schema, `execute` method).
    *   **Application UseCases:** (`src/core/application/use-cases/`)
        -   Encapsulate business logic. For instance, `AnnotationTool`, `TaskManagerTool`, and `MemoryTool` leverage UseCases (e.g., `SaveMemoryItemUseCase`, `SearchSimilarMemoryItemsUseCase`) due to their interactions with domain entities and repositories.
        -   `FileSystemTool` methods might directly use `fs/promises` (after Zod validation and path sandboxing) for simpler file operations, bypassing specific UseCases if the logic is self-contained.
        -   `EmbeddingService` is used by `SaveMemoryItemUseCase` and `SearchSimilarMemoryItemsUseCase` to generate embeddings. *Ideally, these use cases would depend on an `IEmbeddingService` port.*

*   **Infrastructure Layer:**
    *   **Agent Implementation:** (`src/infrastructure/agents/`)
        -   `GenericAgentExecutor`: The concrete implementation of `IAgentExecutor`. It takes an `AgentPersonaTemplate` and `ToolRegistry`. It uses an AI SDK (e.g., `ai-sdk` with DeepSeek) for LLM-driven iterative planning and execution of tool calls based on `conversationHistory`.
    *   **Tool Implementations & Registry:** (`src/infrastructure/tools/`)
        -   Concrete tools: `FileSystemTool`, `AnnotationTool`, `TaskManagerTool`, `TerminalTool`, `MemoryTool`. Each provides `get<ToolName>ToolDefinitions` functions that return `IAgentTool[]`.
        -   `ToolRegistry`: A singleton that holds all registered `IAgentTool` definitions.
    *   **Repository Implementations:** (`src/infrastructure/repositories/`)
        -   Drizzle Repositories: `DrizzleJobRepository`, `DrizzleQueueRepository`, `DrizzleAnnotationRepository`, `DrizzleMemoryRepository` (interacting with SQLite).
        -   `FileSystemAgentPersonaTemplateRepository`: Manages `AgentPersonaTemplate` definitions by loading them from JSON files in `config/personas/`.
    *   **Database & Vector Storage:**
        -   The system uses SQLite as its primary database, managed by Drizzle ORM.
        -   It utilizes the `sqlite-vec` SQLite extension for efficient vector similarity searches, crucial for the `MemoryTool`'s semantic retrieval.
        -   `sqlite-vec` is loaded as an extension in `src/infrastructure/services/drizzle/index.ts` (requires the user to provide the binary in `./sqlite_extensions/`).
        -   A virtual table, `vss_memory_items`, is created via a custom Drizzle migration (see `docs/manual-migrations/create_vss_memory_items.sql`) to index embeddings from the `memory_items` table. This table uses `sqlite-vec`'s `vss0` module.
        -   `DrizzleMemoryRepository` handles synchronization between `memory_items` (storing `embedding` as BLOB) and `vss_memory_items`.
    *   **AI Services:** (`src/infrastructure/services/ai/`)
        -   `EmbeddingService`: Responsible for generating text embeddings. It uses `ai-sdk`'s `embed` function, defaulting to OpenAI's `text-embedding-3-small` model (1536 dimensions), requiring an `OPENAI_API_KEY`. It provides `generateEmbedding(text: string): Promise<EmbeddingResult>` and exposes embedding `dimensions`.
    *   **External Service Integrations:** AI SDKs (`ai`, `@ai-sdk/deepseek`, etc.), database drivers.
    *   **Application Entry Point / Setup:** (`src/main.ts`)
        -   Handles dependency injection: instantiates repositories, AI services (like `EmbeddingService`), tools, registers tools with `ToolRegistry`, creates configured `GenericAgentExecutor` instances (as `IAgentExecutor`), and sets up `WorkerService` instances for specific roles.

## 3. Key Architectural Components and Flows

### 3.1. Agent Definition: `AgentPersonaTemplate`
-   **Location:** `src/core/domain/entities/agent/persona-template.types.ts`
-   **Purpose:** Defines the blueprint for an agent type, including its `role`, `goal`, `backstory`, and crucially, `toolNames` (a list of tool IDs it is proficient with).
-   **Managed by:** `IAgentPersonaTemplateRepository` (implemented by `FileSystemAgentPersonaTemplateRepository`, which loads them from JSON files in `config/personas/`).

### 3.2. Tool Definition and Management
-   **Interface (`IAgentTool`):** `src/core/tools/tool.interface.ts` - common contract for all tools (name, description, `parameters` Zod schema, `execute` method).
-   **Implementations:** Concrete tool classes (e.g., `FileSystemTool`, `AnnotationTool`, `TaskTool`, `TerminalTool`, `MemoryTool`) are in `src/infrastructure/tools/`. Each of these files also exports a `get<ToolName>ToolDefinitions(toolInstance: ToolClass): IAgentTool[]` function. These functions create an array of `IAgentTool` definitions, one for each method of the tool class instance, correctly binding the `execute` method and associating the appropriate Zod schema for its `parameters`.
-   **`ToolRegistry`:** `src/infrastructure/tools/tool-registry.ts` - a singleton where all individual `IAgentTool` definitions (generated by the `get<ToolName>ToolDefinitions` functions) are registered at startup.
-   **AI SDK Tool Preparation**: The `GenericAgentExecutor`, in its `prepareAiToolsForPersona` method, retrieves the relevant `IAgentTool` definitions from the `ToolRegistry` based on the persona's `toolNames`. It then converts these `IAgentTool` definitions into the format expected by the `ai-sdk` (specifically, objects compatible with `ai-sdk`'s `tool` helper function) for use in LLM calls. The `ToolRegistry` itself is now simpler and does not handle this conversion.

### 3.3. Agent Execution: `IAgentExecutor` and `GenericAgentExecutor`
-   **Interface (`IAgentExecutor`):** `src/core/ports/agent/agent-executor.interface.ts` - defines `processJob(job: Job): Promise<AgentExecutorResult>`. This is the abstraction the `WorkerService` uses. The `GenericAgentExecutor` instance is pre-configured with its persona, so it's not passed in `processJob`.
-   **Implementation (`GenericAgentExecutor`):** `src/infrastructure/agents/generic-agent-executor.ts`
    -   Instantiated with a specific `AgentPersonaTemplate` and the `ToolRegistry`.
    -   Dynamically prepares the tools allowed for its persona for use with `ai-sdk` (using `aiToolHelper`).
    -   **Iterative Processing Logic:**
        -   The `processJob` method manages an iterative conversation with an LLM.
        -   `AgentJobState` (stored in `job.data.agentState`) now primarily uses `conversationHistory: Message[]` (from `ai` package) to maintain the state of the interaction. The explicit `currentPlan` and `completedSteps` fields have been removed from `AgentJobState`.
        -   In each call to `processJob` (if the task is not yet complete):
            -   If `conversationHistory` is empty, an initial system prompt (with persona, goal, available tools, error handling guidance) and a user prompt (with the job's goal) are added.
            -   It calls `ai-sdk`'s `generateObject` function, passing the current `conversationHistory` and the prepared tools. It uses `maxToolRoundtrips: 1` to handle one tool call cycle per `processJob` invocation.
            -   The LLM decides the next step: either call a tool or provide a final answer (matching a Zod schema for the final output).
            -   If the LLM calls a tool:
                -   `ai-sdk` executes the tool. The tool call and its result (or error) are automatically added to `conversationHistory` by `ai-sdk`.
                -   `GenericAgentExecutor` updates `job.data.agentState` with the new history and records the action in `executionHistory`.
                -   It returns an `AgentExecutorResult` with `status: 'CONTINUE_PROCESSING'`.
            -   If the LLM provides a final answer:
                -   The interaction is considered complete. `GenericAgentExecutor` returns `status: 'COMPLETED'`.
        -   **Error Handling & Re-planning:** The system prompt guides the LLM to analyze tool errors present in the `conversationHistory` and adapt its approach (retry, use different tool, or conclude failure). `GenericAgentExecutor` also has try-catch blocks for LLM/tool errors.
        -   **Context Summarization:** To manage context length for long-running tasks, `GenericAgentExecutor` now implements a history summarization mechanism. If the `conversationHistory` (stored in `job.data.agentState`) exceeds a configurable threshold (e.g., `MAX_HISTORY_MESSAGES_BEFORE_SUMMARY = 20 messages`), a private method `_summarizeOldestMessages` is invoked before the main LLM call for the current turn. This method preserves a few initial messages (like system prompt and initial goal), then takes a chunk of the subsequent oldest messages (e.g., 10 messages) and uses an LLM to generate a concise summary. This summary then replaces the original chunk in the `conversationHistory`, effectively reducing its length while attempting to retain key information from earlier parts of the interaction. This process is crucial for maintaining operational capability within LLM token limits during extended tasks.

        #### Requirement Clarification by Asking Questions

        To handle ambiguous or underspecified job goals, the `GenericAgentExecutor` incorporates a mechanism for the LLM to proactively ask clarifying questions before proceeding with planning or execution:

        1.  **System Prompt Guidance:** The system prompt for the `GenericAgentExecutor` (when `conversationHistory` is initialized) now includes instructions for the LLM to first assess the clarity of the `jobGoal`. If the goal is found to be ambiguous, lacking detail, or open to multiple interpretations, the LLM is guided to formulate specific questions.
        2.  **LLM Output Schema:** The Zod schema used with `ai-sdk`'s `generateObject` (which defines the expected structure of the LLM's response when it's not calling a tool) has been updated with an optional field: `clarifyingQuestions: z.array(z.string())`. The LLM is instructed to populate this field if it needs to ask questions.
        3.  **Agent Logic in `processJob`:** When `GenericAgentExecutor` receives a response from the LLM:
            *   It first checks if the `clarifyingQuestions` array is present and populated in the LLM's response object.
            *   If questions exist, the executor prioritizes handling them. It will:
                *   Log that questions were asked.
                *   Use its internally injected `AnnotationTool` instance to save these questions as an annotation. This annotation is associated with the current agent's persona ID and the job ID, and tagged (e.g., with 'clarification_needed', `job:<ID>`) for easier filtering and review by a user or another process.
                *   The `executionHistory` within `job.data.agentState` is updated to record this event.
                *   The `processJob` method then returns an `AgentExecutorResult` with `status: 'CONTINUE_PROCESSING'` and a message indicating that the agent has clarifying questions and is awaiting further input or context (which would typically be provided by updating the job's payload or via a separate communication channel, then re-running the job).
            *   Crucially, if clarifying questions are asked, the agent does not proceed with tool calls or other plan execution steps in that same turn. It effectively pauses to await clarification.
        4.  **Iterative Flow:** This allows for an interactive refinement of the job goal. Once clarifications are provided (e.g., by updating the job's payload with answers or more details), the `WorkerService` will pick up the job again, and the `GenericAgentExecutor` will re-engage the LLM with the updated context (including the previous questions and newly provided answers as part of the `conversationHistory`).

        This capability enhances the agent's autonomy by allowing it to seek necessary information before committing to potentially incorrect plans or actions, leading to more robust and accurate task completion.

        #### LLM-Driven Re-planning on Significant Errors

        To handle situations where a sequence of tool calls (an implicit plan) leads to unrecoverable errors, `GenericAgentExecutor` supports LLM-driven re-planning:

        1.  **LLM Signal:** The system prompt guides the LLM to analyze tool execution errors (available in `conversationHistory`). If the LLM determines its current approach is fundamentally flawed and a new plan is needed, it can signal this by including `requestReplan: true` in its structured response (as defined by the Zod schema used in `generateObject`). It should also provide a reason for the re-plan in its `finalSummary`.
        2.  **Agent Action on Re-plan Signal:** If `GenericAgentExecutor` receives `requestReplan: true` from the LLM:
            *   It logs the initiation of a re-plan.
            *   It calls an internal helper method (`_summarizeFailedAttempt`) which uses another LLM call (e.g., `generateText`) to create a concise summary of the conversation history that led to the failure and the LLM's reason for requesting the re-plan.
            *   The `agentState.conversationHistory` is then effectively reset for a new planning cycle by clearing it.
            *   The generated `failureSummary` is stored in `job.data.lastFailureSummary`.
            *   The executor returns `status: 'CONTINUE_PROCESSING'`.
        3.  **New Planning Cycle:** On the next processing turn for the job, the `GenericAgentExecutor` will find an empty `conversationHistory`. Its logic for constructing initial prompts has been enhanced to check for `job.data.lastFailureSummary`. If present, this summary is included in the initial user prompt to the LLM, providing context about the previous failure before the LLM generates a completely new plan (sequence of tool calls).

        This mechanism allows the agent to autonomously decide to abandon a failing strategy and attempt a new one, leveraging the LLM's reasoning to learn from the context of the failure.
    -   **State Management:** Relies on `job.data.agentState` (specifically `conversationHistory` and `executionHistory`) being persisted by `WorkerService` between `CONTINUE_PROCESSING` steps.
    -   **Returns:** `AgentExecutorResult` (`status: 'COMPLETED' | 'FAILED' | 'CONTINUE_PROCESSING'`).

### 3.4. Job Processing by `WorkerService`
-   **Location:** `src/core/domain/services/worker.service.ts`
-   **Configuration:** Each `WorkerService` instance is configured for a specific `handlesRole` in `main.ts` (or other setup locations) and injected with an `IAgentExecutor` instance (which is a `GenericAgentExecutor` pre-configured for that role's persona template and the global `toolRegistry`).
-   **Workflow:**
    1.  Polls its assigned queue for jobs using `this.jobRepository.findPendingByRole(queueId, this.handlesRole, limit)`, which efficiently filters jobs at the database level based on the `targetAgentRole` of the job.
    2.  Marks the job as `ACTIVE` and saves it (important for locking and persisting initial state, including any existing `job.data.agentState`).
    3.  Calls `this.agentExecutor.processJob(job)`.
    4.  Handles the `AgentExecutorResult`:
        -   **`CONTINUE_PROCESSING`**: `GenericAgentExecutor` has updated `job.data.agentState` (with new `conversationHistory` etc.). `WorkerService` saves the job (persisting this state) and sets its status back to `WAITING` (or `DELAYED`) for the next processing cycle/iteration.
        -   **`COMPLETED`**: Updates job status to `COMPLETED` with output from executor, saves job.
        -   **`FAILED`**: Updates job status to `FAILED` with error message, saves job.

### 3.5. Dependency Flow
-   **Infrastructure -> Core Ports/Domain:** `GenericAgentExecutor` implements `IAgentExecutor`. Drizzle repositories implement `IRepository` interfaces. Concrete tools (via their `get<ToolName>ToolDefinitions` functions) provide `IAgentTool` definitions.
-   **Core Domain/Services -> Core Ports:** `WorkerService` depends on `IAgentExecutor` and `IRepository` interfaces.
-   **Entry Point (`main.ts`):** Composes the application by instantiating concrete classes from infrastructure (Repositories, `EmbeddingService`, Tool classes, `GenericAgentExecutor`) and injecting them into services or other components that expect core abstractions. Tools are registered into `ToolRegistry`.

## 4. How to Define and Run a New Autonomous Agent Type

1.  **Define `AgentPersonaTemplate`:** Create a new JSON file in `config/personas/` (e.g., `my_new_agent_v1.json`). This file will be automatically loaded by `FileSystemAgentPersonaTemplateRepository`. Specify its `id`, `role`, `goal`, `backstory`, and `toolNames` it's allowed to use (these tool names must match those registered in `ToolRegistry`).
2.  **Ensure Tools are Registered:** If the new persona requires new tools not yet implemented, create their `IAgentTool` definitions, classes, and UseCases as needed, then register them in `ToolRegistry` (typically in `main.ts` during application startup).
3.  **Configure `WorkerService` in `main.ts`:**
    *   In `main.ts`, add the new role to the `rolesToActivate` array.
    *   The existing loop will then:
        *   Fetch the new `AgentPersonaTemplate` using `personaTemplateRepository.findByRole()`.
        *   Instantiate a `GenericAgentExecutor` with this template and the global `ToolRegistry`.
        *   Instantiate a `WorkerService`, providing it with repositories, the new `IAgentExecutor` instance, and the `role` this worker will handle.
        *   Define/assign a queue for this worker (e.g., based on role name) and start the worker.
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
            MemoryItemEntity["MemoryItem Entity (embedding)"]
            JobProcessingTypes["JobProcessingTypes (AgentJobState w/ conversationHistory, etc.)"]
        end
        subgraph "Domain Services"
            WorkerService["WorkerService (handlesRole, IAgentExecutor, findPendingByRole)"]
        end
        subgraph "Ports (Interfaces)"
            IJobRepo["IJobRepository (findPendingByRole)"]
            IQueueRepo["IQueueRepository"]
            IAnnotationRepo["IAnnotationRepository"]
            IMemoryRepo["IMemoryRepository (searchSimilar)"]
            IPersonaRepo["IAgentPersonaTemplateRepository"]
            IAgentExecutorPort["IAgentExecutor"]
            IAgentToolPort["IAgentTool (parameters)"]
        end
        subgraph "Application UseCases"
            JobUseCases["Job UseCases"]
            AnnotationUseCases["Annotation UseCases"]
            MemoryUseCases["Memory UseCases (SaveMemoryItem, SearchSimilarMemoryItems)"]
        end
    end

    subgraph "Infrastructure Layer"
        direction TB
        Main["main.ts (Composition Root)"]
        subgraph "Agent Implementation"
            GenericAgentExecutorImpl["GenericAgentExecutor (implements IAgentExecutor, iterative, conversationHistory)"]
        end
        subgraph "Tools"
            ToolRegistryInfra["ToolRegistry (stores IAgentTool definitions)"]
            FileSystemToolInfra["FileSystemTool (+ getFileSystemToolDefinitions)"]
            AnnotationToolInfra["AnnotationTool (+ getAnnotationToolDefinitions)"]
            TaskManagerToolInfra["TaskManagerTool (+ getTaskToolDefinitions)"]
            TerminalToolInfra["TerminalTool (+ getTerminalToolDefinitions)"]
            MemoryToolInfra["MemoryTool (+ getMemoryToolDefinitions, uses semantic search)"]
        end
        subgraph "Repositories"
            DrizzleJobRepo["DrizzleJobRepository (implements IJobRepo)"]
            DrizzleQueueRepo["DrizzleQueueRepository (implements IQueueRepo)"]
            DrizzleAnnotationRepo["DrizzleAnnotationRepository (implements IAnnotationRepo)"]
            DrizzleMemoryRepo["DrizzleMemoryRepository (implements IMemoryRepo, syncs with VSS)"]
            FileSystemPersonaRepoInfra["FileSystemAgentPersonaTemplateRepository (implements IPersonaRepo, loads from JSON)"]
        end
        subgraph "AI & Database Services"
            AISDK["AI SDK (ai, @ai-sdk/deepseek)"]
            EmbeddingServiceInfra["EmbeddingService (uses AI SDK)"]
            SQLiteDB["SQLite Database (+ sqlite-vec extension)"]
            VSSMemoryTable["vss_memory_items (Virtual Table)"]
        end
    end

    Main --> EmbeddingServiceInfra
    Main --> FileSystemPersonaRepoInfra
    Main --> DrizzleAnnotationRepo
    Main --> DrizzleMemoryRepo
    Main --> DrizzleJobRepo
    Main --> DrizzleQueueRepo

    Main --> AnnotationUseCases
    Main --> MemoryUseCases
    Main --> JobUseCases

    Main --> FileSystemToolInfra
    Main --> AnnotationToolInfra
    Main --> TaskManagerToolInfra
    Main --> TerminalToolInfra
    Main --> MemoryToolInfra
    Main --> ToolRegistryInfra

    Main --> WorkerService
    Main --> GenericAgentExecutorImpl # For WorkerService instantiation

    AnnotationUseCases --> IAnnotationRepo
    MemoryUseCases --> IMemoryRepo
    MemoryUseCases --> EmbeddingServiceInfra # Ideally via Port
    JobUseCases --> IJobRepo

    FileSystemToolInfra -- provides --> IAgentToolPort
    AnnotationToolInfra -- provides --> IAgentToolPort
    TaskManagerToolInfra -- provides --> IAgentToolPort
    TerminalToolInfra -- provides --> IAgentToolPort
    MemoryToolInfra -- provides --> IAgentToolPort

    ToolRegistryInfra -. registers/gets .-> IAgentToolPort

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
    DrizzleMemoryRepo --> SQLiteDB
    DrizzleMemoryRepo --> VSSMemoryTable # For VSS operations
    VSSMemoryTable -. uses .-> SQLiteDB # sqlite-vec extension
\`\`\`


This refactored architecture provides a clear separation of concerns, enhances testability, and makes the system more extensible for adding new agent capabilities and personas.
