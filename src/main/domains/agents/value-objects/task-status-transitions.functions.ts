import { TaskStatusType } from "./task-status.vo";

export function canTransitionBetween(
  current: TaskStatusType,
  target: TaskStatusType,
): boolean {
  const validTransitions: Record<TaskStatusType, TaskStatusType[]> = {
    pending: ["running", "cancelled"],
    running: ["completed", "failed", "cancelled"],
    completed: [],
    failed: [],
    cancelled: [],
  };

  return validTransitions[current].includes(target);
}

export function isTerminalStatus(status: TaskStatusType): boolean {
  return ["completed", "failed", "cancelled"].includes(status);
}

export function isActiveStatus(status: TaskStatusType): boolean {
  return ["pending", "running"].includes(status);
}
