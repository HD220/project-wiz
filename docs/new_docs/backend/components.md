# Backend Conceptual Components

This document describes the key conceptual components of the Project Wiz backend, focusing on their primary responsibilities and functions in the autonomous software development process. These descriptions are high-level and do not delve into specific implementation technologies.

-   **Persona Core Logic (Autonomous Agent):**
    -   **Responsibility:** This is the core autonomous logic that *utilizes* a `Persona` configuration to instruct a Large Language Model (LLM) and manage the execution of assigned `Jobs` (Activities). It's responsible for the entire lifecycle of a Job, from understanding goals to planning, execution via Tools, and self-validation.
    -   **Key Functions:**
        -   Loads and synthesizes its long-term memory (`AgentInternalState`) with the specific, dynamic context of the current Job (`ActivityContext`, including conversational history like `CoreMessages`).
        -   Interacts with LLMs (via the `LLM Integration Point`) using the configured Persona's system prompt, goals, and available Tools to reason, plan, solve problems, and generate content or code.
        -   Dynamically defines `validationCriteria` (Definition of Done) for a Job as part of its planning phase.
        -   Selects and triggers appropriate `Tasks` (i.e., formulates objectives/prompts for the LLM) or directly requests `Tool` execution.
        -   Continuously updates the `ActivityContext` with progress, Tool results, LLM responses, errors, and logs. This includes promoting relevant learnings from `ActivityContext` to `AgentInternalState`.
        -   Performs self-validation against `validationCriteria` before marking a Job as complete.
        -   Determines Job completion (success or failure after retries/error handling).
        -   Can communicate with other Agents or the user via specific `Tools` (e.g., `SendMessageToAgentTool`).

-   **Job/Activity Management System (Queue):**
    -   **Responsibility:** Manages the lifecycle of `Jobs` with robust features inspired by systems like BullMQ, acting as a central task broker.
    -   **Key Functions:**
        -   Persists `Job` definitions (including input data, assigned Agent/Persona, dependencies, status) using SQLite.
        -   Handles Job status transitions (e.g., `pending`, `waiting`, `executing`, `delayed`, `finished`, `failed`).
        -   Manages Job dependencies (`depends_on_job_ids`) and `parent_job_id` relationships.
        -   Supports configurable retry mechanisms for failed `Jobs`.
        -   Allows for scheduled or delayed `Jobs`.
        -   Emits events on status changes, enabling reactive components.
        -   Agents query the `Queue` for their assigned `Jobs`; they can also use `Tools` to interact with `Jobs` on the `Queue` (e.g., to adjust sub-task priorities).

-   **Worker & Worker Pool (Agent Concurrency Model):**
    -   **Responsibility:** The "Worker Pool" represents the collection of active, concurrent Agents. Each individual "Worker" is effectively the main asynchronous processing loop of a single Agent.
    -   **Key Functions (Agent as Worker):**
        -   Fetches its next assigned `Job` from the `Queue`.
        -   Invokes its `Persona Core Logic` to process the `Job`.
        -   Manages the Job's lifecycle internally (context loading, LLM interaction, Tool use, validation, context update).
        -   Reports the final status of the `Job` back to the `Queue`.
    -   **Key Functions (Worker Pool):**
        -   Manages the set of concurrently running Agents.
        -   System-level throughput is achieved by having multiple Agents processing their respective Jobs in parallel, rather than a single Job being internally parallelized by multiple threads in the traditional sense.

-   **Task Execution System:**
    -   **Responsibility:** This is not a system for executing pre-coded task sequences, but rather the conceptual mechanism by which an Agent's `Persona Core Logic` formulates and dispatches specific objectives or focused prompts (defined as `Tasks`) to the LLM.
    -   **Key Functions:**
        -   Allows the Agent to dynamically create `Tasks` based on its ongoing reasoning and the Job's requirements.
        -   A `Task` provides the LLM (as configured by the Persona) with a clear goal, relevant context (from `ActivityContext` and `AgentInternalState`), and access to `Tools`.
        -   The LLM's attempt to fulfill the `Task` drives the Job forward.

-   **Tool Framework/Registry:**
    -   **Responsibility:** Provides a collection of pre-developed, well-defined `Tools` (functions within the application's source code) that are exposed to the LLM via an AI SDK, allowing the LLM (as directed by the Persona) to choose and request their execution.
    -   **Key Functions:**
        -   Makes `Tools` discoverable and usable by the LLM, typically by providing their descriptions, parameters, and expected output formats to the AI SDK.
        -   Each `Tool` performs a specific, discrete action (e.g., `ReadFileTool`, `WriteToDBTool`, `SendMessageToAgentTool`, `PostToProjectChannelTool`).
        -   The framework ensures that when an LLM requests a `Tool`, the corresponding application code is executed securely with the provided arguments.

-   **State Management Subsystem:**
    -   **Responsibility:** Handles robust persistence and retrieval of `AgentInternalState` (the Agent's long-term memory and evolving knowledge) and `ActivityContext` (the dynamic, per-Job conversational history and operational data), primarily using SQLite.
    -   **Key Functions:**
        -   Saves and loads the `AgentInternalState` for each Agent.
        -   Saves and loads the `ActivityContext` (including message history, planned steps, validation criteria/results, and partial outputs) associated with each Job.
        -   Ensures data integrity and availability for Agents when they pick up Jobs or resume operations.

-   **LLM Integration Point:**
    -   **Responsibility:** Provides a standardized and managed interface for the `Persona Core Logic` to communicate with various Large Language Models, abstracting provider-specific details.
    -   **Key Functions:**
        -   Manages connections and authentication with different LLM providers (e.g., OpenAI, DeepSeek).
        -   Applies user-defined configurations (specific model, embedding preferences, parameters like temperature) to LLM requests.
        -   Formats prompts using the Persona's system prompt, `AgentInternalState`, current `ActivityContext` (including message history), and available `Tool` descriptions.
        -   Manages the conversational history for LLM interactions to maintain context within a Job.
        -   Receives responses from LLMs and passes them back to the Agent.
        -   Handles LLM-specific errors and rate limits, potentially with retry logic.
