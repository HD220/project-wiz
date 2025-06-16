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
export interface AgentJobState {
  // currentPlan: PlanStep[]; // Removed for iterative model
  // completedSteps: number;  // Removed for iterative model
  conversationHistory: Message[]; // Stores { role: 'user' | 'assistant' | 'tool', content: string, toolInvocations?: ..., toolResults?: ... }
  executionHistory?: { tool: string; params: any; result: any; error?: string }[]; // Can still be useful for a simpler log of executed actions
}

// Define the result structure for the executor's process method
export type AgentExecutorResultStatus = 'COMPLETED' | 'FAILED' | 'CONTINUE_PROCESSING';

export interface AgentExecutorResult {
  status: AgentExecutorResultStatus;
  message: string;
  output?: any; // Final output or accumulated outputs
}
