// src_refactored/core/application/use-cases/llm-provider-config/create-llm-provider-config.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';

import { DomainError, ValueError } from '@/domain/common/errors';
import { LLMProviderConfig, BaseUrl } from '@/domain/llm-provider-config/llm-provider-config.entity';
import { ILLMProviderConfigRepository } from '@/domain/llm-provider-config/ports/llm-provider-config-repository.interface';
import { LLMApiKey } from '@/domain/llm-provider-config/value-objects/llm-api-key.vo';
import { LLMProviderConfigId } from '@/domain/llm-provider-config/value-objects/llm-provider-config-id.vo';
import { LLMProviderConfigName } from '@/domain/llm-provider-config/value-objects/llm-provider-config-name.vo';
import { LLMProviderId } from '@/domain/llm-provider-config/value-objects/llm-provider-id.vo';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types';

import { Result, ok, error as resultError, isError } from '@/shared/result';

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
      DomainError | ZodError | ValueError
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
  ): Promise<IUseCaseResponse<CreateLLMProviderConfigUseCaseOutput>> {
    const validInput = CreateLLMProviderConfigUseCaseInputSchema.parse(input);

    const nameVo = LLMProviderConfigName.create(validInput.name);
    const providerIdVo = LLMProviderId.create(validInput.providerId);
    const apiKeyVo = validInput.apiKey ? LLMApiKey.create(validInput.apiKey) : undefined;

    let baseUrlVo: BaseUrl | undefined;
    if (validInput.baseUrl && typeof validInput.baseUrl === 'string') {
      baseUrlVo = BaseUrl.create(validInput.baseUrl);
    }

    const configIdVo = LLMProviderConfigId.generate();

    const configEntity = LLMProviderConfig.create({
      id: configIdVo,
      name: nameVo,
      providerId: providerIdVo,
      apiKey: apiKeyVo,
      baseUrl: baseUrlVo,
    });

    const savedConfig = await this.configRepository.save(configEntity);

    return successUseCaseResponse({
      llmProviderConfigId: savedConfig.id.value,
    });
  }
}
