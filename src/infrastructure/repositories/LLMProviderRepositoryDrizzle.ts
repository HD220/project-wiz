import {
  LLMProviderConstructor,
  LLMProvider,
} from "@/core/domain/entities/llm-provider";
import {
  LLMProviderId,
  LLMProviderName,
  LLMProviderSlug,
} from "@/core/domain/entities/llm-provider/value-objects";
import { ILLMProviderRepository } from "@/core/ports/repositories/llm-provider.repository";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { llmProvidersTable } from "../services/drizzle/schemas/llm-providers";
import { llmModelsTable } from "../services/drizzle/schemas/llm-models";
import { LLMModel } from "@/core/domain/entities/llm-model";
import {
  LLMModelId,
  LLMModelName,
  LLMModelSlug,
} from "@/core/domain/entities/llm-model/value-objects";

export class LLMProviderRepositoryDrizzle implements ILLMProviderRepository {
  constructor(
    private readonly db: BetterSQLite3Database<Record<string, never>>
  ) {}
  create(props: Omit<LLMProviderConstructor, "id">): Promise<LLMProvider> {
    throw new Error("Method not implemented.");
  }
  load(id: LLMProviderId): Promise<LLMProvider> {
    throw new Error("Method not implemented.");
  }
  save(entity: LLMProvider): Promise<LLMProviderId> {
    throw new Error("Method not implemented.");
  }
  async list(): Promise<LLMProvider[]> {
    const providersData = await this.db.select().from(llmProvidersTable);

    const providers = providersData.map(async (provider) => {
      const modelsData = await this.db
        .select()
        .from(llmModelsTable)
        .where(eq(llmModelsTable.llmProviderId, provider.id));
      const models = modelsData.map((model) => {
        return new LLMModel({
          id: new LLMModelId(model.id),
          name: new LLMModelName(model.name),
          slug: new LLMModelSlug(model.slug),
        });
      });
      return new LLMProvider({
        id: new LLMProviderId(provider.id),
        name: new LLMProviderName(provider.name),
        slug: new LLMProviderSlug(provider.slug),
        models,
      });
    });

    return await Promise.all(providers);
  }
  delete(id: LLMProviderId): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
