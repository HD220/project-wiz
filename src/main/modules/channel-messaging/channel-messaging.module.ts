import { BaseModule } from '../../kernel/base-module';
import { DependencyContainer } from '../../kernel/dependency-container';
import { ChannelMessageRepository } from './persistence/repository';
import { ChannelMessageService } from './application/channel-message.service';
import { AIChatService } from './application/ai-chat.service';
import { ChannelMessageMapper } from './channel-message.mapper';
import { ChannelMessageIpcHandlers } from './ipc/handlers';
import { LlmProviderModule } from '../llm-provider/llm-provider.module';

export class ChannelMessagingModule extends BaseModule {
  private channelMessageRepository!: ChannelMessageRepository;
  private channelMessageService!: ChannelMessageService;
  private channelMessageMapper!: ChannelMessageMapper;
  private channelMessageIpcHandlers!: ChannelMessageIpcHandlers;
  private aiChatService!: AIChatService;

  getName(): string {
    return 'channel-messaging';
  }

  getDependencies(): string[] {
    return ['llm-provider']; // Depends on LLM provider for AI services
  }

  protected async onInitialize(): Promise<void> {
    // Get dependencies from container
    const container = DependencyContainer.getInstance();
    const llmProviderModule = container.get<LlmProviderModule>('llm-provider');
    const aiService = llmProviderModule.getAIService();

    this.channelMessageRepository = new ChannelMessageRepository();
    this.channelMessageMapper = new ChannelMessageMapper();
    this.channelMessageService = new ChannelMessageService(
      this.channelMessageRepository,
      this.channelMessageMapper,
    );

    // Initialize AI Chat service with dependencies
    this.aiChatService = new AIChatService(this.channelMessageService, aiService);

    this.channelMessageIpcHandlers = new ChannelMessageIpcHandlers(
      this.channelMessageService,
      this.channelMessageMapper,
      this.aiChatService,
    );
  }

  protected onRegisterIpcHandlers(): void {
    this.channelMessageIpcHandlers.registerHandlers();
  }

  // Public getters for other modules
  getChannelMessageService(): ChannelMessageService {
    if (!this.isInitialized()) {
      throw new Error('ChannelMessagingModule must be initialized first');
    }
    return this.channelMessageService;
  }

  getAIChatService(): AIChatService {
    if (!this.isInitialized()) {
      throw new Error('ChannelMessagingModule must be initialized first');
    }
    return this.aiChatService;
  }
}