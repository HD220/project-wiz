import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import { LlmProviderService } from "@/main/features/agent/llm-provider/llm-provider.service";

export class LLMService {
  /**
   * Get configured model for user
   * @param userId User ID
   * @param providerId Optional specific provider ID (uses default if not provided)
   * @param modelName Optional model name (uses provider default if not provided)
   * @returns AI SDK model instance
   */
  static async getModel(
    userId: string,
    providerId?: string,
    modelName?: string,
  ) {
    // 1. Get provider config
    const provider = await this.getProviderConfig(userId, providerId);
    const apiKey = await LlmProviderService.getDecryptedApiKey(provider.id);
    const model = modelName || provider.defaultModel;

    // 2. Create model based on type
    switch (provider.type) {
      case "openai": {
        const openaiProvider = createOpenAI({
          apiKey,
          baseURL: provider.baseUrl || undefined,
        });
        return openaiProvider(model);
      }

      case "anthropic": {
        const anthropicProvider = createAnthropic({
          apiKey,
          baseURL: provider.baseUrl || undefined,
        });
        return anthropicProvider(model);
      }

      case "deepseek":
      case "google":
      case "custom":
      default: {
        // Use OpenAI-compatible for everything else
        const customProvider = createOpenAICompatible({
          name: provider.type,
          baseURL: provider.baseUrl || "https://api.openai.com/v1",
          apiKey,
        });
        return customProvider(model);
      }
    }
  }

  /**
   * Get provider configuration for user
   * @param userId User ID
   * @param providerId Optional provider ID (gets default if not provided)
   * @returns Provider configuration
   */
  private static async getProviderConfig(userId: string, providerId?: string) {
    if (providerId) {
      // Get specific provider
      const provider = await LlmProviderService.findById(providerId);
      if (!provider || provider.userId !== userId) {
        throw new Error("Provider not found or access denied");
      }
      return provider;
    }

    // Get default provider for user
    const defaultProvider = await LlmProviderService.getDefaultProvider(userId);
    if (!defaultProvider) {
      throw new Error("No default provider configured for user");
    }

    return defaultProvider;
  }

  /**
   * Get user's default provider
   * @param userId User ID
   * @returns Default provider ID
   */
  static async getUserDefaultProviderId(userId: string): Promise<string> {
    const provider = await LlmProviderService.getDefaultProvider(userId);
    if (!provider) {
      throw new Error("No default provider configured for user");
    }
    return provider.id;
  }
}
