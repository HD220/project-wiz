# LLM Agent Example: Text Summarization

This document provides an example of how to create and use an LLM-based agent within the queue system, using the `ai-sdk`. The example focuses on a `SummarizationAgent` that summarizes text.

## 1. Overview

The goal is to demonstrate:
- Creating a `Task` that interacts with an LLM (e.g., DeepSeek).
- Creating an `Agent` that uses this task to process jobs.
- Configuring and running a `WorkerService` for this agent.
- Adding jobs to the agent's queue.

## 2. Core Components

### 2.1. `SummarizationTask`

**File:** `src/infrastructure/tasks/summarization.task.ts`

This task is responsible for the actual LLM interaction.

- **Interface:** Implements `ITask<string, string>` (input is text, output is summary string).
- **Constructor:** Checks for the `DEEPSEEK_API_KEY` environment variable.
- **`execute(payload: string)` method:**
    - Takes a text string as input.
    - Constructs a prompt for summarization.
    - Uses `ai-sdk`'s `generateText` function with a specified model (e.g., `deepseek('deepseek-chat')`) to call the LLM.
    - Returns the generated summary string.
    - Includes error handling for empty payloads and LLM API errors.
    - Returns `void` if the LLM provides no summary, allowing the job to be re-evaluated.

**Key `ai-sdk` Usage:**
```typescript
// Inside SummarizationTask.execute()
import { generateText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';

// ...
const { text: summary } = await generateText({
  model: deepseek('deepseek-chat'), // Ensure this model is appropriate for your API key
  prompt: `Summarize the following text in a single sentence: ${payload}`,
  // Other parameters like maxTokens can be added
});
// ...
```

### 2.2. `SummarizationAgent`

**File:** `src/infrastructure/agents/summarization.agent.ts`

This agent orchestrates the use of the `SummarizationTask`.

- **Interface:** Implements `IAgent<string, string>`.
- **Constructor:** Instantiates `SummarizationTask`.
- **`process(job: Job<string, string>)` method:**
    - Receives a `Job` object.
    - Extracts the text payload from `job.payload`.
    - Calls the `execute` method of its `SummarizationTask` instance.
    - Returns the summary (if successful) or `void` (if task doesn't complete with summary but doesn't fail).
    - Handles errors and re-throws them for the `WorkerService`.

## 3. Configuration and Setup

### 3.1. Environment Variables

Ensure your `.env` file (based on `.env.example`) contains the necessary API key for the LLM provider:
```
DEEPSEEK_API_KEY=your_actual_api_key_here
DB_FILE_NAME="database.db"
```
The `SummarizationTask` specifically checks for `DEEPSEEK_API_KEY`.

### 3.2. Running the Example (`src/main.ts`)

The `src/main.ts` file has been updated to demonstrate this agent:

1.  **Agent and Queue Initialization**:
    - A new queue named `summarization-queue` is initialized.
    - The `SummarizationAgent` is instantiated.

2.  **Adding a Sample Job**:
    - The `addSummarizationSampleJob` function creates a job with a sample text payload and adds it to the `summarization-queue`.
    ```typescript
    // Example from addSummarizationSampleJob in src/main.ts
    const textToSummarize = "Electron is a framework for creating native applications...";
    const summarizationJob = Job.create({
      queueId: summarizationQueue.id,
      name: 'SummarizeTextJob_1',
      payload: textToSummarize,
      // ... other job options
    });
    await jobRepository.save(summarizationJob);
    ```

3.  **WorkerService**:
    - A new `WorkerService` instance is created, configured with:
        - The `queueRepository` and `jobRepository`.
        - The `summarizationAgent`.
        - The name of the `summarization-queue`.
    - This worker polls the `summarization-queue` and uses the `SummarizationAgent` to process jobs.

**To run:**
- Ensure your database is set up (`npm run db:generate`, `npm run db:migrate`).
- Ensure your `.env` file has `DEEPSEEK_API_KEY`.
- Execute `npx tsx src/main.ts`.
- You should see logs indicating the `SummarizationAgent` picking up the job and the LLM generating a summary.

## 4. Creating Your Own LLM Agent

To create a new LLM-based agent:

1.  **Define Your Task (`ITask` implementation)**:
    *   Determine the input and output types.
    *   Implement the `execute` method to interact with your chosen LLM using `ai-sdk` (e.g., `generateText`, `streamText`, or tool usage with `generateObject`).
    *   Handle API keys and any necessary configuration.
2.  **Define Your Agent (`IAgent` implementation)**:
    *   Implement the `process` method.
    *   Instantiate your task.
    *   Pass the job's payload to the task.
    *   Handle the task's result or errors appropriately, following the patterns in `SummarizationAgent` and `docs/arquitetura.md` regarding agent return values.
3.  **Integrate into `main.ts` (or your application's entry point)**:
    *   Define a queue name and concurrency for your new agent.
    *   Initialize the queue.
    *   Instantiate your agent.
    *   Create and start a `WorkerService` for this agent and queue.
    *   Implement a way to add jobs for your agent.

This example provides a foundational pattern for building more complex LLM-powered agents within the system.
