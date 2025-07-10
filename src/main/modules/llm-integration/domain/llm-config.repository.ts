import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";

export interface ILlmConfigRepository {
  save(config: LlmConfig): Promise<LlmConfig>;
  findById(id: string): Promise<LlmConfig | undefined>;
  findByProviderAndModel(
    provider: string,
    model: string,
  ): Promise<LlmConfig | undefined>;
  findAll(): Promise<LlmConfig[]>;
  delete(id: string): Promise<boolean>;
}
