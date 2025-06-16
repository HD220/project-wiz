# Guide: Orchestrator Agent with Advanced Tools

This document details the `OrchestratorAgent`, a sophisticated AI agent designed for complex task execution using multiple tools, LLM-driven planning, and a defined persona.

## 1. Introduction

The `OrchestratorAgent` showcases how an AI can:
- Operate with a specific persona (`role`, `goal`, `backstory`).
- Utilize a suite of tools: `TaskManagerTool`, `FileSystemTool`, and `AnnotationTool`.
- Dynamically generate a multi-step plan using an LLM to achieve a high-level goal.
- Execute this plan by invoking tool methods.
- Manage (conceptually) its state across multiple interactions for long-running tasks.

## 2. Agent Components

### 2.1. Persona (`AgentPersona`)
**Definition:** `src/core/domain/entities/agent/persona.types.ts`
The agent's behavior and decision-making are influenced by its persona, consisting of:
-   `role`: The agent's designated function (e.g., "Senior Software Engineer").
-   `goal`: The agent's primary objective.
-   `backstory`: Contextual information shaping its responses and actions.
The `IPersonaAgent` interface (`src/core/ports/persona-agent.interface.ts`) ensures agents can have a persona.

### 2.2. Tools
The `OrchestratorAgent` is equipped with the following tools:

#### a. `TaskManagerTool`
**Implementation:** `src/infrastructure/tools/task.tool.ts`
-   **Purpose:** Manages jobs within the queue system.
-   **Key Methods:** `list`, `save`, `remove`.
-   **Dependencies:** Job management UseCases (`ListJobsUseCase`, `SaveJobUseCase`, `RemoveJobUseCase`).
-   **Note:** Full functionality of `remove` depends on `IJobRepository.delete()` being implemented (which was done in this plan).

#### b. `FileSystemTool`
**Implementation:** `src/infrastructure/tools/file-system.tool.ts`
-   **Purpose:** Interacts with the file system.
-   **Key Methods:** `readFile`, `writeFile`, `moveFile`, `removeFile`, `listDirectory`, `createDirectory`, `removeDirectory`.
-   **Implementation:** Uses Node.js `fs/promises`. Includes basic path safety but requires robust sandboxing for production.

#### c. `AnnotationTool`
**Implementation:** `src/infrastructure/tools/annotation.tool.ts`
-   **Purpose:** Allows the agent to create, list, and remove textual annotations for logging, record-keeping, or memory.
-   **Persistence:** Annotations are stored in the database via `DrizzleAnnotationRepository`.
-   **Dependencies:** Annotation management UseCases (`ListAnnotationsUseCase`, `SaveAnnotationsUseCase`, `RemoveAnnotationUseCase`).

Each tool method intended for LLM use is defined with Zod schemas for its parameters, enabling structured interaction via the `ai-sdk`.

### 2.3. `OrchestratorAgent` Class
**Implementation:** `src/infrastructure/agents/orchestrator.agent.ts`
-   **Interface:** Implements `IPersonaAgent<OrchestratorAgentPayload, OrchestratorAgentResult>`.
-   **Constructor:** Injected with `AgentPersona` and instances of the three tools.
-   **Payload (`OrchestratorAgentPayload`):**
    -   `goal: string`: The high-level task for the agent.
    -   `initialContext?: any`: Optional starting data.
    -   `currentPlan?: PlanStep[]`: For resuming execution of an existing plan.
    -   `completedSteps?: number`: Index of the last completed step in the `currentPlan`.
-   **Result (`OrchestratorAgentResult`):**
    -   `status: 'completed' | 'failed' | 'in_progress_step_complete' | 'pending_further_action'`: Granular status.
    -   `message: string`: Summary message.
    -   `output?: any`: Data produced.
    -   `remainingPlan?: PlanStep[]`, `currentStepIndex?: number`: For stateful continuation.

## 3. Core `process` Method Logic

The `OrchestratorAgent.process(job)` method is central to its operation:

1.  **API Key Check**: Ensures the LLM API key (e.g., `DEEPSEEK_API_KEY`) is available.
2.  **Planning Phase (if no current plan)**:
    -   A system prompt is constructed using the agent's persona and the job's goal.
    -   It uses `ai-sdk`'s `generateObject` function with an LLM (e.g., `deepseek-chat`).
    -   The LLM is instructed to generate a multi-step plan (an array of `PlanStep` objects). Each `PlanStep` defines a `tool` (e.g., "fileSystemTool.writeFile"), `params` for the tool, and a `description`.
    -   The available tools (and their parameter Zod schemas) are provided to `generateObject`.
    -   The generated plan and an initial thought from the LLM are logged and can be saved as an annotation.
3.  **Execution Phase**:
    -   The agent iterates through the plan steps, starting from the last `completedSteps`.
    -   For each step:
        -   It dynamically calls the specified tool method using the `aiTools` mapping defined in the agent's constructor.
        -   It logs the action and the result.
        -   **State Management (Simulated Re-queuing):** After each step (if not the last), the agent returns an `OrchestratorAgentResult` with `status: 'in_progress_step_complete'`. This signals that the job has made progress but is not yet complete. The job's payload should be updated with the `currentPlan` and `completedSteps` by the `WorkerService` before being re-queued. This allows the agent to handle long tasks and for other jobs to be processed.
4.  **Completion/Failure**:
    -   If all steps are executed successfully, it returns a `completed` status.
    -   If any error occurs during planning or execution, it logs the error (potentially as an annotation) and returns a `failed` status.

## 4. Running the Demonstration

**Demo Script:** `src/examples/orchestrator-agent-demo.ts`

This script provides a practical example of setting up and running the `OrchestratorAgent`.

### Setup:
1.  **Environment Variables**: Ensure `.env` file has `DEEPSEEK_API_KEY` and `DB_FILE_NAME`.
2.  **Database Migrations**: Run `npm run db:generate` and `npm run db:migrate` after new schemas (like `annotationsTable`) are added.
3.  **Output Directory**: The demo creates an `orchestrator_demo_output/` directory for `FileSystemTool` operations.

### Execution:
```bash
tsx -r dotenv/config src/examples/orchestrator-agent-demo.ts
```

### What the Demo Does:
-   Initializes all necessary components: database connection, repositories (for Jobs, Queues, Annotations), UseCases, and Tools.
-   Defines a persona for the `OrchestratorAgent`.
-   Instantiates the `OrchestratorAgent`.
-   Sets up a dedicated queue for the agent.
-   Enqueues a sample high-level job with a multi-step goal (e.g., create directory, create file, list directory, save annotation).
-   Starts a `WorkerService` to process jobs from this queue using the `OrchestratorAgent`.

### Important Note on `WorkerService`:
The current `WorkerService` implementation may not fully support the `in_progress_step_complete` status for true, stateful, multi-turn plan execution. For the agent to pause and resume a plan effectively, the `WorkerService` needs to be enhanced:
-   When a job returns `status: 'in_progress_step_complete'`, the `WorkerService` should:
    1.  Take the `remainingPlan` and `currentStepIndex` (or similar state) from the `OrchestratorAgentResult`.
    2.  Update the original job's payload in the database with this continuation state.
    3.  Re-queue the job (or allow it to be picked up again shortly).
Without these `WorkerService` changes, the agent might re-plan from scratch each time the worker polls the job if the plan doesn't complete in a single `process` call.

## 5. Conclusion

The `OrchestratorAgent` provides a robust framework for creating AI agents capable of complex, multi-step task execution through LLM-driven planning and tool utilization. Further enhancements to the `WorkerService` will unlock its full potential for handling long-running, interruptible tasks.
