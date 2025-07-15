import { generateText, CoreMessage } from "ai";
import { eq } from "drizzle-orm";

import { getDatabase } from "../../infrastructure/database";
import { getLogger } from "../../infrastructure/logger";
import { llmProviders } from "../../persistence/schemas";

import { LLMProvider } from "./entities";
import { ProviderRegistry } from "./provider.registry";
import {
  ProviderType,
  Temperature,
  MaxTokens,
  ModelConfig,
} from "./value-objects";

const logger = getLogger("text-generation.service");

export class TextGenerationService {
  constructor() {
    this.registry = new ProviderRegistry();
  }

  private readonly registry: ProviderRegistry;

  async generateText(
    providerId: string,
    messages: CoreMessage[],
    systemPrompt?: string,
  ): Promise<string> {
    await this.getOrInitializeProvider(providerId);
    const model = this.registry.getProvider(providerId);

    if (!model) {
      throw new Error(`Provider ${providerId} not available`);
    }

    const allMessages: CoreMessage[] = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : messages;

    const result = await generateText({
      model,
      messages: allMessages,
    });

    logger.info("Text generated", {
      providerId,
      messageCount: allMessages.length,
      responseLength: result.text.length,
    });

    return result.text;
  }

  async getDefaultProvider(): Promise<string | null> {
    const db = getDatabase();

    const [defaultProvider] = await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.isDefault, true))
      .limit(1);

    return defaultProvider?.id || null;
  }

  private async getOrInitializeProvider(
    providerId: string,
  ): Promise<LLMProvider> {
    if (this.registry.hasProvider(providerId)) {
      return this.createProviderFromId(providerId);
    }

    await this.initializeProvider(providerId);
    return this.createProviderFromId(providerId);
  }

  private async initializeProvider(providerId: string): Promise<void> {
    const db = getDatabase();

    const [providerData] = await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.id, providerId));

    if (!providerData) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const providerType = new ProviderType(
      providerData.provider as "openai" | "deepseek",
    );
    const modelConfig = new ModelConfig(
      new Temperature(0.7),
      new MaxTokens(1000),
    );

    const provider = new LLMProvider(providerType, modelConfig);

    this.registry.registerProvider(
      providerId,
      provider,
      providerData.apiKey,
      providerData.model,
    );
  }

  private createProviderFromId(_providerId: string): LLMProvider {
    const providerType = new ProviderType("openai");
    const modelConfig = new ModelConfig(
      new Temperature(0.7),
      new MaxTokens(1000),
    );

    return new LLMProvider(providerType, modelConfig);
  }
}
