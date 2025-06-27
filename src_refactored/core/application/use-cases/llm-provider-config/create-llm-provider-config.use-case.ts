// src_refactored/core/application/use-cases/llm-provider-config/create-llm-provider-config.use-case.ts
import { ZodError } from 'zod';

import { IUseCase } from '@/application/common/ports/use-case.interface'; // Standardized to IUseCase

import { DomainError, ValueError } from '@/domain/common/errors'; // ValueError for VO creation issues
import {
  LLMProviderConfig,
  BaseUrl // BaseUrl is defined within llm-provider-config.entity.ts
} from '@/domain/llm-provider-config/llm-provider-config.entity';
import { ILLMProviderConfigRepository } from '@/domain/llm-provider-config/ports/llm-provider-config-repository.interface';
import { LLMApiKey } from '@/domain/llm-provider-config/value-objects/llm-api-key.vo';
import { LLMProviderConfigId } from '@/domain/llm-provider-config/value-objects/llm-provider-config-id.vo';
import { LLMProviderConfigName } from '@/domain/llm-provider-config/value-objects/llm-provider-config-name.vo';
import { LLMProviderId } from '@/domain/llm-provider-config/value-objects/llm-provider-id.vo';

import { Result, ok, error } from '@/shared/result';

import {
  CreateLLMProviderConfigUseCaseInput,
  CreateLLMProviderConfigUseCaseInputSchema,
  CreateLLMProviderConfigUseCaseOutput,
} from './create-llm-provider-config.schema';


export class CreateLLMProviderConfigUseCase
  implements
    IUseCase< // Changed Executable to IUseCase
      CreateLLMProviderConfigUseCaseInput,
      CreateLLMProviderConfigUseCaseOutput,
      DomainError | ZodError | ValueError
    >
{
  private llmProviderConfigRepository: ILLMProviderConfigRepository;

  constructor(llmProviderConfigRepository: ILLMProviderConfigRepository) {
    this.llmProviderConfigRepository = llmProviderConfigRepository;
  }

  async execute(
    input: CreateLLMProviderConfigUseCaseInput,
  ): Promise<Result<CreateLLMProviderConfigUseCaseOutput, DomainError | ZodError | ValueError>> {
    // 1. Validate Input Schema
    const validationResult = CreateLLMProviderConfigUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      // 2. Create Value Objects
      const nameVo = LLMProviderConfigName.create(validInput.name);
      const providerIdVo = LLMProviderId.create(validInput.providerId);
      const apiKeyVo = LLMApiKey.create(validInput.apiKey);

      let baseUrlVo: BaseUrl | undefined = undefined;
      if (validInput.baseUrl !== null && validInput.baseUrl !== undefined) {
        baseUrlVo = BaseUrl.create(validInput.baseUrl);
      }

      // 3. Create Entity
      const newConfigId = LLMProviderConfigId.generate();
      const llmConfigEntity = LLMProviderConfig.create({
        id: newConfigId,
        name: nameVo,
        providerId: providerIdVo,
        apiKey: apiKeyVo,
        baseUrl: baseUrlVo,
      });

      // 4. Save Entity
      const saveResult = await this.llmProviderConfigRepository.save(llmConfigEntity);
      if (saveResult.isError()) {
        // Assuming repository save method returns Result<void, DomainError>
        // or Result<LLMProviderConfig, DomainError>
        // For now, let's assume it's void for save.
        return error(new DomainError(`Failed to save LLM provider configuration: ${saveResult.value.message}`, saveResult.value));
      }

      // If save returns the entity, can use:
      // if (saveResult.isError()) return error(saveResult.value);
      // const savedEntity = saveResult.value;

      // 5. Return Output
      return ok({
        llmProviderConfigId: llmConfigEntity.id().value(),
      });

    } catch (err: any) {
      if (err instanceof ZodError) { // Should be caught by safeParse, but as a safeguard
        return error(err);
      }
      if (err instanceof DomainError || err instanceof ValueError) { // Catch errors from VO creation
        return error(err);
      }
      console.error('[CreateLLMProviderConfigUseCase] Unexpected error:', err);
      return error(
        new DomainError(
          `An unexpected error occurred while creating the LLM provider configuration: ${err.message || err}`,
        ),
      );
    }
  }
}
