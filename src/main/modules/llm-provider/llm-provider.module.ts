import { BaseModule } from "../../kernel/base-module";

import { AIService } from "./application/ai-service";
import { LlmProviderService } from "./application/llm-provider.service";
import { LlmProviderIpcHandlers } from "./ipc/handlers";
import { LlmProviderMapper } from "./llm-provider.mapper";
import { LlmProviderRepository } from "./persistence/llm-provider.repository";

export class LlmProviderModule extends BaseModule {
  private llmProviderRepository!: LlmProviderRepository;
  private llmProviderService!: LlmProviderService;
  private llmProviderMapper!: LlmProviderMapper;
  private llmProviderIpcHandlers!: LlmProviderIpcHandlers;
  private aiService!: AIService;

  getName(): string {
    return "llm-provider";
  }

  getDependencies(): string[] {
    return []; // No dependencies
  }

  protected async onInitialize(): Promise<void> {
    this.llmProviderRepository = new LlmProviderRepository();
    this.llmProviderMapper = new LlmProviderMapper();
    this.llmProviderService = new LlmProviderService(
      this.llmProviderRepository,
      this.llmProviderMapper,
    );
    this.llmProviderIpcHandlers = new LlmProviderIpcHandlers(
      this.llmProviderService,
      this.llmProviderMapper,
    );

    // Initialize AI Service that depends on LLM provider service
    this.aiService = new AIService(this.llmProviderService);
  }

  protected onRegisterIpcHandlers(): void {
    this.llmProviderIpcHandlers.registerHandlers();
  }

  // Public getters for other modules
  getLlmProviderService(): LlmProviderService {
    if (!this.isInitialized()) {
      throw new Error("LlmProviderModule must be initialized first");
    }
    return this.llmProviderService;
  }

  getAIService(): AIService {
    if (!this.isInitialized()) {
      throw new Error("LlmProviderModule must be initialized first");
    }
    return this.aiService;
  }
}
