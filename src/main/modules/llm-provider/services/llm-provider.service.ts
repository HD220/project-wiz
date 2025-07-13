import { LlmProviderEntity } from "../entities/llm-provider.entity";
import { LlmProviderRepository, LlmProviderFilterOptions } from "../persistence/repository";
import {
  CreateLlmProviderData,
  UpdateLlmProviderData,
  LlmProviderData,
} from "../entities/llm-provider.schema";

export class LlmProviderService {
  constructor(private repository: LlmProviderRepository) {}

  async createLlmProvider(data: CreateLlmProviderData): Promise<LlmProviderData> {
    const llmProvider = new LlmProviderEntity(data);
    const saved = await this.repository.save(llmProvider.toPlainObject());
    return saved;
  }

  async listLlmProviders(filter?: LlmProviderFilterOptions): Promise<LlmProviderData[]> {
    return this.repository.findMany(filter);
  }

  async getLlmProviderById(data: { id: string }): Promise<LlmProviderData | null> {
    return this.repository.findById(data.id);
  }

  async updateLlmProvider(data: UpdateLlmProviderData): Promise<LlmProviderData> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("LlmProvider not found");
    }

    const llmProvider = new LlmProviderEntity(existing);

    if (data.name !== undefined) {
      llmProvider.updateName({ name: data.name });
    }
    if (data.apiKey !== undefined) {
      llmProvider.updateApiKey({ apiKey: data.apiKey });
    }

    return this.repository.update(llmProvider.toPlainObject());
  }

  async deleteLlmProvider(data: { id: string }): Promise<void> {
    await this.repository.delete(data.id);
  }
}
