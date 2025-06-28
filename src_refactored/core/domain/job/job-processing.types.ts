// src_refactored/core/domain/job/job-processing.types.ts

import { ActivityHistoryEntry } from './value-objects/activity-history-entry.vo';

// Based on usage in generic-agent-executor.service.ts

/**
 * Status of the agent's execution attempt for a job.
 */
export type AgentExecutorStatus =
  | 'SUCCESS'
  | 'FAILURE_LLM'
  | 'FAILURE_TOOL'
  | 'FAILURE_MAX_ITERATIONS'
  | 'FAILURE_INTERNAL'
  | 'PENDING_REPLAN';

/**
 * Represents a call to a tool made by the language model.
 */
export interface LanguageModelMessageToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Represents a message in the conversation with the language model.
 */
export interface LanguageModelMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: LanguageModelMessageToolCall[];
  tool_call_id?: string;
}

/**
 * Represents an entry in the execution history of an agent for a job.
 */
export interface ExecutionHistoryEntry {
  timestamp: Date;
  type: 'llm_error' | 'tool_error' | 'system_error' | 'tool_call' | 'replan_attempt' | string;
  name: string;
  params?: unknown;
  result?: unknown;
  error?: unknown;
  isCritical?: boolean;
  message?: string;
}

/**
 * Defines the payload for a job that is to be executed by an agent.
 */
export interface AgentExecutionPayload {
  agentId: string;
  initialPrompt?: string;
  projectId?: string;
  userId?: string;
  // Any other relevant data to kick off the agent execution for this job
}

/**
 * Represents the result of an agent's execution of a job.
 */
export interface AgentExecutorResult {
  jobId: string;
  status: AgentExecutorStatus;
  message: string;
  output?: unknown; // Final output of the job, if any
  history: ReadonlyArray<ActivityHistoryEntry>;
  errors: ReadonlyArray<ExecutionHistoryEntry>;
}

/**
 * Information about a critical tool failure.
 */
export interface CriticalToolFailureInfo {
    toolName: string;
    errorType: string;
    message: string;
    details?: unknown; // Changed from any
    isRecoverable: boolean;
}
