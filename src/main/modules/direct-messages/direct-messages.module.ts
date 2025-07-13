// Direct Messages Module - Dependency Injection Setup
import { ConversationService } from "./services/conversation.service";
import { MessageService } from "./services/message.service";
import { AgentConversationService } from "./services/agent-conversation.service";
import { DirectMessageIpcHandlers } from "./ipc/handlers";

// Agent Management dependencies
import { AgentService } from "../agent-management/application/agent.service";
import { AgentRepository } from "../agent-management/persistence/agent.repository";
import { AgentMapper } from "../agent-management/agent.mapper";


// LLM Provider dependencies
import { LlmProviderService } from "../llm-provider/application/llm-provider.service";
import { LlmProviderRepository } from "../llm-provider/persistence/llm-provider.repository";
import { LlmProviderMapper } from "../llm-provider/llm-provider.mapper";
import { EncryptionService } from "../llm-provider/application/encryption.service";
import { TextGenerationService } from "../llm-provider/application/text-generation.service";

export class DirectMessagesModule {
  private static instance: DirectMessagesModule;
  private handlers!: DirectMessageIpcHandlers;

  private constructor() {
    this.initializeServices();
  }

  static getInstance(): DirectMessagesModule {
    if (!DirectMessagesModule.instance) {
      DirectMessagesModule.instance = new DirectMessagesModule();
    }
    return DirectMessagesModule.instance;
  }

  private initializeServices(): void {
    // Initialize repositories and mappers
    const agentRepository = new AgentRepository();
    const agentMapper = new AgentMapper();
    const llmProviderRepository = new LlmProviderRepository();
    const llmProviderMapper = new LlmProviderMapper();
    const encryptionService = new EncryptionService();

    // Initialize core services
    const llmProviderService = new LlmProviderService(
      llmProviderRepository,
      llmProviderMapper
    );
    const agentService = new AgentService(
      agentRepository,
      agentMapper
    );
    const textGenerationService = new TextGenerationService(llmProviderService);

    // Initialize direct messages services
    const conversationService = new ConversationService();
    const messageService = new MessageService();
    const agentConversationService = new AgentConversationService(
      messageService,
      conversationService,
      agentService,
      textGenerationService
    );

    // Initialize IPC handlers
    this.handlers = new DirectMessageIpcHandlers(
      conversationService,
      messageService,
      agentConversationService
    );
  }

  registerIpcHandlers(): void {
    this.handlers.registerHandlers();
  }

  // Getter methods for services (useful for testing or external access)
  getHandlers(): DirectMessageIpcHandlers {
    return this.handlers;
  }
}