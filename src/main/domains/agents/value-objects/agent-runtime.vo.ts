import { z } from "zod";

const AgentRuntimeSchema = z.object({
  status: z.enum(["active", "inactive", "busy"]).default("inactive"),
  queueSize: z.number().min(0).default(0),
  isProcessing: z.boolean().default(false),
  lastActivity: z.date().default(() => new Date()),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type AgentRuntimeData = z.infer<typeof AgentRuntimeSchema>;

export class AgentRuntime {
  constructor(private data: AgentRuntimeData) {
    this.data = AgentRuntimeSchema.parse(data);
  }

  public getStatus(): string {
    return this.data.status;
  }

  public getQueueSize(): number {
    return this.data.queueSize;
  }

  public isProcessing(): boolean {
    return this.data.isProcessing;
  }

  public getLastActivity(): Date {
    return this.data.lastActivity;
  }

  public getCreatedAt(): Date {
    return this.data.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.data.updatedAt;
  }

  public isActive(): boolean {
    return this.data.status === "active";
  }

  public isBusy(): boolean {
    return this.data.status === "busy";
  }

  public isInactive(): boolean {
    return this.data.status === "inactive";
  }

  public canAcceptNewTask(): boolean {
    return this.isActive() && !this.data.isProcessing;
  }

  public isOverloaded(): boolean {
    return this.data.queueSize > 10;
  }

  public updateStatus(newStatus: "active" | "inactive" | "busy"): AgentRuntime {
    return new AgentRuntime({
      ...this.data,
      status: newStatus,
      updatedAt: new Date(),
    });
  }

  public incrementQueue(): AgentRuntime {
    return new AgentRuntime({
      ...this.data,
      queueSize: this.data.queueSize + 1,
      updatedAt: new Date(),
    });
  }

  public decrementQueue(): AgentRuntime {
    return new AgentRuntime({
      ...this.data,
      queueSize: Math.max(0, this.data.queueSize - 1),
      updatedAt: new Date(),
    });
  }

  public markAsProcessing(): AgentRuntime {
    return new AgentRuntime({
      ...this.data,
      isProcessing: true,
      lastActivity: new Date(),
      updatedAt: new Date(),
    });
  }

  public markAsIdle(): AgentRuntime {
    return new AgentRuntime({
      ...this.data,
      isProcessing: false,
      lastActivity: new Date(),
      updatedAt: new Date(),
    });
  }

  public toData(): AgentRuntimeData {
    return { ...this.data };
  }

  public equals(other: AgentRuntime): boolean {
    return (
      this.data.status === other.data.status &&
      this.data.isProcessing === other.data.isProcessing
    );
  }
}
