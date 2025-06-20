# Job/Activity Management

Project Wiz uses a system of Jobs (which represent Activities, as per ADR 001) to manage tasks assigned to Personas. This system allows for the creation, assignment, tracking, and overall management of automated work.

## Key Capabilities:

- **Job/Activity Creation:**
    - The `CreateJobUseCase` allows the creation of new Jobs. Key input parameters include `activityType`, `context` (which holds the `ActivityContext`), `parentId` (for sub-tasks/jobs), and `relatedActivityIds`.
    - The `Job` entity includes fields for `payload` (though `context` seems preferred for structured data like `ActivityContext`), `retryPolicy`, `priority`, and `dependsOn` (an array of Job IDs).
    - `ActivityContext` is associated with each Job, typically within the `Job.context` field (as per `CreateJobUseCase` using `withContext`). It contains:
        - `messageContent`: Initial instruction or message.
        - `sender`: Origin of the message.
        - `toolName`: Suggested or used tool.
        - `toolArgs`: Arguments for the tool.
        - `goalToPlan`: The objective the activity aims to achieve.
        - `plannedSteps`: Steps planned by the agent for the activity.
        - `activityNotes`: Notes generated during execution.
        - `validationCriteria`: Criteria for successful completion.
        - `validationResult`: Outcome of validation.
        - `activityHistory`: Log of interactions and results within this Activity.
- **Job Update:**
    - The `UpdateJobUseCase` allows for modification of existing Jobs. Updatable fields likely include status, context, payload, and potentially priority or retry counts.
- **Job Cancellation:**
    - The `CancelJobUseCase` provides functionality to cancel a Job, presumably moving it to a `canceled` status and preventing further execution.

- **Job Lifecycle and Queue Management:**
    - **Status Management:** The `Job` entity has methods like `start()`, `complete()`, `fail()`, `markAsWaiting()`, `markAsPending()` to transition between statuses: `pending`, `executing`, `finished`, `failed`, `delayed`, `waiting`, `canceled`. The `JobQueue` service manages these transitions.
    - **Retries:** The `Job` entity's `retryPolicy` (e.g., `maxRetries`, `currentAttempt`) and queue logic support retries for failed Jobs, typically with exponential backoff.
    - **Delays:** Jobs can be delayed; this is managed by the `JobQueue` and potentially a `runAt` field on the Job.
    - **Dependency Management:** The `Job` entity's `dependsOn` field stores IDs of prerequisite Jobs. The `JobQueue` is expected to manage these dependencies, holding Jobs in a `waiting` state until dependencies are met. The explicit logic for transitioning from `WAITING` to `PENDING` upon dependency completion (likely in `JobQueue.addJob` or a monitoring process) was not part of the direct tool review but is a core requirement (RF004).

- **Job Execution Orchestration:**
    - **Worker Pool (RF005):** A Worker Pool manages multiple Workers for concurrent Job processing (details to be confirmed from its specific implementation).
    - **Worker Assignment and Processing (RF006):** The `ProcessJobUseCase` is responsible for orchestrating job execution. It likely fetches a job from the queue and assigns it to a worker, which then invokes the appropriate Persona (AutonomousAgent) for processing. The worker reports the outcome back to the Queue.

- **Autonomous Agent Processing (RF007, RF008, RF012):**
    - The assigned Persona (AutonomousAgent, via `AgentServiceImpl`) loads its `AgentInternalState` and the Job's `ActivityContext`.
    - It uses an LLM, along with these contexts, to decide the next action or execute a task.
    - The `ActivityContext` is updated with progress and results during processing.

- **Persistence (RF013):** The state of Jobs/Activities (via `JobRepository`) and `AgentInternalState` (via `AgentStateRepository`) is persisted.

## Clarifications:
- **`Job.data` vs. `Job.context`**: `ADR 001` aimed to unify Job and Activity. `CreateJobUseCase` utilizes `job.withContext(context)` to store the `ActivityContext`. This suggests `Job.context` is the intended field for `ActivityContext`, while `Job.data` might be for other arbitrary payload data if needed.

## Code Implementation Notes:
- Core job functionalities (create, update, cancel, process) are supported by dedicated use cases (`CreateJobUseCase`, `UpdateJobUseCase`, `CancelJobUseCase`, `ProcessJobUseCase`).
- The `Job` entity is well-defined with status management and fields for dependencies and retry policies.
- The interaction between `JobQueue`, `WorkerPool`, and `ProcessJobUseCase` forms the backbone of job execution.
- **Gap/Further Review:** While `dependsOn` is a field in the `Job` entity, the specific logic within the `JobQueue` that monitors these dependencies and transitions jobs from `WAITING` to `PENDING` needs confirmation from `JobQueue`'s implementation details.

*(Further details to be consolidated from code analysis in Phase 2)*
