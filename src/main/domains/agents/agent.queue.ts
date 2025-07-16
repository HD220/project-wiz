import {
  sortTasksByPriority,
  filterTasksByPriority,
  logTaskEnqueued,
  logTaskDequeued,
  logQueueCleared,
} from "./agent-queue-operations.functions";
import { AgentTask } from "./entities/agent-task.entity";
import { TaskPriority } from "./value-objects/task-priority.vo";

export class AgentQueue {
  private tasks: AgentTask[] = [];

  enqueue(task: AgentTask): void {
    this.tasks.push(task);
    this.tasks = sortTasksByPriority(this.tasks);
    logTaskEnqueued(task.getId());
  }

  dequeue(): AgentTask | null {
    const task = this.tasks.shift() || null;
    if (task) {
      logTaskDequeued(task.getId());
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
    logQueueCleared(count);
  }

  getTasksByPriority(priority: TaskPriority): AgentTask[] {
    return filterTasksByPriority(this.tasks, priority);
  }
}
