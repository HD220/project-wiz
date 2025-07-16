import { AgentWorkerQueue } from "./agent-worker-queue";
import { AgentWorkerState } from "./agent-worker-state";
import { AgentTask } from "../entities/agent-task.entity";
import { Agent } from "../entities/agent.entity";

export class AgentWorker {
  constructor(agent: Agent) {
    this.queue = new AgentWorkerQueue();
    this.state = new AgentWorkerState(agent);
  }

  private readonly queue: AgentWorkerQueue;
  private readonly state: AgentWorkerState;

  start(): void {
    this.state.start();
    this.processQueue();
  }

  stop(): void {
    this.state.stop();
  }

  addTask(task: AgentTask): void {
    this.queue.add(task);

    if (!this.state.isWorkerRunning()) {
      this.start();
    }
  }

  private async processQueue(): Promise<void> {
    while (this.state.shouldContinue() && !this.queue.isEmpty()) {
      await this.queue.processNext();
    }

    if (this.queue.isEmpty()) {
      this.stop();
    }
  }

  getQueueSize(): number {
    return this.queue.size();
  }

  isWorkerRunning(): boolean {
    return this.state.isWorkerRunning();
  }
}
