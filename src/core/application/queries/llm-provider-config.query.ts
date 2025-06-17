import { Executable } from "@/core/common/executable";
import { error, ok, Result } from "@/shared/result";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.interface";

export class LLMProviderConfigQuery implements Executable<Input, Output> {
  constructor(
    private readonly llmProviderConfigRepository: ILLMProviderConfigRepository
  ) {}

  async execute(_: Input): Promise<Result<Output>> {
    try {
      const llmProviderConfigs = await this.llmProviderConfigRepository.list();

      return ok({
        data: llmProviderConfigs.map((llmProviderConfig) => ({
          id: llmProviderConfig.id.value,
          name: llmProviderConfig.name.value,
          apiKey: llmProviderConfig.apiKey.value,
          llmProviderId: llmProviderConfig.llmProvider.id.value,
          modelId: llmProviderConfig.model.id.value,
        })),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return error(errorMessage);
    }
  }
}

type Input = undefined;
type Output = {
  data: {
    id: string | number;
    name: string;
    apiKey: string;
    llmProviderId: string | number;
    modelId: string | number;
  }[];
};
