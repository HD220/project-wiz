import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

import { LlmProviderService } from "./llm-provider.service";

import type { LlmProvider } from "../domain/llm-provider.entity";
import type { CoreMessage, LanguageModel } from "ai";

interface AIServiceConfig {
  providerId: string;
  systemPrompt?: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GenerateTextOptions {
  messages: CoreMessage[];
  temperature?: number;
  maxTokens?: number;
}

export class AIService {
  private providerRegistry: Map<string, LanguageModel> = new Map();

  constructor(private llmProviderService: LlmProviderService) {}

  async initializeProvider(providerId: string): Promise<LanguageModel> {
    // Check if provider is already initialized
    if (this.providerRegistry.has(providerId)) {
      return this.providerRegistry.get(providerId)!;
    }

    // Get provider configuration from database
    const llmProvider =
      await this.llmProviderService.getLlmProviderById(providerId);
    if (!llmProvider) {
      throw new Error(`LLM Provider with ID ${providerId} not found`);
    }

    // Create the appropriate provider based on configuration
    const languageModel = await this.createLanguageModel(llmProvider);

    // Cache the provider
    this.providerRegistry.set(providerId, languageModel);

    return languageModel;
  }

  private async createLanguageModel(
    llmProvider: LlmProvider,
  ): Promise<LanguageModel> {
    // Get decrypted API key
    const decryptedApiKey = await this.llmProviderService.getDecryptedApiKey(
      llmProvider.id,
    );

    switch (llmProvider.provider.toLowerCase()) {
      case "openai": {
        const openai = createOpenAI({
          apiKey: decryptedApiKey,
          baseURL: "https://api.openai.com/v1",
        });
        return openai(llmProvider.model);
      }

      case "deepseek": {
        const deepseek = createDeepSeek({
          apiKey: decryptedApiKey,
          baseURL: "https://api.deepseek.com",
        });
        return deepseek(llmProvider.model);
      }

      default: {
        throw new Error(`Unsupported provider: ${llmProvider.provider}`);
      }
    }
  }

  async generateResponse(
    config: AIServiceConfig,
    options: GenerateTextOptions,
  ): Promise<string> {
    const languageModel = await this.initializeProvider(config.providerId);

    const messages: CoreMessage[] = [];

    // Add system message if provided
    if (config.systemPrompt) {
      messages.push({
        role: "system",
        content: config.systemPrompt,
      });
    }

    // Add user messages
    messages.push(...options.messages);

    const result = await generateText({
      model: languageModel,
      messages,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 1000,
    });

    return result.text;
  }

  // Get all available providers for frontend
  async getAvailableProviders(): Promise<LlmProvider[]> {
    return this.llmProviderService.listLlmProviders();
  }

  // Clear cached providers (useful for updates)
  clearProviderCache(providerId?: string): void {
    if (providerId) {
      this.providerRegistry.delete(providerId);
    } else {
      this.providerRegistry.clear();
    }
  }

  // Validate provider connection
  async validateProvider(providerId: string): Promise<boolean> {
    try {
      const result = await this.generateResponse(
        { providerId },
        {
          messages: [{ role: "user", content: "Hello" }],
          maxTokens: 10,
        },
      );
      return typeof result === "string" && result.length > 0;
    } catch (error) {
      console.error(`Failed to validate provider ${providerId}:`, error);
      return false;
    }
  }
}
