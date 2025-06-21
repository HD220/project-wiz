import { Executable } from "@/core/common/executable";
import { error, ok, Result } from "@/shared/result";
import {
  CreateLLMProviderConfigUseCaseInput,
  CreateLLMProviderConfigUseCaseOutput,
  CreateLLMProviderConfigInputSchema,
} from "./create-llm-provider-config.schema"; // Import from new schema file
import { DomainError } from "@/core/common/errors";
import { LLMProvider } from "@/core/domain/entities/llm-provider"; // Import LLMProvider entity
import { LLMProviderId } from "@/core/domain/entities/llm-provider/value-objects";
import { LLMModel } from "@/core/domain/entities/llm-model"; // Import LLMModel entity
import { LLMModelId } from "@/core/domain/entities/llm-model/value-objects";
import { LLMProviderConfig } from "@/core/domain/entities/llm-provider-config"; // Import LLMProviderConfig entity
import {
  LLMProviderConfigId, // Import LLMProviderConfigId VO
  LLMProviderConfigName,
  LLMProviderConfigApiKey,
} from "@/core/domain/entities/llm-provider-config/value-objects";
import { ILLMProviderRepository } from "@/core/ports/repositories/llm-provider.interface"; // Corrected path
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.interface"; // Corrected path


export class CreateLLMProviderConfigUseCase
  implements
    Executable<
      CreateLLMProviderConfigUseCaseInput,
      Result<CreateLLMProviderConfigUseCaseOutput>
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
      const validationResult = CreateLLMProviderConfigInputSchema.safeParse(data);
      if (!validationResult.success) {
        return error(validationResult.error.flatten().fieldErrors as any); // Cast for simplicity
      }
      const validInput = validationResult.data;

      const llmProviderIdVo = LLMProviderId.create(validInput.llmProviderId);
      const modelIdVo = LLMModelId.create(validInput.modelId); // LLMModelId.create can take string

      const llmProviderResult = await this.llmProviderRepository.load(llmProviderIdVo);
      if (llmProviderResult.isError()) {
        return error(new DomainError(`Failed to load LLMProvider: ${llmProviderResult.message}`));
      }
      const llmProvider = llmProviderResult.value;
      if (!llmProvider) {
        return error(new DomainError(`LLMProvider not found: ${llmProviderIdVo.getValue()}`));
      }

      const model = llmProvider.getModelById(modelIdVo); // getModelById was refactored
      if (!model) {
        return error(
          new DomainError(
            `Model ${modelIdVo.getValue()} not found in provider ${llmProvider.id().getValue()}`
          )
        );
      }

      const nameVo = LLMProviderConfigName.create(validInput.name);
      const apiKeyVo = LLMProviderConfigApiKey.create(validInput.apiKey);
      const llmProviderConfigId = LLMProviderConfigId.create(); // Generates new ID

      const llmProviderConfig = LLMProviderConfig.create({ // Use static create method
        id: llmProviderConfigId,
        name: nameVo,
        llmProvider: llmProvider,
        model: model,
        apiKey: apiKeyVo,
      });

      // Assuming repository's save method.
      // The old code used .create on repository which might have been a factory method.
      // Now entity creation is separate.
      await this.llmProviderConfigRepository.save(llmProviderConfig);

      return ok({
        llmProviderConfigId: llmProviderConfig.id().getValue(), // Use id() and getValue()
      });
    } catch (err) {
      console.error("Error in CreateLLMProviderConfigUseCase:", err); // Log actual error
      const errorMessage = err instanceof Error ? err.message : String(err);
      return error(new DomainError(errorMessage));
    }
  }
}

// Removed local type CreateLLMProviderConfigUseCaseInput and CreateLLMProviderConfigUseCaseOutput
