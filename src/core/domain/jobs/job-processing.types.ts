// src/core/domain/jobs/job-processing.types.ts
import { Message } from 'ai';

// PlanStep might be deprecated if not using explicit multi-step planning by the agent itself before LLM calls.
// For iterative LLM calls, conversation history becomes the primary driver.
/*
export interface PlanStep extends Record<string, any> {
  tool: string; // Name of the tool from ToolRegistry, e.g., 'fileSystem.readFile'
  params: any;  // Parameters for the tool method
  description: string; // LLM-generated description of what this step does
}
*/

// Define structure for agent state stored within Job.data
export interface ExecutionHistoryEntry {
  timestamp: Date;
  type: 'system_error' | 'llm_event' | 'llm_error' | 'llm_warning' | 'tool_call';
  name: string; // e.g., 'api_key_check', 'planning', 'fileSystem.readFile'
  params: any;
  result: any;
  error?: string;
}

export interface AgentJobState {
  conversationHistory: Message[];
  executionHistory?: ExecutionHistoryEntry[];
}

// Define the result structure for the executor's process method
export type AgentExecutorResultStatus = 'COMPLETED' | 'FAILED' | 'CONTINUE_PROCESSING';

export interface AgentExecutorResult {
  status: AgentExecutorResultStatus;
  message: string;
  output?: any; // Final output or accumulated outputs
}

export interface JobRuntimeData {
  agentState?: AgentJobState;
  lastFailureSummary?: string;
  error?: any; // For storing error messages/objects by WorkerService/Job entity
}
