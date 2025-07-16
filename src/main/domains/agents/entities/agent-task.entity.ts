import { TaskPriority } from "../value-objects/task-priority.vo";
import { TaskStatus } from "../value-objects/task-status.vo";

export class AgentTask {
  constructor(id: string, priority: TaskPriority) {
    this.id = id;
    this.priority = priority;
    this.status = new TaskStatus("pending");
  }

  private readonly id: string;
  private readonly priority: TaskPriority;
  private status: TaskStatus;

  getId(): string {
    return this.id;
  }

  getPriority(): TaskPriority {
    return this.priority;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  start(): void {
    const newStatus = new TaskStatus("running");
    if (!this.status.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this.status.getValue()} to running`,
      );
    }
    this.status = newStatus;
  }

  complete(): void {
    const newStatus = new TaskStatus("completed");
    if (!this.status.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this.status.getValue()} to completed`,
      );
    }
    this.status = newStatus;
  }

  fail(): void {
    const newStatus = new TaskStatus("failed");
    if (!this.status.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this.status.getValue()} to failed`,
      );
    }
    this.status = newStatus;
  }

  cancel(): void {
    const newStatus = new TaskStatus("cancelled");
    if (!this.status.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this.status.getValue()} to cancelled`,
      );
    }
    this.status = newStatus;
  }

  canExecute(): boolean {
    return this.status.isPending();
  }

  isFinished(): boolean {
    return this.status.isCompleted() || this.status.isFailed();
  }
}
