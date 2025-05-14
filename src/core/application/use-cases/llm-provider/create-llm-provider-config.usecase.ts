import { Executable } from "@/core/common/executable";
import { NOK, OK, Result } from "@/core/common/result";
import {
  LLMProviderConfigApiKey,
  LLMProviderConfigName,
} from "@/core/domain/entities/llm-provider-config/value-objects";
import { LLMProviderId } from "@/core/domain/entities/llm-provider/value-objects";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.repository";
import { ILLMProviderRepository } from "@/core/ports/repositories/llm-provider.repository";
import { LLMModelId } from "@/core/domain/entities/llm-model/value-objects";

export class CreateLLMProviderConfigUseCase
  implements Executable<Input, Output>
{
  constructor(
    private readonly llmProviderRepository: ILLMProviderRepository,
    private readonly llmProviderConfigRepository: ILLMProviderConfigRepository
  ) {}

  async execute(data: Input): Promise<Result<Output>> {
    try {
      const { name, apiKey, modelId, llmProviderId } = data;

      const llmProvider = await this.llmProviderRepository.load(
        new LLMProviderId(llmProviderId)
      );

      const llmProviderConfig = await this.llmProviderConfigRepository.create({
        name: new LLMProviderConfigName(name),
        apiKey: new LLMProviderConfigApiKey(apiKey),
        llmProvider,
        model: llmProvider.getModelById(new LLMModelId(modelId)),
      });

      return OK({
        llmProviderConfigId: llmProviderConfig.id.value,
      });
    } catch (error) {
      return NOK(error as Error);
    }
  }
}

type Input = {
  name: string;
  apiKey: string;
  llmProviderId: string;
  modelId: string;
};

type Output = {
  llmProviderConfigId: string | number;
};
