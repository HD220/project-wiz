import { Result } from "../../shared/result";
import { Job } from "../domain/entities/job/job.entity";
import { ITool } from "../application/tools/tool.interface"; // Assuming ITool is defined
import { ILLM } from "../application/llms/llm.interface";
// Import input types for modifications
import { ActivityContextPropsInput } from '../domain/entities/job/value-objects/activity-context.vo';
import { AgentRuntimeStateCreateProps } from '../domain/entities/agent/agent-runtime-state.entity'; // Assuming this is the input type for AgentRuntimeState.create

export interface TaskExecutionResult {
    jobContextModifications?: Partial<ActivityContextPropsInput>;
    runtimeStateModifications?: Partial<AgentRuntimeStateCreateProps>;
    outputPayload: any;
    statusOverride?: "FINISHED" | "FAILED" | "PENDING" | "DELAYED"; // JobStatusType values
}

export interface Task {
  /**
   * Executes the Task logic
   * @param currentJob Job data being processed
   * @param tools Optional array of tools available to the task
   * @param llm Optional LLM interface for tasks that need direct LLM access
   * @returns A Result containing TaskExecutionResult on success, or an error.
   */
  execute(
    currentJob: Job,
    tools?: ITool[],
    llm?: ILLM
  ): Promise<Result<TaskExecutionResult>>;
}
