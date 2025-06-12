import { Executable } from "@/core/common/executable";
import { NOK, OK, Result } from "@/shared/result";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.interface";

export class LLMProviderConfigQuery implements Executable<Input, Output> {
  constructor(
    private readonly llmProviderConfigRepository: ILLMProviderConfigRepository
  ) {}

  async execute(data: Input): Promise<Result<Output>> {
    try {
      const llmProviderConfigs = await this.llmProviderConfigRepository.list();

      return OK({
        data: llmProviderConfigs.map((llmProviderConfig) => ({
          id: llmProviderConfig.id.value,
          name: llmProviderConfig.name.value,
          apiKey: llmProviderConfig.apiKey.value,
          llmProviderId: llmProviderConfig.llmProvider.id.value,
          modelId: llmProviderConfig.model.id.value,
        })),
      });
    } catch (error) {
      return NOK(error as Error);
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
