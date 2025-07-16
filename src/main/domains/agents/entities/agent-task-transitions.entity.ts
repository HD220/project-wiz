import { TaskStatus } from "../value-objects/task-status.vo";

import { AgentTaskState } from "./agent-task-state.entity";

export class AgentTaskTransitions {
  constructor(private readonly state: AgentTaskState) {}

  start(): void {
    this.state.transitionTo(new TaskStatus("running"));
  }

  complete(): void {
    this.state.transitionTo(new TaskStatus("completed"));
  }

  fail(): void {
    this.state.transitionTo(new TaskStatus("failed"));
  }

  cancel(): void {
    this.state.transitionTo(new TaskStatus("cancelled"));
  }
}
