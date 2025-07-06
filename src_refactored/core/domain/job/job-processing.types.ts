// src_refactored/core/domain/job/job-processing.types.ts

import { JobEntity } from './job.entity';

/**
 * Represents the output of a job processed by an agent.
 * This is a placeholder and can be extended based on specific agent requirements.
 */
export interface JobProcessingOutput<P extends { userId?: string } = { userId?: string }, R = unknown> {
  job: JobEntity<P, R>;
  result: R;
}

/**
 * Represents an intermediate step or thought in an agent's execution.
 * This is a more detailed version compared to a simple log.
 */
export interface AgentThought {
  type: 'thought' | 'observation' | 'tool_call' | 'tool_result' | 'llm_response' | 'error' | 'info';
  content: string | object;
  timestamp: Date;
}

/**
 * Represents the output from a single tool execution within an agent's process.
 */
export interface ToolExecutionOutput {
  toolName: string;
  toolInput: unknown;
  output: unknown;
  error?: string;
  timestamp: Date;
}

/**
 * Represents the history of an agent's activities during job processing.
 * This could be a collection of thoughts, tool calls, and observations.
 */
export interface AgentActivityHistory {
  entries: AgentThought[];
}

/**
 * Payload for initiating an agent execution job.
 */
export interface AgentExecutionPayload {
  agentId: string;
  initialPrompt?: string;
  userId?: string;
}

/**
 * Represents an entry in the execution history of an agent for a specific job.
 * This is more for internal tracking of agent steps beyond conversational history.
 */
export interface ExecutionHistoryEntry {
  timestamp: Date;
  type: 'llm_call' | 'llm_response' | 'llm_error' | 'tool_call' | 'tool_result' | 'tool_error' | 'unusable_llm_response' | 'agent_error' | 'info';
  name: string;
  params?: unknown;
  result?: unknown;
  error?: unknown;
  isCritical?: boolean;
}


/**
 * Defines the possible statuses of an agent's execution attempt for a job.
 * This is distinct from JobStatus, which tracks the overall job lifecycle.
 */
export enum AgentExecutorStatus {
  SUCCESS = 'SUCCESS',
  FAILURE_MAX_ITERATIONS = 'FAILURE_MAX_ITERATIONS',
  FAILURE_TOOL = 'FAILURE_TOOL',
  FAILURE_LLM = 'FAILURE_LLM',
  FAILURE_VALIDATION = 'FAILURE_VALIDATION',
  FAILURE_INTERNAL = 'FAILURE_INTERNAL',
}

/**
 * Represents the result of an agent's execution for a specific job attempt.
 * This is what the IAgentExecutor.executeJob method should resolve to on success.
 * If a critical error occurs that prevents a structured result, the promise should reject.
 */
export interface AgentExecutorResult<SuccessfulOutput = unknown> {
  jobId: string;
  status: AgentExecutorStatus;
  message: string;
  output?: SuccessfulOutput;
  // Changed O to SuccessfulOutput for clarity
  errors?: ExecutionHistoryEntry[];
}

export interface SuccessfulAgentOutput {
  message: string;
  // Consider making history more specific if possible, e.g., serializable activity entries
  history: unknown[];
}

/**
 * Information about a critical tool failure.
 */
export interface CriticalToolFailureInfo {
  toolName: string;
  error: string;
}
