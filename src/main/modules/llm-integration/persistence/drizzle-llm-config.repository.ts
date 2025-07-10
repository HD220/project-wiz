import { eq, and } from "drizzle-orm";

import { db } from "@/main/persistence/db";
import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";
import { ILlmConfigRepository } from "@/main/modules/llm-integration/domain/llm-config.repository";

import { llmConfigs } from "./schema";

export class DrizzleLlmConfigRepository implements ILlmConfigRepository {
  async save(config: LlmConfig): Promise<LlmConfig> {
    try {
      await db
        .insert(llmConfigs)
        .values({
          id: config.id,
          provider: config.provider,
          model: config.model,
          apiKey: config.apiKey,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        })
        .onConflictDoUpdate({
          target: llmConfigs.id,
          set: {
            provider: config.provider,
            model: config.model,
            apiKey: config.apiKey,
            temperature: config.temperature,
            maxTokens: config.maxTokens,
          },
        });
      return config;
    } catch (error: unknown) {
      console.error("Failed to save LLM config:", error);
      throw new Error(`Failed to save LLM config: ${(error as Error).message}`);
    }
  }

  async findById(id: string): Promise<LlmConfig | undefined> {
    try {
      const result = await db
        .select()
        .from(llmConfigs)
        .where(eq(llmConfigs.id, id))
        .limit(1);
      if (result.length === 0) {
        return undefined;
      }
      const configData = result[0];
      return new LlmConfig(
        {
          provider: configData.provider,
          model: configData.model,
          apiKey: configData.apiKey,
          temperature: configData.temperature,
          maxTokens: configData.maxTokens,
        },
        configData.id,
      );
    } catch (error: unknown) {
      console.error(`Failed to find LLM config by ID ${id}:`, error);
      throw new Error(
        `Failed to find LLM config by ID: ${(error as Error).message}`,
      );
    }
  }

  async findByProviderAndModel(
    provider: string,
    model: string,
  ): Promise<LlmConfig | undefined> {
    try {
      const result = await db
        .select()
        .from(llmConfigs)
        .where(
          and(eq(llmConfigs.provider, provider), eq(llmConfigs.model, model)),
        )
        .limit(1);

      if (result.length === 0) {
        return undefined;
      }
      const configData = result[0];
      return new LlmConfig(
        {
          provider: configData.provider,
          model: configData.model,
          apiKey: configData.apiKey,
          temperature: configData.temperature,
          maxTokens: configData.maxTokens,
        },
        configData.id,
      );
    } catch (error: unknown) {
      console.error(
        `Failed to find LLM config by provider ${provider} and model ${model}:`,
        error,
      );
      throw new Error(
        `Failed to find LLM config by provider and model: ${(error as Error).message}`,
      );
    }
  }

  async findAll(): Promise<LlmConfig[]> {
    try {
      const results = await db.select().from(llmConfigs);
      return results.map(
        (data) =>
          new LlmConfig(
            {
              provider: data.provider,
              model: data.model,
              apiKey: data.apiKey,
              temperature: data.temperature,
              maxTokens: data.maxTokens,
            },
            data.id,
          ),
      );
    } catch (error: unknown) {
      console.error("Failed to find all LLM configs:", error);
      throw new Error(
        `Failed to find all LLM configs: ${(error as Error).message}`,
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(llmConfigs)
        .where(eq(llmConfigs.id, id))
        .returning({ id: llmConfigs.id });
      return result.length > 0;
    } catch (error: unknown) {
      console.error(`Failed to delete LLM config with ID ${id}:`, error);
      throw new Error(
        `Failed to delete LLM config: ${(error as Error).message}`,
      );
    }
  }
}
