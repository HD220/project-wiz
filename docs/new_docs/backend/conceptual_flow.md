# Backend Conceptual Flow: Job Lifecycle

This document describes the typical lifecycle of a Job (Activity) within Project Wiz, outlining how different backend components interact at a high level to process tasks. An "Agent" here refers to the autonomous logic that utilizes a "Persona" configuration to interact with an LLM.

1.  **Job Creation & Assignment:**
    *   A user, through the frontend interface or other means, defines a new Job. This involves specifying its details, such as the task description, input parameters/data, any initial dependencies on other Jobs (`depends_on_job_ids`), and potentially a `parent_job_id` if it's a sub-task.
    *   The user assigns this Job to a specific Agent (which will operate using a chosen Persona configuration).

2.  **Queuing (Inspired by BullMQ):**
    *   The newly created Job is submitted to the Job/Activity Management System (Queue).
    *   The Queue, designed for robustness (e.g., with SQLite-based persistence), stores the Job with its full details. It sets the initial status (e.g., "pending" or "waiting" if dependencies exist).
    *   The Queue manages Job dependencies, retentativas (retries), potential scheduling, and emits events on status changes. Priority can be influenced by Agents interacting with their own Jobs.

3.  **Agent (Worker) Processing Loop:**
    *   Each Agent runs its own asynchronous processing loop (conceptually, its "Worker" instance). It queries the `Queue` for eligible Jobs assigned to it that are ready for execution (dependencies met, not delayed).
    *   System-level concurrency is achieved by multiple Agents operating their loops simultaneously.

4.  **Context Loading by Agent:**
    *   Upon picking up a Job, the Agent loads:
        *   **`AgentInternalState`:** Its global, persistent memory, including its overall goals, past learnings, a list of all its activities, and general knowledge.
        *   **`ActivityContext`:** The specific context for *this* Job, including the initial input, history of messages/interactions for this task (e.g., `CoreMessages`), and any previously planned steps or partial results.

5.  **Reasoning and Planning (LLM Interaction via Persona):**
    *   The Agent, using its loaded `AgentInternalState` and the current Job's `ActivityContext`, formulates a prompt for the configured Persona. This prompt instructs the Large Language Model (LLM) associated with the Persona.
    *   The LLM interaction aims to: understand the Job's goal, break it down into manageable steps (planning), define `validationCriteria` (Definition of Ready for the task), or decide the next immediate `Task` or `Tool` use.

6.  **Task/Tool Execution:**
    *   Based on the LLM's response (shaped by the Persona), the Agent selects and triggers:
        *   A **`Task`**: A specific objective or refined prompt directed to the LLM, which may involve further planning or direct Tool invocation by the LLM.
        *   A **`Tool`**: A pre-developed capability (e.g., file access, code execution, communication with another Agent via a `SendMessageToAgentTool`).
    *   If a Tool execution fails, this error is captured in the `ActivityContext`. The Agent may decide to retry, use an alternative Tool, or mark the Job as failed based on this.

7.  **Context Update:**
    *   After each Task/Tool execution (or attempted execution), the Agent updates the `ActivityContext` for the current Job.
    *   This includes results, errors encountered, logs of actions taken, new information learned, and progress towards the Job's goal. This updated context, including the history of messages, is used for subsequent LLM interactions.

8.  **Iteration & Replanning:**
    *   The Agent evaluates the updated `ActivityContext` and its overall plan.
    *   If the Job's main goal is not yet achieved, or if a step failed and a new approach is needed, the Agent repeats steps 5 (Reasoning/Planning), 6 (Task/Tool Execution), and 7 (Context Update). This iterative loop continues as the Agent works through its plan.

9.  **Auto-Validação (Self-Validation):**
    *   Before considering a Job complete, the Agent (guided by its Persona/LLM) may perform a self-validation step using the `validationCriteria` defined in the `ActivityContext`.
    *   The `validationResult` is recorded. If validation fails, the Agent might return to step 8 (Iteration & Replanning) to address the shortcomings.

10. **Job Completion/Status Update:**
    *   Once the Agent determines that the Job's objectives have been met (and self-validation is successful), or if it encounters an unrecoverable error (e.g., max retries reached, critical Tool failure, unsolvable planning loop), it finalizes the Job.
    *   The Agent updates the Job's final status in the `Queue` (e.g., "finished," "failed") and stores the detailed outcome, including any errors, in the `ActivityContext` and potentially logs.

11. **Results Storage & Notification:**
    *   The final output, artifacts, or results from the `ActivityContext` are made available.
    *   The `Queue` emits an event for the Job's final status, which can trigger notifications to the user via the frontend or to other dependent systems/Agents.

This lifecycle emphasizes an Agent-centric approach, where each Agent autonomously manages its workflow using its configured Persona to interact with LLMs and Tools, all orchestrated via a robust Job Queue.
