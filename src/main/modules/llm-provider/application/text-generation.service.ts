import { AIService } from "./ai-service";

import type { CoreMessage } from "ai";

export interface TextGenerationRequest {
  systemPrompt?: string;
  messages: CoreMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface TextGenerationConfig {
  llmProviderId: string;
}

export class TextGenerationService {
  constructor(private aiService: AIService) {}

  async generateText(
    config: TextGenerationConfig,
    request: TextGenerationRequest,
  ): Promise<string> {
    return this.aiService.generateResponse(
      {
        providerId: config.llmProviderId,
        systemPrompt: request.systemPrompt,
      },
      {
        messages: request.messages,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
      },
    );
  }

  async validateProvider(providerId: string): Promise<boolean> {
    return this.aiService.validateProvider(providerId);
  }

  clearProviderCache(providerId?: string): void {
    this.aiService.clearProviderCache(providerId);
  }
}
