import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { LanguageModel } from "ai";

import { getLogger } from "../../infrastructure/logger";

import { LLMProvider } from "./entities";
import { ProviderType } from "./value-objects";

const logger = getLogger("provider.registry");

export class ProviderRegistry {
  constructor() {
    this.providers = new Map();
  }

  private providers: Map<string, LanguageModel>;

  registerProvider(
    id: string,
    provider: LLMProvider,
    apiKey: string,
    model: string = "gpt-4o",
  ): void {
    const languageModel = this.createLanguageModel(provider, apiKey, model);
    this.providers.set(id, languageModel);

    logger.info("Provider registered", {
      providerId: id,
      type: provider.getProviderType().getValue(),
    });
  }

  getProvider(id: string): LanguageModel | null {
    return this.providers.get(id) || null;
  }

  hasProvider(id: string): boolean {
    return this.providers.has(id);
  }

  clearProviders(): void {
    this.providers.clear();
    logger.info("All providers cleared");
  }

  private createLanguageModel(
    provider: LLMProvider,
    apiKey: string,
    model: string = "gpt-4o",
  ): LanguageModel {
    if (provider.isOpenAI()) {
      const openaiProvider = createOpenAI({
        apiKey,
        baseURL: "https://api.openai.com/v1",
      });
      return openaiProvider(model);
    }

    if (provider.isDeepSeek()) {
      const deepseekProvider = createDeepSeek({
        apiKey,
        baseURL: "https://api.deepseek.com",
      });
      return deepseekProvider("deepseek-chat");
    }

    throw new Error(
      `Unsupported provider type: ${provider.getProviderType().getValue()}`,
    );
  }

  getRegisteredProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }
}
