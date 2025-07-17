import { getLogger } from "@/infrastructure/logger";

import { Agent } from "../agent.entity";

const logger = getLogger("agent.worker.state");

export class AgentWorkerState {
  constructor(agent: Agent) {
    this.agent = agent;
    this.isRunning = false;
  }

  private readonly agent: Agent;
  private isRunning: boolean;

  start(): void {
    if (this.isRunning) {
      throw new Error("Worker is already running");
    }

    this.isRunning = true;
    logger.info("Worker started", { agentName: this.agent.getName() });
  }

  stop(): void {
    this.isRunning = false;
    logger.info("Worker stopped", { agentName: this.agent.getName() });
  }

  isWorkerRunning(): boolean {
    return this.isRunning;
  }

  shouldContinue(): boolean {
    return this.isRunning;
  }
}
