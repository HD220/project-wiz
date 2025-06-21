# Queue System Architecture - v1

## 1. Overview

The Project Wiz queue system is designed for asynchronous processing of tasks, referred to as **Jobs**. These jobs are executed by **Workers** (also known as **Agents**), managed through a persistent **Queue**. The primary purpose is to enable long-running or background tasks, particularly those involving LLM interactions and automated development workflows, to run efficiently without blocking the main application flow. The system is built to be robust, handling retries, delays, and dependencies between jobs.

## 2. Core Concepts

*   **Job**: A persistent representation of a unit of work. It's a data record describing "what" needs to be done and is exclusively managed by the Queue.
*   **Task**: The in-memory execution logic for a specific type of job. It knows "how" to interact with external services (like LLMs) and tools to perform the computational part of a Job. Tasks are not concerned with persistence or queue status.
*   **Queue**: The central component responsible for managing the lifecycle of Jobs. It persists the state of Jobs, controls status transitions, and manages retries, delays, and dependencies. It uses SQLite for persistence.
*   **Worker**: A class that listens to a specific queue (identified by an agent ID) and executes a processing function. The Worker orchestrates job execution and notifies the Queue about the outcome.
*   **Agent**: Contains the specific logic for how to execute a Task. The processing function passed to the Worker is typically a method of an Agent class. Agents can manage their own memory, tasks, and annotations via tools.

## 3. Entities

### 3.1. Job Entity

The `Job` entity stores all information necessary for managing a unit of work.

*   **Fields**:
    *   `id` (string): Unique identifier for the Job.
    *   `queueId` (string): Identifier of the queue this job belongs to.
    *   `name` (string): Name of the Job.
    *   `payload` (object/JSON string): Input data for the Job, immutable during execution.
    *   `data` (object/JSON string): Mutable data that can be saved during job execution.
    *   `result` (object/JSON string): Outcome of the Job execution.
    *   `maxAttempts` (integer): Maximum number of execution attempts. Default: 1.
    *   `attempts` (integer): Number of attempts made so far. Default: 0.
    *   `maxRetryDelay` (integer): Maximum time (ms) to wait between retries. Default: 60000.
    *   `retryDelay` (integer): Current time (ms) to wait before the next retry. Calculated based on attempts.
    *   `delay` (integer): Time (ms) to wait if the job is explicitly delayed or scheduled for future execution.
    *   `priority` (integer): Priority value. Lower numbers indicate higher priority. Default: 0.
    *   `status` (string): Current status of the Job. See states below. Default: `WAITING`.
    *   `dependsOn` (array of strings/JSON string): List of `jobId`s this Job depends on. The Job receives outputs from dependencies via `job.data`.
    *   `createdAt` (timestamp): Timestamp of job creation.
    *   `updatedAt` (timestamp): Timestamp of last job update.
    *   `executeAfter` (timestamp, optional): Specific time after which the job should be executed.

*   **Job Statuses**:
    *   `WAITING`: Awaiting execution, or for dependent jobs to complete.
    *   `ACTIVE` (or `EXECUTING`): Currently being processed by a Worker.
    *   `DELAYED`: Execution postponed (due to retry logic or explicit delay).
    *   `COMPLETED` (or `SUCCESS`): Successfully executed.
    *   `FAILED`: Execution failed after exhausting all attempts or due to a critical error.

*   **Job Status Transition Diagram** (Conceptual, based on `docs/arquitetura.md`):
    ```mermaid
    graph TD
        NEW[New Job Created] --> WAITING;
        WAITING -- Poll & Pick --> ACTIVE;
        ACTIVE -- Success --> COMPLETED;
        ACTIVE -- Error, Retries Left --> DELAYED;
        ACTIVE -- Error, No Retries --> FAILED;
        ACTIVE -- Needs Continuation --> DELAYED;
        DELAYED -- Delay Elapsed --> WAITING;
        WAITING -- Dependencies Met --> ACTIVE;
    ```
    *   `NEW` -> `WAITING`: Job is created and enqueued.
    *   `WAITING` -> `ACTIVE`: Worker picks up the Job for processing.
    *   `ACTIVE` -> `COMPLETED`: Job execution successful.
    *   `ACTIVE` -> `FAILED`: Job execution failed, and max attempts reached or critical error.
    *   `ACTIVE` -> `DELAYED`: Job execution failed, but retries are available, or agent indicated continuation.
    *   `DELAYED` -> `WAITING`: Delay period has passed, job is ready for re-processing.

