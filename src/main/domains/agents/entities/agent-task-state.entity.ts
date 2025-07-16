import { TaskStatus } from "../value-objects/task-status.vo";

export class AgentTaskState {
  constructor(private status: TaskStatus) {}

  getStatus(): TaskStatus {
    return this.status;
  }

  canExecute(): boolean {
    return this.status.isPending();
  }

  isFinished(): boolean {
    return this.status.isCompleted() || this.status.isFailed();
  }

  transitionTo(newStatus: TaskStatus): void {
    if (!this.status.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this.status.getValue()} to ${newStatus.getValue()}`,
      );
    }
    this.status = newStatus;
  }
}
