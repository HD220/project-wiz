import { getLogger } from "../../infrastructure/logger";

import { AgentTask } from "./entities/agent-task.entity";
import { TaskPriority } from "./value-objects/task-priority.vo";

const logger = getLogger("agent.queue");

export class AgentQueue {
  constructor() {
    this.tasks = [];
  }

  private tasks: AgentTask[];

  enqueue(task: AgentTask): void {
    this.tasks.push(task);
    this.sortByPriority();
    logger.info("Task enqueued", { taskId: task.getId() });
  }

  dequeue(): AgentTask | null {
    const task = this.tasks.shift() || null;
    if (task) {
      logger.info("Task dequeued", { taskId: task.getId() });
    }
    return task;
  }

  peek(): AgentTask | null {
    return this.tasks[0] || null;
  }

  isEmpty(): boolean {
    return this.tasks.length === 0;
  }

  size(): number {
    return this.tasks.length;
  }

  clear(): void {
    const count = this.tasks.length;
    this.tasks = [];
    logger.info("Queue cleared", { taskCount: count });
  }

  private sortByPriority(): void {
    this.tasks.sort((a, b) => {
      return (
        b.getPriority().getNumericValue() - a.getPriority().getNumericValue()
      );
    });
  }

  getTasksByPriority(priority: TaskPriority): AgentTask[] {
    return this.tasks.filter((task) => task.getPriority().equals(priority));
  }
}
