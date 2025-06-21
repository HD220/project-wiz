# Agent Tools Example: TaskTool for Job Management

This document explains how to create and use tools within an Agent, enabling Large Language Models (LLMs) to interact with the application's services. We'll focus on the `TaskTool`, an example tool for managing jobs in an agent's queue.

## 1. Overview of Agent Tools

Agents can be equipped with "tools" that provide specific functionalities. These tools are essentially sets of functions (methods) that an LLM can decide to call to gather information or perform actions. The `ai-sdk` provides mechanisms to expose these tools to an LLM during an interaction (e.g., a `generateObject` or `generateText` call).

This example demonstrates:
- Defining UseCases for core functionalities (job management).
- Creating a `TaskTool` that utilizes these UseCases.
- How such tools are defined with `IAgentTool` interface, Zod schemas for parameters, and then registered with the central `ToolRegistry`.
- How a `GenericAgentExecutor`, configured with an `AgentPersonaTemplate` that specifies allowed `toolNames`, can then make these tools available to an LLM.
- Showing how such a tool can be described to and invoked by an LLM using `ai-sdk` (as shown in the demo script).

While this document uses `TaskTool` as its primary detailed example of a tool built upon a UseCase layer, other tools like `FileSystemTool` (direct OS interaction), `AnnotationTool`, `TerminalTool`, and `MemoryTool` (featuring semantic search) follow the same core principles of implementing the `IAgentTool` interface and being registered with the central `ToolRegistry`. For a comprehensive overview of the tool architecture, how tools are integrated with `GenericAgentExecutor` via `AgentPersonaTemplate`s, and examples of multiple tools in action, please refer to `docs/autonomous-agent-architecture.md` and the demonstration script in `src/examples/fullstack-agent-demo.ts`.

## 2. Core Components for `TaskTool`

### 2.1. Job Management UseCases

**Location:** `src/core/application/use-cases/job/`

Before creating the tool, we define UseCases that encapsulate the business logic for job management. These interact with `IJobRepository`.
-   **`ListJobsUseCase`**: Fetches jobs for a queue.
-   **`SaveJobUseCase`**: Creates or updates a job.
-   **`RemoveJobUseCase`**: Removes a job. (Note: Its full functionality depends on `IJobRepository.delete()` being implemented).

### 2.2. `TaskTool` Implementation

**File:** `src/infrastructure/tools/task.tool.ts`

The `TaskTool` provides methods for an LLM to manage jobs.

-   **Interface (`ITaskTool`) Methods**:
    -   `list(params: { queueId: string; limit?: number })`: Lists jobs.
    -   `save(params: SaveJobDTO)`: Creates/updates a job. (Params align with `SaveJobDTO` or a Zod schema representing it).
    -   `remove(params: { jobId: string })`: Removes a job.
-   **Constructor**: Takes instances of `ListJobsUseCase`, `SaveJobUseCase`, and `RemoveJobUseCase` as dependencies.
-   **`ai-sdk` Compatibility**:
    -   Method parameters are defined using Zod schemas within the tool's implementation (e.g., `listParamsSchema`, `saveParamsSchema`, `removeParamsSchema`). These schemas are crucial for `ai-sdk` to understand the tool's expected inputs when an LLM decides to call it.

```typescript
// Simplified structure of TaskTool
import { z } from 'zod';
// ... import UseCases ...

// Example Zod schema for the 'list' method's parameters
const listParamsSchema = z.object({ /* ... */ });

export class TaskTool implements ITaskTool {
  constructor(
    private listJobsUseCase: IListJobsUseCase,
    // ... other use cases
  ) {}

  async list(params: z.infer<typeof listParamsSchema>) {
    return this.listJobsUseCase.execute(params.queueId, params.limit);
  }
  // ... other methods (save, remove)
}
```

## 3. Agent Tooling Examples & Usage

### 3.1 Other Tool Examples (Brief)

The system includes other tools with varying complexities:

*   **`FileSystemTool`**: Provides direct file system operations (read, write, list, etc.) and typically wraps Node.js `fs` methods. It's an example of a tool that might not have an extensive UseCase layer for each of its actions, relying more on direct implementation and input validation via Zod schemas.

*   **`MemoryTool`**: Offers capabilities to save, search, and remove memories. Its `memory.search` method is notably enhanced for **semantic search**. This involves:
    1.  An `EmbeddingService` generating vector embeddings for memory content (on save) and search queries.
    2.  Embeddings being stored as BLOBs in the `memory_items` table.
    3.  A `sqlite-vec` virtual table (`vss_memory_items`) indexing these embeddings.
    4.  The `DrizzleMemoryRepository.searchSimilar` method querying this VSS table for semantic matches.
    5.  The `SearchSimilarMemoryItemsUseCase` orchestrating query embedding and calling the repository.
    The `memory.search` tool method then exposes this semantic capability to the agent. For full details on this setup, consult `docs/autonomous-agent-architecture.md`.

