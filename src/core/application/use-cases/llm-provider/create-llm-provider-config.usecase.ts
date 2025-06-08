import { Executable } from "@/core/common/executable";
import { error, ok, Result } from "@/shared/result";
import {
  LLMProviderConfigApiKey,
  LLMProviderConfigName,
} from "@/core/domain/entities/llm-provider-config/value-objects";
import { LLMProviderId } from "@/core/domain/entities/llm-provider/value-objects";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.interface";
import { ILLMProviderRepository } from "@/core/ports/repositories/llm-provider.interface";
import { LLMModelId } from "@/core/domain/entities/llm-model/value-objects";

export class CreateLLMProviderConfigUseCase
  implements
    Executable<
      CreateLLMProviderConfigUseCaseInput,
      CreateLLMProviderConfigUseCaseOutput
    >
{
  constructor(
    private readonly llmProviderRepository: ILLMProviderRepository,
    private readonly llmProviderConfigRepository: ILLMProviderConfigRepository
  ) {}

  async execute(
    data: CreateLLMProviderConfigUseCaseInput
  ): Promise<Result<CreateLLMProviderConfigUseCaseOutput>> {
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

      return ok({
        llmProviderConfigId: llmProviderConfig.id.value,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return error(errorMessage);
    }
  }
}

export type CreateLLMProviderConfigUseCaseInput = {
  name: string;
  apiKey: string;
  llmProviderId: string;
  modelId: string;
};

export type CreateLLMProviderConfigUseCaseOutput = {
  llmProviderConfigId: string | number;
};