### 3.2. Queue Entity

The `Queue` entity represents a specific queue that manages a collection of jobs.

*   **Fields (Inferred)**:
    *   `id` (string): Unique identifier for the Queue.
    *   `name` (string): Name of the Queue (e.g., "email-notifications", "code-generation-agent").
    *   `concurrency` (integer): Maximum number of jobs that can be processed concurrently by workers for this queue.
    *   `createdAt` (timestamp): Timestamp of queue creation.
    *   `updatedAt` (timestamp): Timestamp of last queue update.

## 4. Components and Flow

### 4.1. Queue

*   **Responsibilities**: Manages the state and lifecycle of Jobs. It's the sole component responsible for updating Job status, attempts, delays, dependencies, and results.
*   **Persistence**: Persists Job data in an SQLite database.
*   **Interaction**: Receives notifications from Workers about job outcomes (success, failure, need for continuation) and updates job records accordingly.

### 4.2. Worker

*   **Responsibilities**: Orchestrates the execution of Jobs.
*   **Workflow**:
    1.  Listens to a specific queue (identified by an agent ID).
    2.  Fetches pending Jobs from the Queue based on priority and `executeAfter` time.
    3.  Updates Job status to `ACTIVE`.
    4.  Invokes the processing function of an Agent, passing the Job data.
    5.  Captures return values or exceptions from the Agent's processing function.
    6.  Notifies the Queue of the outcome:
        *   **Success (Agent returns a value)**: Queue marks Job as `COMPLETED` and stores the result.
        *   **Continuation (Agent returns `undefined`/`null`)**: Queue moves Job to `DELAYED` (potentially with 0 delay) to be picked up again.
        *   **Failure (Agent throws an error)**: Queue checks `maxAttempts`. If not reached, Job is moved to `DELAYED` with a calculated `retryDelay`. If `maxAttempts` reached, Job is marked `FAILED`.

### 4.3. Agent

*   **Responsibilities**: Executes the specific logic of a Task using available tools.
*   **Workflow**:
    1.  Receives a Job from the Worker.
    2.  Instantiates the appropriate Task class based on Job details (e.g., `job.name` or a type field in `job.payload`).
    3.  Provides the Task with necessary data from the Job and its own configured Tools.
    4.  Executes the Task.
    5.  Returns a result, nothing (for continuation), or throws an error, as per rules below.
*   **Interaction between Tasks**: An Agent processes one step of a task at a time. It can switch to a different task/job based on priority, allowing it to react to new information (e.g., user messages) by creating new tasks, making annotations, or modifying its memory before returning to a previous task.
*   **Agent Return Rules (to Worker)**:
    *   **Success (returns a value)**: Task is complete for this Job. Worker notifies Queue to mark Job `COMPLETED`.
    *   **Continuation (returns `undefined`/`null`)**: Task needs more steps or is not yet finished, but no error occurred. Worker notifies Queue to move Job to `DELAYED` for re-polling.
    *   **Failure (`throw new Error`)**: Task execution failed. Worker notifies Queue, which handles retry logic or marks Job `FAILED`.

### 4.4. Task

*   **Responsibilities**: Encapsulates the logic for interacting with LLMs and using Tools to achieve a Job's goal.
*   **Workflow**:
    1.  Receives Job data and Tools from the Agent.
    2.  Makes calls to LLMs (e.g., using `ai-sdk`).
    3.  The LLM can utilize the provided Tools.
    4.  A "step" within a Task might involve multiple LLM calls. A step typically concludes when an LLM uses a specific tool like `finalAnswer`.
    5.  The `finalAnswer` tool often has parameters like `answer` and `taskFinished` (boolean) to indicate if the overall task is done.

