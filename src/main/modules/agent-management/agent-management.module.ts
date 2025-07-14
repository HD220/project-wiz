import { BaseModule } from "../../kernel/base-module";
import {
  AgentCreatedEvent,
  AgentUpdatedEvent,
  AgentDeletedEvent,
  EVENT_TYPES,
} from "../../kernel/events";

import { AgentMapper } from "./agent.mapper";
import { AgentService } from "./application/agent.service";
import { AgentIpcHandlers } from "./ipc/agent.handlers";
import { AgentRepository } from "./persistence/agent.repository";

export class AgentManagementModule extends BaseModule {
  private agentRepository!: AgentRepository;
  private agentService!: AgentService;
  private agentMapper!: AgentMapper;
  private agentIpcHandlers!: AgentIpcHandlers;

  getName(): string {
    return "agent-management";
  }

  getDependencies(): string[] {
    return ["llm-provider"]; // Depends on LLM provider module
  }

  protected async onInitialize(): Promise<void> {
    this.agentRepository = new AgentRepository();
    this.agentMapper = new AgentMapper();

    // Get LLM provider service from dependency container
    const llmProviderModule = this.container.get("llm-provider") as any;
    const llmProviderService = llmProviderModule.getLlmProviderService();

    this.agentService = new AgentService(
      this.agentRepository,
      this.agentMapper,
      llmProviderService,
    );
    this.agentIpcHandlers = new AgentIpcHandlers(
      this.agentService,
      this.agentMapper,
    );
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

  // Public getters for other modules
  getAgentService(): AgentService {
    if (!this.isInitialized()) {
      throw new Error("AgentManagementModule must be initialized first");
    }
    return this.agentService;
  }

  getAgentRepository(): AgentRepository {
    if (!this.isInitialized()) {
      throw new Error("AgentManagementModule must be initialized first");
    }
    return this.agentRepository;
  }
}
