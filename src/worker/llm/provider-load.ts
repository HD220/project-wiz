import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("worker-provider-loader");

export function loadProvider(provider: string, model: string, apiKey: string) {
  logger.debug("🔥 [ProviderLoader] Loading provider:", { provider, model, hasApiKey: !!apiKey });
  
  switch (provider.toLowerCase()) {
    case "anthropic":
      const anthropic = createAnthropic({
        apiKey: apiKey
      });
      return anthropic(model);

    case "openai":
      const openai = createOpenAI({
        apiKey: apiKey
      });
      return openai(model);

    case "gemini":
      const google = createGoogleGenerativeAI({
        apiKey: apiKey
      });
      return google(model);

    case "deepseek":
      logger.debug("🔥 [ProviderLoader] Creating DeepSeek provider instance");
      const deepseek = createDeepSeek({
        apiKey: apiKey
      });
      const modelInstance = deepseek(model);
      logger.debug("🔥 [ProviderLoader] DeepSeek model instance created");
      return modelInstance;

    default:
      throw new Error(`Unsupported provider: ${provider}. Supported providers: anthropic, openai, gemini, deepseek`);
  }
}