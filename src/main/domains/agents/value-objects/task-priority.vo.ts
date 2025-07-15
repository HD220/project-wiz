import { z } from "zod";

const TaskPrioritySchema = z.enum(["low", "normal", "high", "urgent"]);

export type TaskPriorityType = z.infer<typeof TaskPrioritySchema>;

export class TaskPriority {
  constructor(priority: TaskPriorityType) {
    const validated = TaskPrioritySchema.parse(priority);
    this.value = validated;
  }

  private readonly value: TaskPriorityType;

  getValue(): TaskPriorityType {
    return this.value;
  }

  getNumericValue(): number {
    const priorities = { low: 1, normal: 2, high: 3, urgent: 4 };
    return priorities[this.value];
  }

  isHigherThan(other: TaskPriority): boolean {
    return this.getNumericValue() > other.getNumericValue();
  }

  equals(other: TaskPriority): boolean {
    return this.value === other.value;
  }
}
