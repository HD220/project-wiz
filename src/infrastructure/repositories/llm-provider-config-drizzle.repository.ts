import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.interface";
import {
  LLMProviderConfigConstructor,
  LLMProviderConfig,
} from "@/core/domain/entities/llm-provider-config";
import {
  LLMProviderConfigApiKey,
  LLMProviderConfigId,
  LLMProviderConfigName,
} from "@/core/domain/entities/llm-provider-config/value-objects";
import { llmProvidersConfig } from "../services/drizzle/schemas/llm-providers-config";
import { LLMProviderRepositoryDrizzle } from "./llm-provider-drizzle.repository";
import { LLMProviderId } from "@/core/domain/entities/llm-provider/value-objects";
import { eq } from "drizzle-orm";
import { LLMModelId } from "@/core/domain/entities/llm-model/value-objects";

export class LLMProviderConfigRepositoryDrizzle
  implements ILLMProviderConfigRepository
{
  constructor(
    private readonly db: BetterSQLite3Database<Record<string, never>>
  ) {}
  async create(
    props: Omit<LLMProviderConfigConstructor, "id">
  ): Promise<LLMProviderConfig> {
    const [inserted] = await this.db
      .insert(llmProvidersConfig)
      .values({
        name: props.name.value,
        providerId: `${props.llmProvider.id.value}`,
        modelId: `${props.model.id.value}`,
        apiKey: props.apiKey.value,
      })
      .returning();

    const providerRepository = new LLMProviderRepositoryDrizzle(this.db);
    const provider = await providerRepository.load(
      new LLMProviderId(inserted.providerId)
    );
    const model = provider.models.find(
      (model) => model.id.value === inserted.modelId
    );

    return new LLMProviderConfig({
      id: new LLMProviderConfigId(inserted.id),
      name: new LLMProviderConfigName(inserted.name),
      llmProvider: provider,
      model: model!,
      apiKey: new LLMProviderConfigApiKey(inserted.apiKey),
    });
  }

  async loadProvider(providerId: LLMProviderId, modelId: LLMModelId) {
    const providerRepository = new LLMProviderRepositoryDrizzle(this.db);
    const provider = await providerRepository.load(providerId);
    const model = provider.models.find(
      (model) => model.id.value === modelId.value
    );

    return { provider, model };
  }

  async load(id: LLMProviderConfigId): Promise<LLMProviderConfig> {
    const [selected] = await this.db
      .select()
      .from(llmProvidersConfig)
      .where(eq(llmProvidersConfig.id, `${id.value}`));

    const { provider, model } = await this.loadProvider(
      new LLMProviderId(selected.providerId),
      new LLMModelId(selected.modelId)
    );

    return new LLMProviderConfig({
      id: new LLMProviderConfigId(selected.id),
      name: new LLMProviderConfigName(selected.name),
      llmProvider: provider,
      model: model!,
      apiKey: new LLMProviderConfigApiKey(selected.apiKey),
    });
  }

  async save(entity: LLMProviderConfig): Promise<LLMProviderConfig> {
    const [updated] = await this.db
      .update(llmProvidersConfig)
      .set({
        name: entity.name.value,
        providerId: `${entity.llmProvider.id.value}`,
        modelId: `${entity.model.id.value}`,
        apiKey: entity.apiKey.value,
      })
      .where(eq(llmProvidersConfig.id, `${entity.id}`))
      .returning();

    const { provider, model } = await this.loadProvider(
      new LLMProviderId(updated.providerId),
      new LLMModelId(updated.modelId)
    );

    return new LLMProviderConfig({
      id: new LLMProviderConfigId(updated.id),
      name: new LLMProviderConfigName(updated.name),
      llmProvider: provider,
      model: model!,
      apiKey: new LLMProviderConfigApiKey(updated.apiKey),
    });
  }
  list(): Promise<LLMProviderConfig[]> {
    throw new Error("Method not implemented.");
  }
  delete(_id: LLMProviderConfigId): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
