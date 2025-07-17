import { AgentIdentity } from "./value-objects/agent-identity.vo";
import { AgentConfiguration } from "./value-objects/agent-configuration.vo";
import { AgentRuntime } from "./value-objects/agent-runtime.vo";
import { AgentExecutionContext } from "./value-objects/agent-execution-context.vo";

import { publishEvent } from "@/infrastructure/events";

export class Agent {
  constructor(
    private readonly identity: AgentIdentity,
    private readonly configuration: AgentConfiguration,
    private readonly runtime: AgentRuntime,
  ) {}

  public startWork(): void {
    if (!this.canStartWork()) {
      throw new Error(`Agent ${this.identity.getValue()} cannot start work`);
    }

    const newRuntime = this.runtime.updateStatus("busy");
    publishEvent("agent.work.started", {
      agentId: this.identity.getValue(),
      timestamp: new Date(),
    });
  }

  public completeWork(): void {
    if (!this.runtime.isBusy()) {
      throw new Error(`Agent ${this.identity.getValue()} is not busy`);
    }

    const newRuntime = this.runtime.updateStatus("active");
    publishEvent("agent.work.completed", {
      agentId: this.identity.getValue(),
      timestamp: new Date(),
    });
  }

  public activate(): void {
    if (this.runtime.isActive()) {
      throw new Error(`Agent ${this.identity.getValue()} is already active`);
    }

    const newRuntime = this.runtime.updateStatus("active");
    publishEvent("agent.activated", {
      agentId: this.identity.getValue(),
      timestamp: new Date(),
    });
  }

  public deactivate(): void {
    if (this.runtime.isInactive()) {
      throw new Error(`Agent ${this.identity.getValue()} is already inactive`);
    }

    const newRuntime = this.runtime.updateStatus("inactive");
    publishEvent("agent.deactivated", {
      agentId: this.identity.getValue(),
      timestamp: new Date(),
    });
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
