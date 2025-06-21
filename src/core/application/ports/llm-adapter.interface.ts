import { ActivityContext } from '@/core/domain/entities/job/value-objects/activity-context.vo';
import { AgentInternalState } from '@/core/domain/entities/agent';

// Define a more specific type for LLM an LLM response that guides agent action
export interface LLMAgentDecision {
  thought?: string; // Agent's reasoning
  nextTask?: string; // Name/type of the next task to execute
  taskParameters?: Record<string, any>; // Parameters for the next task
  isFinalAnswer?: boolean; // Is this the end of the activity?
  outputForUser?: string; // If there's direct output for the user
}

export interface ILLMAdapter {
  generateAgentDecision(
    context: ActivityContext,
    agentState: AgentInternalState,
    availableTools?: any[] // Placeholder for tool definitions passed to LLM
  ): Promise<LLMAgentDecision>;
}
