import {
  LLMProviderConstructor,
  LLMProvider,
} from "@/core/domain/entities/llm-provider";
import {
  LLMProviderId,
  LLMProviderName,
  LLMProviderSlug,
} from "@/core/domain/entities/llm-provider/value-objects";
import { ILLMProviderRepository } from "@/core/ports/repositories/llm-provider.interface";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { llmProviders } from "../services/drizzle/schemas/llm-providers";
import { llmModels } from "../services/drizzle/schemas/llm-models";
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
  async load(id: LLMProviderId): Promise<LLMProvider> {
    const [provider] = await this.db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.id, `${id.value}`));

    const modelsData = await this.db
      .select()
      .from(llmModels)
      .where(eq(llmModels.llmProviderId, provider.id));

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
  }
  save(entity: LLMProvider): Promise<LLMProvider> {
    throw new Error("Method not implemented.");
  }
  async list(): Promise<LLMProvider[]> {
    const providersData = await this.db.select().from(llmProviders);

    const providers = providersData.map(async (provider) => {
      const modelsData = await this.db
        .select()
        .from(llmModels)
        .where(eq(llmModels.llmProviderId, provider.id));
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
