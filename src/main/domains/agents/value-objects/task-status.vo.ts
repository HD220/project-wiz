import { z } from "zod";

import { canTransitionBetween } from "./task-status-transitions.functions";

const TaskStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
]);

export type TaskStatusType = z.infer<typeof TaskStatusSchema>;

export class TaskStatus {
  private readonly value: TaskStatusType;

  constructor(status: TaskStatusType) {
    this.value = TaskStatusSchema.parse(status);
  }

  getValue(): TaskStatusType {
    return this.value;
  }

  isPending(): boolean {
    return this.value === "pending";
  }

  isRunning(): boolean {
    return this.value === "running";
  }

  isCompleted(): boolean {
    return this.value === "completed";
  }

  isFailed(): boolean {
    return this.value === "failed";
  }

  canTransitionTo(newStatus: TaskStatus): boolean {
    return canTransitionBetween(this.value, newStatus.value);
  }

  equals(other: TaskStatus): boolean {
    return this.value === other.value;
  }
}
