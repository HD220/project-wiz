import { TaskPriority } from "../value-objects/task-priority.vo";
import { TaskStatus } from "../value-objects/task-status.vo";

import { AgentTaskIdentity } from "./agent-task-identity.entity";
import { AgentTaskState } from "./agent-task-state.entity";

export class AgentTaskCore {
  protected readonly identity: AgentTaskIdentity;
  protected readonly state: AgentTaskState;

  constructor(id: string, priority: TaskPriority) {
    this.identity = new AgentTaskIdentity(id, priority);
    this.state = new AgentTaskState(new TaskStatus("pending"));
  }

  getId(): string {
    return this.identity.getId();
  }

  getPriority(): TaskPriority {
    return this.identity.getPriority();
  }

  getStatus(): TaskStatus {
    return this.state.getStatus();
  }

  canExecute(): boolean {
    return this.state.canExecute();
  }

  isFinished(): boolean {
    return this.state.isFinished();
  }
}
