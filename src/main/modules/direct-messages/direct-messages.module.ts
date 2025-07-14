import { BaseModule } from "../../kernel/base-module";
import { DependencyContainer } from "../../kernel/dependency-container";
import { ConversationService } from "./application/conversation.service";
import { MessageService } from "./application/message.service";
import { AgentConversationService } from "./application/agent-conversation.service";
import { DirectMessageIpcHandlers } from "./ipc/handlers";
import { TextGenerationService } from "../llm-provider/application/text-generation.service";
import { AgentManagementModule } from "../agent-management/agent-management.module";
import { LlmProviderModule } from "../llm-provider/llm-provider.module";
import {
  AgentCreatedEvent,
  MessageSentEvent,
  ConversationStartedEvent,
  EVENT_TYPES,
} from "../../kernel/events";

export class DirectMessagesModule extends BaseModule {
  private conversationService!: ConversationService;
  private messageService!: MessageService;
  private agentConversationService!: AgentConversationService;
  private textGenerationService!: TextGenerationService;
  private handlers!: DirectMessageIpcHandlers;

  getName(): string {
    return "direct-messages";
  }

  getDependencies(): string[] {
    return ["agent-management", "llm-provider"];
  }

  protected async onInitialize(): Promise<void> {
    // Get dependencies from container
    const container = DependencyContainer.getInstance();
    const agentModule =
      container.get<AgentManagementModule>("agent-management");
    const llmProviderModule = container.get<LlmProviderModule>("llm-provider");

    // Get services from other modules
    const agentService = agentModule.getAgentService();
    const llmProviderService = llmProviderModule.getLlmProviderService();

    // Initialize text generation service
    this.textGenerationService = new TextGenerationService(llmProviderService);

    // Initialize direct messages services
    this.conversationService = new ConversationService();
    this.messageService = new MessageService();
    this.agentConversationService = new AgentConversationService(
      this.messageService,
      this.conversationService,
      agentService,
      this.textGenerationService,
    );

    // Initialize IPC handlers
    this.handlers = new DirectMessageIpcHandlers(
      this.conversationService,
      this.messageService,
      this.agentConversationService,
    );
  }

  protected subscribeToEvents(): void {
    // Listen to agent creation events to prepare conversation capabilities
    this.subscribeToEvent(
      EVENT_TYPES.AGENT_CREATED,
      async (event: AgentCreatedEvent) => {
        console.log(
          `New agent created: ${event.agent.name} (${event.entityId}), ready for conversations`,
        );
        // Could pre-create conversation objects or setup agent context
      },
    );

    // Listen to message events for analytics or logging
    this.subscribeToEvent(
      EVENT_TYPES.MESSAGE_SENT,
      async (event: MessageSentEvent) => {
        console.log(
          `Message sent in conversation: ${event.message.conversationId}`,
        );
        // Could trigger analytics, notifications, or other side effects
      },
    );
  }

  protected onRegisterIpcHandlers(): void {
    this.handlers.registerHandlers();
  }

  // Public getters for other modules
  getConversationService(): ConversationService {
    if (!this.isInitialized()) {
      throw new Error("DirectMessagesModule must be initialized first");
    }
    return this.conversationService;
  }

  getMessageService(): MessageService {
    if (!this.isInitialized()) {
      throw new Error("DirectMessagesModule must be initialized first");
    }
    return this.messageService;
  }

  getAgentConversationService(): AgentConversationService {
    if (!this.isInitialized()) {
      throw new Error("DirectMessagesModule must be initialized first");
    }
    return this.agentConversationService;
  }
}
