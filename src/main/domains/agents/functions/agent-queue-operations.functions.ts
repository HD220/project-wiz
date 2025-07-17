import { getLogger } from "../../../infrastructure/logger";
import { AgentTask } from "../index";

const logger = getLogger("agent.queue");

// Prioridades simplificadas
const PRIORITY_VALUES = { low: 1, medium: 2, high: 3 };

export function sortTasksByPriority(tasks: AgentTask[]): AgentTask[] {
  return tasks.sort((a, b) => {
    return PRIORITY_VALUES[b.priority] - PRIORITY_VALUES[a.priority];
  });
}

export function filterTasksByPriority(
  tasks: AgentTask[],
  priority: "low" | "medium" | "high",
): AgentTask[] {
  return tasks.filter((task) => task.priority === priority);
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
