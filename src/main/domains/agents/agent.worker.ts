import { getLogger } from "../../infrastructure/logger";

import { AgentQueue } from "./agent.queue";
import { AgentTask } from "./entities/agent-task.entity";
import { Agent } from "./entities/agent.entity";

const logger = getLogger("agent.worker");

export class AgentWorker {
  constructor(agent: Agent) {
    this.agent = agent;
    this.queue = new AgentQueue();
    this.isRunning = false;
  }

  private readonly agent: Agent;
  private readonly queue: AgentQueue;
  private isRunning: boolean;

  start(): void {
    if (this.isRunning) {
      throw new Error("Worker is already running");
    }

    this.isRunning = true;
    logger.info("Worker started", { agentName: this.agent.getName() });

    this.processQueue();
  }

  stop(): void {
    this.isRunning = false;
    logger.info("Worker stopped", { agentName: this.agent.getName() });
  }

  addTask(task: AgentTask): void {
    this.queue.enqueue(task);

    if (!this.isRunning) {
      this.start();
    }
  }

  private async processQueue(): Promise<void> {
    while (this.isRunning && !this.queue.isEmpty()) {
      const task = this.queue.dequeue();

      if (task && task.canExecute()) {
        await this.executeTask(task);
      }
    }

    if (this.queue.isEmpty()) {
      this.stop();
    }
  }

  private async executeTask(task: AgentTask): Promise<void> {
    try {
      task.start();
      logger.info("Task started", {
        taskId: task.getId(),
        agentName: this.agent.getName(),
      });

      await this.performTask(task);

      task.complete();
      logger.info("Task completed", {
        taskId: task.getId(),
        agentName: this.agent.getName(),
      });
    } catch (error) {
      task.fail();
      logger.error("Task failed", {
        taskId: task.getId(),
        agentName: this.agent.getName(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private async performTask(task: AgentTask): Promise<void> {
    logger.info("Performing task", {
      taskId: task.getId(),
      agent: this.agent.getName(),
    });
  }

  getQueueSize(): number {
    return this.queue.size();
  }

  isWorkerRunning(): boolean {
    return this.isRunning;
  }
}
