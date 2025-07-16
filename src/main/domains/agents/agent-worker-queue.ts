import { AgentQueue } from "./agent.queue";
import { AgentTask } from "./entities/agent-task.entity";
import { AgentTaskProcessor } from "./agent-task-processor";

export class AgentWorkerQueue {
  constructor() {
    this.queue = new AgentQueue();
    this.processor = new AgentTaskProcessor();
  }

  private readonly queue: AgentQueue;
  private readonly processor: AgentTaskProcessor;

  add(task: AgentTask): void {
    this.queue.enqueue(task);
  }

  async processNext(): Promise<boolean> {
    const task = this.queue.dequeue();
    if (!task || !task.canExecute()) {
      return false;
    }

    await this.processor.process(task);
    return true;
  }

  isEmpty(): boolean {
    return this.queue.isEmpty();
  }

  size(): number {
    return this.queue.size();
  }
}