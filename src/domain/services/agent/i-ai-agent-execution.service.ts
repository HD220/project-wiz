// src/domain/services/agent/i-ai-agent-execution.service.ts
import { Job } from '@/domain/entities/job.entity';

export type AgentJobProcessor = (job: Job) => Promise<any>;

export interface IAIAgentExecutionService {
  /**
   * Retrieves or constructs a job processor function specific to the given agent.
   * This job processor will be executed by a GenericWorker.
   *
   * @param agentId The ID of the AI Agent for which to get the job processor.
   *                This ID is used to fetch the agent's configuration (profile, tools, etc.).
   * @returns A JobProcessor function that takes a Job entity and returns a Promise with the result.
   */
  getJobProcessorForAgent(agentId: string): AgentJobProcessor;
}
