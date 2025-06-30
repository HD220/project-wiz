// src_refactored/core/domain/job/job-processing.types.ts

import { JobEntity } from './job.entity';

/**
 * Represents the output of a job processed by an agent.
 * This is a placeholder and can be extended based on specific agent requirements.
 */
export interface JobProcessingOutput<R = unknown> {
  job: JobEntity<unknown, R>; // The job that was processed
  result: R;                 // The final result/output from the agent
  // Add other relevant fields like status, logs summary, etc. if needed
}

/**
 * Represents an intermediate step or thought in an agent's execution.
 * This is a more detailed version compared to a simple log.
 */
export interface AgentThought {
  type: 'thought' | 'observation' | 'tool_call' | 'tool_result' | 'llm_response' | 'error' | 'info';
  content: string | object; // Structured content depending on the type
  timestamp: Date;
}

/**
 * Represents the output from a single tool execution within an agent's process.
 */
export interface ToolExecutionOutput {
  toolName: string;
  toolInput: unknown;
  output: unknown; // Can be any type, string, object, etc.
  error?: string; // If the tool execution resulted in an error
  timestamp: Date;
}

/**
 * Represents the history of an agent's activities during job processing.
 * This could be a collection of thoughts, tool calls, and observations.
 */
export interface AgentActivityHistory {
  entries: AgentThought[]; // Chronological list of agent activities
}

// --- Types for GenericAgentExecutorService ---

/**
 * Payload for initiating an agent execution job.
 */
export interface AgentExecutionPayload {
  agentId: string; // VO string representation
  initialPrompt?: string;
  userId?: string; // Optional: for user-specific context or permissions
  // Potentially add other context like project ID, specific data sources, etc.
}

/**
 * Represents an entry in the execution history of an agent for a specific job.
 * This is more for internal tracking of agent steps beyond conversational history.
 */
export interface ExecutionHistoryEntry {
  timestamp: Date;
  type: 'llm_call' | 'llm_response' | 'llm_error' | 'tool_call' | 'tool_result' | 'tool_error' | 'unusable_llm_response' | 'agent_error' | 'info';
  name: string; // e.g., LLM model name, tool name, or event description
  params?: unknown; // e.g., LLM params, tool input args
  result?: unknown; // e.g., LLM response object, tool output
  error?: unknown; // Error object or message
  isCritical?: boolean; // For tool errors, indicates if it's a non-recoverable error
}


/**
 * Defines the possible statuses of an agent's execution attempt for a job.
 * This is distinct from JobStatus, which tracks the overall job lifecycle.
 */
export enum AgentExecutorStatus {
  SUCCESS = 'SUCCESS', // Agent believes it has achieved the goal.
  FAILURE_MAX_ITERATIONS = 'FAILURE_MAX_ITERATIONS', // Max iterations reached without achieving goal.
  FAILURE_TOOL = 'FAILURE_TOOL', // A critical tool error occurred.
  FAILURE_LLM = 'FAILURE_LLM', // A critical LLM error occurred.
  FAILURE_VALIDATION = 'FAILURE_VALIDATION', // Input/output validation failed critically.
  FAILURE_INTERNAL = 'FAILURE_INTERNAL', // An unexpected internal error in the executor.
  // RUNNING status might be implicit while the promise is not resolved.
}

/**
 * Represents the result of an agent's execution for a specific job attempt.
 * This is what the IAgentExecutor.executeJob method should resolve to on success.
 * If a critical error occurs that prevents a structured result, the promise should reject.
 */
export interface AgentExecutorResult<O = unknown> {
  jobId: string; // Corresponds to JobEntity.id.value
  status: AgentExecutorStatus;
  message: string; // Summary message of the execution outcome
  output?: O; // The final structured output from the agent, if any
  history?: unknown[]; // Could be ActivityHistoryEntryVO[] or a simplified version for the result
  errors?: ExecutionHistoryEntry[]; // List of non-critical errors encountered
  // criticalToolFailureInfo?: CriticalToolFailureInfo; // If a critical tool failure occurred
}

/**
 * Information about a critical tool failure.
 */
export interface CriticalToolFailureInfo {
  toolName: string;
  error: string; // Error message or serialized error
  // Potentially include input that caused the failure
}


// TODO: Define more specific types as needed for different kinds of agent outputs or processing details.
