import { getLogger } from "../../../infrastructure/logger";

import { AgentTask } from "./entities/agent-task.entity";
import { TaskPriority } from "./value-objects/task-priority.vo";

const logger = getLogger("agent.queue");

export function sortTasksByPriority(tasks: AgentTask[]): AgentTask[] {
  return tasks.sort((a, b) => {
    return (
      b.getPriority().getNumericValue() - a.getPriority().getNumericValue()
    );
  });
}

export function filterTasksByPriority(
  tasks: AgentTask[],
  priority: TaskPriority,
): AgentTask[] {
  return tasks.filter((task) => task.getPriority().equals(priority));
}

export function logTaskEnqueued(taskId: string): void {
  logger.info("Task enqueued", { taskId });
}

export function logTaskDequeued(taskId: string): void {
  logger.info("Task dequeued", { taskId });
}

export function logQueueCleared(taskCount: number): void {
  logger.info("Queue cleared", { taskCount });
}
