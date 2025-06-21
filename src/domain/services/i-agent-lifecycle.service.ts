// src/domain/services/i-agent-lifecycle.service.ts

export interface IAgentLifecycleService {
  /**
   * Initializes and starts all configured AI Agents.
   * This typically involves:
   * - Loading agent configurations.
   * - Setting up a QueueClient for each agent's queue.
   * - Getting the job processor for each agent.
   * - Instantiating and starting a GenericWorker for each agent.
   */
  initializeAndStartAgents(): Promise<void>;

  /**
   * Stops all running AI Agent workers gracefully.
   */
  stopAllAgents(): Promise<void>;

  // Optional: Methods to start/stop individual agents if needed later
  // startAgent(agentId: string): Promise<void>;
  // stopAgent(agentId: string): Promise<void>;
}
