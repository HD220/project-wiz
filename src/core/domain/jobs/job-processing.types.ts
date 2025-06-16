// src/core/domain/jobs/job-processing.types.ts

// Define a structure for plan steps (consistent with OrchestratorAgent / GenericAgentExecutor)
export interface PlanStep extends Record<string, any> {
  tool: string; // Name of the tool from ToolRegistry, e.g., 'fileSystem.readFile'
  params: any;  // Parameters for the tool method
  description: string; // LLM-generated description of what this step does
}

// Define structure for agent state stored within Job.data
export interface AgentJobState {
  currentPlan: PlanStep[];
  completedSteps: number;
  // internalScratchpad?: Record<string, any>; // For more complex state
  executionHistory?: { step: number; tool: string; params: any; result: any; error?: string }[];
}

// Define the result structure for the executor's process method
export type AgentExecutorResultStatus = 'COMPLETED' | 'FAILED' | 'CONTINUE_PROCESSING';

export interface AgentExecutorResult {
  status: AgentExecutorResultStatus;
  message: string;
  output?: any; // Final output or accumulated outputs
}
