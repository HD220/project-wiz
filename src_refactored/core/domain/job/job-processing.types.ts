// src_refactored/core/domain/job/job-processing.types.ts
import { ActivityHistory } from './value-objects/activity-history.vo';
import { ActivityContext } from './value-objects/activity-context.vo'; // Will be part of AgentJobState

// Represents a single entry in the execution history of an agent for a job
export interface ExecutionHistoryEntry {
  timestamp: Date;
  type: 'llm_call' | 'llm_response' | 'llm_error' | 'llm_warning' | 'llm_event' |
        'tool_call' | 'tool_result' | 'tool_error' |
        'system_message' | 'system_error' | 'state_change';
  name: string; // e.g., tool name for tool_call, event name like 'goal_completed'
  params?: Record<string, any>; // e.g., tool arguments
  result?: any; // e.g., tool output, LLM response object
  error?: string | Record<string, any>; // Error message or object
}

// Represents the state managed by an agent (like GenericAgentExecutor) during job processing.
// This is stored within Job.data.agentState.
export interface AgentJobState {
  // conversationHistory is the ActivityHistory, containing sequential interactions.
  // The GenericAgentExecutor uses the 'ai' Message[] type for this, which is compatible
  // with what ActivityHistory can represent.
  conversationHistory: ActivityHistory; // This is the core of ActivityContext

  // executionHistory is a log of discrete actions/events taken by the agent executor.
  executionHistory: ReadonlyArray<ExecutionHistoryEntry>;

  // Other parts of what was previously in ActivityContext VO are implicitly part of
  // the conversation or derived from it by the LLM (e.g., plannedSteps, validationCriteria).
  // Or they can be added here if they need to be explicitly tracked outside the conversation.
  // For now, ActivityContext itself is not directly stored here, but its components are.
  // The `ActivityContext` VO can be constructed *from* `conversationHistory` and other parts of `AgentJobState` if needed.
}

// Result from an IAgentExecutor.processJob call
export interface AgentExecutorResult {
  status: 'COMPLETED' | 'FAILED' | 'CONTINUE_PROCESSING';
  message: string;
  output?: any; // Final output if COMPLETED
}
