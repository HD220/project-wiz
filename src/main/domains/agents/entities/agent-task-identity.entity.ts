import { TaskPriority } from "../value-objects/task-priority.vo";

export class AgentTaskIdentity {
  constructor(
    private readonly id: string,
    private readonly priority: TaskPriority,
  ) {}

  getId(): string {
    return this.id;
  }

  getPriority(): TaskPriority {
    return this.priority;
  }
}
