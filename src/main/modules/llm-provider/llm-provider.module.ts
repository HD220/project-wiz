import { BaseModule } from "../../kernel/base-module";

import { AIService } from "./application/ai-service";
import { LlmProviderIpcHandlers } from "./ipc/handlers";

export class LlmProviderModule extends BaseModule {
  private llmProviderIpcHandlers!: LlmProviderIpcHandlers;
  private aiService!: AIService;

  getName(): string {
    return "llm-provider";
  }

  getDependencies(): string[] {
    return []; // No dependencies
  }

  protected async onInitialize(): Promise<void> {
    this.llmProviderIpcHandlers = new LlmProviderIpcHandlers();
    this.aiService = new AIService();
  }

  protected onRegisterIpcHandlers(): void {
    this.llmProviderIpcHandlers.registerHandlers();
  }

  // Public getters for other modules
  getAIService(): AIService {
    if (!this.isInitialized()) {
      throw new Error("LlmProviderModule must be initialized first");
    }
    return this.aiService;
  }
}
