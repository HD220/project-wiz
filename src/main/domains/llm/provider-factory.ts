import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { LanguageModel } from "ai";

import { LLMProvider } from "./entities";

export class ProviderFactory {
  static createLanguageModel(
    provider: LLMProvider,
    apiKey: string,
    model: string = "gpt-4o",
  ): LanguageModel {
    if (provider.isOpenAI()) {
      return this.createOpenAIModel(apiKey, model);
    }

    if (provider.isDeepSeek()) {
      return this.createDeepSeekModel(apiKey);
    }

    throw new Error(
      `Unsupported provider type: ${provider.getProviderType().getValue()}`,
    );
  }

  private static createOpenAIModel(
    apiKey: string,
    model: string,
  ): LanguageModel {
    const openaiProvider = createOpenAI({
      apiKey,
      baseURL: "https://api.openai.com/v1",
    });
    return openaiProvider(model);
  }

  private static createDeepSeekModel(apiKey: string): LanguageModel {
    const deepseekProvider = createDeepSeek({
      apiKey,
      baseURL: "https://api.deepseek.com",
    });
    return deepseekProvider("deepseek-chat");
  }
}
