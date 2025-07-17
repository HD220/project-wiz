import { publishEvent } from "../../infrastructure/events";
import {
  AgentData,
  AgentDataSchema,
  AgentStatus,
  AgentValidation,
} from "./value-objects/agent-values";

export interface AgentEntityData extends AgentData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Agent {
  private data: AgentEntityData;

  constructor(data: AgentEntityData) {
    // Validate data on construction
    const validatedData = AgentDataSchema.parse(data);
    this.data = { ...data, ...validatedData };
  }

  // Getters
  public getId(): string {
    return this.data.id;
  }

  public getName(): string {
    return this.data.name;
  }

  public getRole(): string {
    return this.data.role;
  }

  public getStatus(): AgentStatus {
    return this.data.status;
  }

  // Business status checks
  public isInactive(): boolean {
    return this.data.status === "inactive";
  }

  public isActive(): boolean {
    return this.data.status === "active";
  }

  public isBusy(): boolean {
    return this.data.status === "busy";
  }

  public toData(): AgentEntityData {
    return {
      ...this.data,
      updatedAt: new Date(),
    };
  }

  // Domain behaviors
  public startWork(): Agent {
    if (!this.canStartWork()) {
      throw new Error(`Agent ${this.getName()} cannot start work`);
    }

    this.data.status = "busy";
    publishEvent({
      type: "agent.work.started",
      agentId: this.getId(),
      timestamp: new Date(),
    });

    return this;
  }

  public completeWork(): Agent {
    if (!this.isBusy()) {
      throw new Error(`Agent ${this.getName()} is not busy`);
    }

    this.data.status = "active";
    publishEvent({
      type: "agent.work.completed",
      agentId: this.getId(),
      timestamp: new Date(),
    });

    return this;
  }

  public activate(): Agent {
    if (this.isActive()) {
      throw new Error(`Agent ${this.getName()} is already active`);
    }

    this.data.status = "active";
    publishEvent({
      type: "agent.activated",
      agentId: this.getId(),
      timestamp: new Date(),
    });

    return this;
  }

  public deactivate(): Agent {
    if (this.isInactive()) {
      throw new Error(`Agent ${this.getName()} is already inactive`);
    }

    this.data.status = "inactive";
    publishEvent({
      type: "agent.deactivated",
      agentId: this.getId(),
      timestamp: new Date(),
    });

    return this;
  }

  public canStartWork(): boolean {
    return this.isActive() && this.hasValidConfiguration();
  }

  public isValidForExecution(): boolean {
    return this.canStartWork() && this.hasValidLLM();
  }

  public hasValidConfiguration(): boolean {
    return (
      this.data.name.length > 0 &&
      this.data.role.length > 0 &&
      this.data.goal.length > 0
    );
  }

  public hasValidLLM(): boolean {
    return this.data.llmProviderId.length > 0;
  }

  public generateSystemPrompt(): string {
    return `You are ${this.data.name}, a ${this.data.role}.
    
Your goal: ${this.data.goal}
Your backstory: ${this.data.backstory}

Please respond according to your role and goal.`;
  }

  public toExecutionContext(): AgentExecutionContext {
    return {
      agentId: this.getId(),
      promptTemplate: this.generateSystemPrompt(),
      temperature: this.data.temperature,
      maxTokens: this.data.maxTokens,
      llmProviderId: this.data.llmProviderId,
    };
  }

  public equals(other: Agent): boolean {
    return this.getId() === other.getId();
  }
}

// Execution context type
export interface AgentExecutionContext {
  agentId: string;
  promptTemplate: string;
  temperature: number;
  maxTokens: number;
  llmProviderId: string;
}
