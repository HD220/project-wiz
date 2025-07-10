import { eq, and } from "drizzle-orm";
import { ApplicationError } from "@/main/errors/application.error";

import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";
import type { ILlmConfigRepository } from "@/main/modules/llm-integration/domain/llm-config.repository";
import { BaseRepository } from "@/main/persistence/base.repository";
import type { NodeSQLiteDatabase } from 'drizzle-orm/node-sqlite';
import type { InferSelectModel } from 'drizzle-orm/sqlite-core';

import { llmConfigs } from "./schema";

export class DrizzleLlmConfigRepository extends BaseRepository<LlmConfig, typeof llmConfigs> implements ILlmConfigRepository {
  constructor(db: NodeSQLiteDatabase<any>) {
    super(db, llmConfigs);
  }

  protected mapToDomainEntity(row: InferSelectModel<typeof llmConfigs>): LlmConfig {
    return new LlmConfig(
      {
        provider: row.provider,
        model: row.model,
        apiKey: row.apiKey,
        temperature: row.temperature,
        maxTokens: row.maxTokens,
      },
      row.id,
    );
  }

  async findByProviderAndModel(
    provider: string,
    model: string,
  ): Promise<LlmConfig | undefined> {
    try {
      const [result] = await this.db
        .select()
        .from(llmConfigs)
        .where(
          and(eq(llmConfigs.provider, provider), eq(llmConfigs.model, model)),
        )
        .limit(1);

      return result ? this.mapToDomainEntity(result) : undefined;
    } catch (error: unknown) {
      console.error(
        `Failed to find LLM config by provider ${provider} and model ${model}:`,
        error,
      );
      throw new ApplicationError(
        `Failed to find LLM config by provider and model: ${(error as Error).message}`,
      );
    }
  }
}
