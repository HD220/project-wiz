import { BaseModule } from "../../kernel/base-module";
import {
  AgentCreatedEvent,
  AgentUpdatedEvent,
  AgentDeletedEvent,
  EVENT_TYPES,
} from "../../kernel/events";

import { AgentIpcHandlers } from "./ipc/agent.handlers";

export class AgentManagementModule extends BaseModule {
  private agentIpcHandlers!: AgentIpcHandlers;

  getName(): string {
    return "agent-management";
  }

  getDependencies(): string[] {
    return []; // No dependencies - uses domain functions directly
  }

  protected async onInitialize(): Promise<void> {
    this.agentIpcHandlers = new AgentIpcHandlers();
  }

  protected subscribeToEvents(): void {
    // Listen to LLM provider changes to update agent configurations
    this.subscribeToEvent(EVENT_TYPES.LLM_PROVIDER_DELETED, async (event) => {
      // Handle agent updates when their LLM provider is deleted
      console.log(
        `LLM Provider ${event.entityId} deleted, checking agent dependencies...`,
      );
      // TODO: Implement logic to handle agents using deleted LLM provider
    });
  }

  protected onRegisterIpcHandlers(): void {
    this.agentIpcHandlers.registerHandlers();
  }

  // Module now uses domain functions directly - no service getters needed
}
