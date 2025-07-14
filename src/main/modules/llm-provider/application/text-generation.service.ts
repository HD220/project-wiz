import { createOpenAI } from "@ai-sdk/openai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";
import type { CoreMessage, LanguageModel } from "ai";
import { LlmProviderService } from "./llm-provider.service";

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
  private providerRegistry: Map<string, LanguageModel> = new Map();

  constructor(private llmProviderService: LlmProviderService) {}

  async generateText(
    config: TextGenerationConfig,
    request: TextGenerationRequest,
  ): Promise<string> {
    const languageModel = await this.getOrInitializeProvider(
      config.llmProviderId,
    );

    const messages: CoreMessage[] = [];

    // Add system message if provided
    if (request.systemPrompt) {
      messages.push({
        role: "system",
        content: request.systemPrompt,
      });
    }

    // Add conversation messages
    messages.push(...request.messages);

    const result = await generateText({
      model: languageModel,
      messages,
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 1000,
    });

    return result.text;
  }

  private async getOrInitializeProvider(
    providerId: string,
  ): Promise<LanguageModel> {
    // Check if provider is already initialized
    if (this.providerRegistry.has(providerId)) {
      return this.providerRegistry.get(providerId)!;
    }

    // Get provider configuration from database
    let llmProvider = await this.llmProviderService.getLlmProviderById(providerId);
    
    // If provider not found or is invalid, try to use default provider
    if (!llmProvider || providerId === "default" || !providerId || providerId.trim() === "") {
      console.log(`[TextGenerationService] Provider '${providerId}' not found or invalid, trying default provider...`);
      llmProvider = await this.llmProviderService.getDefaultProvider();
      
      if (!llmProvider) {
        throw new Error("Nenhum provedor LLM configurado. Configure um provedor LLM e defina-o como padrão.");
      }
      
      console.log(`[TextGenerationService] Using default provider: ${llmProvider.name} (${llmProvider.id})`);
      
      // Use the default provider ID for caching
      providerId = llmProvider.id;
      
      // Check if default provider is already cached
      if (this.providerRegistry.has(providerId)) {
        return this.providerRegistry.get(providerId)!;
      }
    }

    // Create the appropriate provider based on configuration
    const languageModel = await this.createLanguageModel(llmProvider);

    // Cache the provider
    this.providerRegistry.set(providerId, languageModel);

    return languageModel;
  }

  private async createLanguageModel(llmProvider: any): Promise<LanguageModel> {
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

  async validateProvider(providerId: string): Promise<boolean> {
    try {
      const result = await this.generateText(
        { llmProviderId: providerId },
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

  clearProviderCache(providerId?: string): void {
    if (providerId) {
      this.providerRegistry.delete(providerId);
    } else {
      this.providerRegistry.clear();
    }
  }
}