### 3.2 Using Tools within an Agent (Conceptual)

In the refactored architecture, specific agent classes like the former `TaskManagerAgent` are superseded by the `GenericAgentExecutor`. The `GenericAgentExecutor` is configured with an `AgentPersonaTemplate` which defines its role, goals, and importantly, the `toolNames` it is allowed to use from the central `ToolRegistry`.

-   **Tool Availability**: An instance of `GenericAgentExecutor` gets its tools from the `ToolRegistry` based on the `toolNames` listed in its `AgentPersonaTemplate`.
-   **`process(job: Job)` Method (Conceptual within `GenericAgentExecutor`)**:
    -   The `GenericAgentExecutor`'s `process` method receives a job.
    -   It uses an LLM (e.g., via `ai-sdk`'s `generateObject`) for planning and execution.
    -   It makes its persona-specific subset of tools (obtained from the `ToolRegistry`) available to the LLM.
    -   The LLM, based on the job's payload (e.g., `job.payload.goal`), decides which tool method to call and with what parameters to achieve the goal or a step towards it.
    -   The `GenericAgentExecutor` then executes the chosen tool method.

For the concrete implementation, refer to `src/infrastructure/agents/generic-agent-executor.ts` and the overall architecture described in `docs/autonomous-agent-architecture.md`. The instantiation of `GenericAgentExecutor` with a persona and its tools (via the registry) is shown in `src/main.ts` and `src/examples/fullstack-agent-demo.ts`.

## 4. Demonstrating Tool Usage with `ai-sdk`

**File:** `src/examples/task-tool-ai-sdk-demo.ts`
**(Note: This demo might be outdated or superseded by `fullstack-agent-demo.ts`. Refer to `docs/autonomous-agent-architecture.md` for the latest recommended examples.)**

This standalone script demonstrates how the `TaskTool` can be integrated with `ai-sdk` for an LLM to use.

### Key Steps in the Demo:

1.  **Mocking Dependencies**: A `MockJobRepository` is used to allow the UseCases and `TaskTool` to function without a real database.
2.  **Instantiating `TaskTool`**: `TaskTool` is created with UseCases backed by the mock repository.
3.  **Defining Tools for `ai-sdk`**:
    -   The `tool` function from `ai` (or `ai/experimental`) is used to wrap methods of `TaskTool`.
    -   Each tool definition includes a `description` (for the LLM to understand what the tool does) and a `parameters` Zod schema (defining the expected input for the tool method).
    -   The `execute` function of the `ai` tool calls the corresponding `TaskTool` method.

    ```typescript
    // Inside task-tool-ai-sdk-demo.ts
    import { tool } from 'ai';
    import { z } from 'zod';
    // ... import TaskTool and its Zod schemas (or define them here)

    const toolsForAISDK = {
      listJobs: tool({
        description: "Lists jobs in a specified queue.",
        parameters: z.object({ /* Zod schema for listJobs params */ }),
        execute: async (params) => taskTool.list(params),
      }),
      saveJob: tool({
        description: "Creates a new job or updates an existing one.",
        parameters: z.object({ /* Zod schema for saveJob params */ }),
        execute: async (params) => taskTool.save(params as SaveJobDTO),
      }),
      // ... other tools
    };
    ```

4.  **LLM Call**:
    -   `generateObject` from `ai-sdk` is used.
    -   It's given a prompt (e.g., "List jobs in queue X, then create job Y...").
    -   The `tools` parameter is set to `toolsForAISDK`.
    -   The LLM processes the prompt, makes decisions to call the provided tools, and the `ai-sdk` handles the execution of these tool calls against the `TaskTool` methods.
    -   The demo logs the tool calls made by the LLM and their results.

**To run the demo:**
- Ensure `DEEPSEEK_API_KEY` (or your relevant LLM provider API key) is set in your `.env` file.
- Execute: `tsx -r dotenv/config src/examples/task-tool-ai-sdk-demo.ts` (assuming `dotenv` is used to load `.env`).

## 5. Conclusion

This `TaskTool` example illustrates a pattern for creating tools that can be used by AI agents. In the current architecture, these tools are registered in the `ToolRegistry` and utilized by the `GenericAgentExecutor` as specified by an agent's `AgentPersonaTemplate`. By defining tools with clear schemas (`parameters`) and descriptions, developers can empower LLMs (via `GenericAgentExecutor`) to perform complex actions and integrate deeply with the application's capabilities. Remember to fully implement any dependent repository methods (like `delete` for `IJobRepository`) for production use of tools that rely on them.
