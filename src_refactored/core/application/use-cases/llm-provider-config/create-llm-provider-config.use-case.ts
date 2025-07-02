// src_refactored/core/application/use-cases/llm-provider-config/create-llm-provider-config.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';

import { DomainError, ValueError } from '@/domain/common/errors'; // Added ValueError
// Import BaseUrl along with LLMProviderConfig
import { LLMProviderConfig, BaseUrl } from '@/domain/llm-provider-config/llm-provider-config.entity';
import { ILLMProviderConfigRepository } from '@/domain/llm-provider-config/ports/llm-provider-config-repository.interface';
import { LLMApiKey } from '@/domain/llm-provider-config/value-objects/llm-api-key.vo';
import { LLMProviderConfigId } from '@/domain/llm-provider-config/value-objects/llm-provider-config-id.vo';
import { LLMProviderConfigName } from '@/domain/llm-provider-config/value-objects/llm-provider-config-name.vo';
import { LLMProviderId } from '@/domain/llm-provider-config/value-objects/llm-provider-id.vo';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types';

import { Result, ok, error as resultError, isError } from '@/shared/result'; // Added isError

import {
  CreateLLMProviderConfigUseCaseInput,
  CreateLLMProviderConfigUseCaseInputSchema,
  CreateLLMProviderConfigUseCaseOutput,
} from './create-llm-provider-config.schema';

@injectable()
export class CreateLLMProviderConfigUseCase
  implements
    Executable<
      CreateLLMProviderConfigUseCaseInput,
      CreateLLMProviderConfigUseCaseOutput,
      DomainError | ZodError | ValueError // Added ValueError
    >
{
  constructor(
    @inject(TYPES.ILLMProviderConfigRepository)
    private readonly configRepository: ILLMProviderConfigRepository,
    @inject(LOGGER_INTERFACE_TYPE)
    private readonly logger: ILogger,
  ) {}

  async execute(
    input: CreateLLMProviderConfigUseCaseInput,
  ): Promise<Result<CreateLLMProviderConfigUseCaseOutput, DomainError | ZodError | ValueError>> {
    const validationResult = CreateLLMProviderConfigUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return resultError(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      // These VO creations can throw ValueError
      const nameVo = LLMProviderConfigName.create(validInput.name);
      const providerIdVo = LLMProviderId.create(validInput.providerId);
      // apiKey and baseUrl are optional in input, but required by VOs if provided.
      // LLMApiKey and BaseUrl VOs should handle null/undefined if that's a valid state,
      // or the entity should handle optional VOs.
      // For now, let's assume they are created only if present in input.
      const apiKeyVo = validInput.apiKey ? LLMApiKey.create(validInput.apiKey) : undefined;

      let baseUrlVo: BaseUrl | undefined;
      if (validInput.baseUrl && typeof validInput.baseUrl === 'string') {
        // BaseUrl.create will throw if the URL is invalid. This is caught by the try-catch block.
        baseUrlVo = BaseUrl.create(validInput.baseUrl);
      }
      // If validInput.baseUrl is null or undefined, baseUrlVo remains undefined, which is correct for the entity.

      const configIdVo = LLMProviderConfigId.generate();

      const configEntity = LLMProviderConfig.create({
        id: configIdVo,
        name: nameVo,
        providerId: providerIdVo,
        apiKey: apiKeyVo,
        baseUrl: baseUrlVo, // Pass the VO or undefined
        // other optional props from schema like models, parameters, etc.
      });

      const saveResult = await this.configRepository.save(configEntity);
      if (isError(saveResult)) {
        const err = saveResult.error instanceof DomainError ? saveResult.error : new DomainError(`Failed to save LLM config: ${saveResult.error.message}`, saveResult.error);
        this.logger.error(
          `[CreateLLMProviderConfigUseCase] Repository error: ${err.message}`,
          { error: saveResult.error, useCase: 'CreateLLMProviderConfigUseCase', input: validInput }
        );
        return resultError(err);
      }

      // Ensure the output matches CreateLLMProviderConfigUseCaseOutput
      return ok({
        llmProviderConfigId: configEntity.id().value(),
      });
    } catch (e: unknown) {
      if (e instanceof ValueError || (e instanceof DomainError && !(e instanceof ZodError))) {
        this.logger.warn(
          `[CreateLLMProviderConfigUseCase] Value/Domain error: ${e.message}`,
          { error: e, useCase: 'CreateLLMProviderConfigUseCase', input: validInput }
        );
        return resultError(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      const logError = e instanceof Error ? e : new Error(message);
      this.logger.error(
        `[CreateLLMProviderConfigUseCase] Unexpected error: ${message}`,
        { error: logError, useCase: 'CreateLLMProviderConfigUseCase', input: validInput }
      );
      // Wrap in DomainError if not already a ZodError (which is a DomainError)
      if (e instanceof ZodError) {
          return resultError(e);
      }
      return resultError(new DomainError(`Unexpected error creating LLM config: ${message}`, logError));
    }
  }
}
