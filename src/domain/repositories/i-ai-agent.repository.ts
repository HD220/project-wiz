// src/domain/repositories/i-ai-agent.repository.ts
import { AIAgent } from '../entities/ai-agent.entity';

export interface IAIAgentRepository {
  /**
   * Saves an AI Agent's configuration.
   * This could be a create or an update operation.
   * @param agent The AIAgent entity to save.
   */
  save(agent: AIAgent): Promise<void>;

  /**
   * Finds an AI Agent by its ID.
   * @param id The ID of the agent to find.
   * @returns The AIAgent found or null.
   */
  findById(id: string): Promise<AIAgent | null>;

  /**
   * Finds an AI Agent by its queue name.
   * Useful for the AgentLifecycleService to find agent configurations.
   * @param queueName The queue name associated with the agent.
   * @returns The AIAgent found or null.
   */
  findByQueueName(queueName: string): Promise<AIAgent | null>;

  /**
   * Lists all configured AI Agents.
   * @returns A promise for an array of all AIAgents.
   */
  findAll(): Promise<AIAgent[]>;

  /**
   * Deletes an AI Agent by its ID.
   * @param id The ID of the agent to delete.
   */
  deleteById(id: string): Promise<void>;
}
