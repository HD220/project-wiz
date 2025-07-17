import { AgentIdentity } from "./value-objects/agent-identity.vo";
import { AgentConfiguration } from "./value-objects/agent-configuration.vo";
import { AgentRuntime } from "./value-objects/agent-runtime.vo";
import { AgentExecutionContext } from "./value-objects/agent-execution-context.vo";
import { AgentName } from "./value-objects/agent-name.vo";
import { AgentRole } from "./value-objects/agent-role.vo";

import { publishEvent } from "../../infrastructure/events";

export interface AgentData {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  llmProviderId: string;
  temperature: number;
  maxTokens: number;
  status: "active" | "inactive" | "busy";
  createdAt: Date;
  updatedAt: Date;
}

export class Agent {
  private data: AgentData;
  private readonly identity: AgentIdentity;
  private readonly configuration: AgentConfiguration;
  private readonly runtime: AgentRuntime;

  constructor(data: AgentData) {
    this.data = { ...data };
    this.identity = new AgentIdentity(
      new AgentName(data.name),
      new AgentRole(data.role),
    );
    this.configuration = new AgentConfiguration(data);
    this.runtime = new AgentRuntime(data.status);
  }

  // Compatibility methods for mapper
  public getId(): string {
    return this.data.id;
  }

  public getName(): string {
    return this.data.name;
  }

  public getRole(): string {
    return this.data.role;
  }

  public getGoal(): string {
    return this.data.goal;
  }

  public getBackstory(): string {
    return this.data.backstory;
  }

  public getLlmProviderId(): string {
    return this.data.llmProviderId;
  }

  public getTemperature(): number {
    return this.data.temperature;
  }

  public getMaxTokens(): number {
    return this.data.maxTokens;
  }

  public getStatus(): "active" | "inactive" | "busy" {
    return this.data.status;
  }

  public isActive(): boolean {
    return this.data.status === "active";
  }

  public isBusy(): boolean {
    return this.data.status === "busy";
  }

  public toData(): AgentData {
    return {
      ...this.data,
      updatedAt: new Date(),
    };
  }

  // Domain behaviors
  public startWork(): Agent {
    if (!this.canStartWork()) {
      throw new Error(`Agent ${this.identity.getValue()} cannot start work`);
    }

    this.data.status = "busy";
    publishEvent({
      type: "agent.work.started",
      agentId: this.identity.getValue(),
      timestamp: new Date(),
    });

    return this;
  }

  public completeWork(): Agent {
    if (!this.runtime.isBusy()) {
      throw new Error(`Agent ${this.identity.getValue()} is not busy`);
    }

    this.data.status = "active";
    publishEvent({
      type: "agent.work.completed",
      agentId: this.identity.getValue(),
      timestamp: new Date(),
    });

    return this;
  }

  public activate(): Agent {
    if (this.runtime.isActive()) {
      throw new Error(`Agent ${this.identity.getValue()} is already active`);
    }

    this.data.status = "active";
    publishEvent({
      type: "agent.activated",
      agentId: this.identity.getValue(),
      timestamp: new Date(),
    });

    return this;
  }

  public deactivate(): Agent {
    if (this.runtime.isInactive()) {
      throw new Error(`Agent ${this.identity.getValue()} is already inactive`);
    }

    this.data.status = "inactive";
    publishEvent({
      type: "agent.deactivated",
      agentId: this.identity.getValue(),
      timestamp: new Date(),
    });

    return this;
  }

  public canStartWork(): boolean {
    return this.runtime.canAcceptNewTask() && this.configuration.isConfigured();
  }

  public isValidForExecution(): boolean {
    return this.canStartWork() && this.configuration.hasValidLLM();
  }

  public isOverloaded(): boolean {
    return this.runtime.isOverloaded();
  }

  public toExecutionContext(): AgentExecutionContext {
    return new AgentExecutionContext({
      agentId: this.identity.getValue(),
      promptTemplate: this.configuration.generateSystemPrompt(),
      temperature: this.configuration.getTemperature(),
      maxTokens: this.configuration.getMaxTokens(),
      llmProviderId: this.configuration.getLlmProviderId(),
    });
  }

  public equals(other: Agent): boolean {
    return this.identity.equals(other.identity);
  }
}
