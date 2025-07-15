import { z } from "zod";

const TaskStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
]);

export type TaskStatusType = z.infer<typeof TaskStatusSchema>;

export class TaskStatus {
  constructor(status: TaskStatusType) {
    const validated = TaskStatusSchema.parse(status);
    this.value = validated;
  }

  private readonly value: TaskStatusType;

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
    const current = this.value;
    const target = newStatus.value;

    const validTransitions: Record<TaskStatusType, TaskStatusType[]> = {
      pending: ["running", "cancelled"],
      running: ["completed", "failed", "cancelled"],
      completed: [],
      failed: [],
      cancelled: [],
    };

    return validTransitions[current].includes(target);
  }

  equals(other: TaskStatus): boolean {
    return this.value === other.value;
  }
}
