import { TaskPriority } from "../value-objects/task-priority.vo";
import { TaskStatus } from "../value-objects/task-status.vo";

import { AgentTaskCore } from "./agent-task-core.entity";
import { AgentTaskTransitions } from "./agent-task-transitions.entity";

export class AgentTask extends AgentTaskCore {
  private readonly transitions: AgentTaskTransitions;

  constructor(id: string, priority: TaskPriority) {
    super(id, priority);
    this.transitions = new AgentTaskTransitions(this.state);
  }

  start(): void {
    this.transitions.start();
  }

  complete(): void {
    this.transitions.complete();
  }

  fail(): void {
    this.transitions.fail();
  }

  cancel(): void {
    this.transitions.cancel();
  }
}
