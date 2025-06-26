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
  | 'PENDING_REPLAN'; // Added based on replan logic

/**
 * Represents a call to a tool made by the language model.
 */
export interface LanguageModelMessageToolCall {
  id: string;
  type: 'function'; // Currently, only 'function' is common
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

/**
 * Represents a message in the conversation with the language model.
 * Standard structure, e.g., compatible with Vercel AI SDK.
 */
export interface LanguageModelMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: LanguageModelMessageToolCall[];
  tool_call_id?: string;
}

/**
 * Represents an entry in the execution history of an agent for a job.
 * This logs significant events, tool calls, and errors during the execution.
 */
export interface ExecutionHistoryEntry {
  timestamp: Date;
  type: 'llm_error' | 'tool_error' | 'system_error' | 'tool_call' | 'replan_attempt' | string; // string for future extensibility
  name: string; // e.g., 'LLM Generation', tool name, 'UnhandledExecutorError', 'ReplanAttempt'
  params?: any; // For tool_call, or context for replan
  result?: any; // For tool_call
  error?: any; // Could be Error object, string, or structured error representation
  isCritical?: boolean; // For tool_error, indicates if it stopped execution
  message?: string; // For replan_attempt or other informational entries
}

/**
 * Represents the result of an agent's execution of a job.
 */
export interface AgentExecutorResult {
  jobId: string;
  status: AgentExecutorStatus;
  message: string;
  output?: any; // Final output of the job, if any
  history: ReadonlyArray<ActivityHistoryEntry>; // Conversation history
  errors: ReadonlyArray<ExecutionHistoryEntry>; // Execution errors encountered
}

/**
 * Information about a critical tool failure.
 */
export interface CriticalToolFailureInfo {
    toolName: string;
    errorType: string;
    message: string;
    details?: any;
    isRecoverable: boolean; // Should typically be false if critical
}
