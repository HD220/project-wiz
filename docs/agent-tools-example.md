# Agent Tools Example: TaskTool for Job Management

This document explains how to create and use tools within an Agent, enabling Large Language Models (LLMs) to interact with the application's services. We'll focus on the `TaskTool`, an example tool for managing jobs in an agent's queue.

## 1. Overview of Agent Tools

Agents can be equipped with "tools" that provide specific functionalities. These tools are essentially sets of functions (methods) that an LLM can decide to call to gather information or perform actions. The `ai-sdk` provides mechanisms to expose these tools to an LLM during an interaction (e.g., a `generateObject` or `generateText` call).

This example demonstrates:
- Defining UseCases for core functionalities (job management).
- Creating a `TaskTool` that utilizes these UseCases.
- Equipping an `Agent` (`TaskManagerAgent`) with this tool.
- Showing how such a tool can be described to and invoked by an LLM using `ai-sdk`.

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

## 3. `TaskManagerAgent`

**File:** `src/infrastructure/agents/task-manager.agent.ts`

This agent is designed to manage tasks or jobs, potentially directed by an LLM.

-   **Constructor**: It's instantiated with an instance of `TaskTool` (and could receive other tools).
    ```typescript
    const taskTool = new TaskTool(listJobsUseCase, saveJobUseCase, removeJobUseCase);
    const taskManagerAgent = new TaskManagerAgent(taskTool);
    ```
-   **`process(job: Job)` Method**:
    -   In a complete implementation, this method would involve an LLM call (e.g., using `generateObject` from `ai-sdk`).
    -   The agent would pass its tools (like `this.taskTool`) to the LLM.
    -   The LLM, based on the job's payload (e.g., an instruction like "Create a job to summarize 'text'"), would decide which tool method to call and with what parameters.
    -   The current version in `main.ts` only shows instantiation, not this full processing loop.

## 4. Demonstrating Tool Usage with `ai-sdk`

**File:** `src/examples/task-tool-ai-sdk-demo.ts`

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

This `TaskTool` example illustrates a pattern for creating sophisticated agents that can leverage application-specific functionalities (exposed via UseCases) through LLM interactions. By defining tools with clear schemas and descriptions, developers can empower LLMs to perform complex actions and integrate more deeply with the application's capabilities. Remember to fully implement any dependent repository methods (like `delete` for `IJobRepository`) for production use.