## 5. LLM Interaction

*   Tasks use the `ai-sdk` (or a similar library) to make calls to Large Language Models.
*   When invoking the LLM, the Task provides a set of **Tools** that the LLM can choose to use.
*   These tools can be generic (Agent Tools) or specific to the Task/Job. The `Task` class determines which tools are available based on the job's payload or type.

## 6. Agent Tools

Agents are equipped with a variety of tools to interact with their environment and manage their state. These include:

*   **MemoryTool**: Allows the agent to write to and delete information from its memory, which is retrieved using RAG for context.
*   **TaskTool**: Manages the agent's own task queue (Jobs), allowing viewing, saving (creating/updating), and removing tasks.
*   **AnnotationTool**: Creates and manages annotations that are always included in the agent's context, aiding memory retrieval.
*   **FilesystemTool**: Performs file system operations like reading, writing, moving, and deleting files and directories.
*   **TerminalTool**: Executes shell commands.
*   **ProjectTool**: Manages project-related information (details, channels, forums, issues).
*   **MessageTool**: Sends messages to users or other members/agents via direct messages, project channels, or forums.

## 7. Database Schema

The queue system relies on a database (currently SQLite, managed by Drizzle ORM) with at least the following key tables:

*   **`jobs`**: Stores the Job entities, as described in section 3.1. This table is central to tracking the state and details of each unit of work.
*   **`queues`**: Stores the Queue entities, as described in section 3.2. This table defines the available queues and their configurations (e.g., concurrency).

## 8. Directory Structure

Key directories related to the queue system's logic include:

*   `src/core/domain/entities/jobs/`: Contains the `Job` entity definition, status logic, etc.
*   `src/core/domain/entities/queues/`: Contains the `Queue` entity definition.
*   `src/core/domain/services/`: May contain services like the `WorkerService`.
*   `src/core/ports/repositories/`: Defines interfaces for `IJobRepository` and `IQueueRepository`.
*   `src/core/ports/queue/`: May define interfaces related to queue operations or processors.
*   `src/infrastructure/repositories/drizzle/`: Contains Drizzle ORM implementations of `IJobRepository` and `IQueueRepository`.
*   `src/infrastructure/services/drizzle/schemas/`: Defines the database table schemas for `jobs`, `queues`, etc., using Drizzle.
*   `src/infrastructure/agents/`: May contain implementations of specific agents and their tasks.

## 9. Execution Flow (High-Level)

1.  **Job Creation**: A new Job is created (e.g., by user action, an Agent, or a system process) and saved to the `jobs` table via the `IJobRepository`, associated with a specific Queue. Its initial status is typically `WAITING`.
2.  **Worker Polling**: A `WorkerService` instance, configured for a specific Queue, periodically polls the `jobs` table (via `IJobRepository`) for pending jobs that match its queue, respecting priority and `executeAfter` times.
3.  **Job Acquisition**: The Worker selects an available Job, updates its status to `ACTIVE`, and increments its `attempts` count.
4.  **Agent Processing**: The Worker passes the Job to the appropriate Agent. The Agent instantiates and runs the corresponding Task.
    *   The Task may involve LLM calls and tool usage.
5.  **Outcome Handling**:
    *   **Success**: Agent returns a result. Worker notifies the Queue. Job status becomes `COMPLETED`, result is stored.
    *   **Continuation**: Agent returns `undefined`. Worker notifies the Queue. Job status becomes `DELAYED` (then `WAITING`).
    *   **Failure**: Agent throws an error. Worker notifies the Queue.
        *   If retries are left: Job status becomes `DELAYED` with a `retryDelay`, then `WAITING`.
        *   If no retries left: Job status becomes `FAILED`.
6.  **Completion/Loop**: The Job is either terminal (`COMPLETED`, `FAILED`) or re-enters the `WAITING` state for a future attempt or continuation. The Worker continues polling for more jobs.
```
