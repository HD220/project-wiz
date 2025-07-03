import { injectable, inject } from "inversify";

import { LLM_PROVIDER_CONFIG_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { LLMProviderConfig } from '@/core/domain/llm-provider-config/llm-provider-config.entity';
import { ILLMProviderConfigRepository } from "@/core/domain/llm-provider-config/ports/llm-provider-config-repository.interface";
import { BaseUrl } from "@/core/domain/llm-provider-config/value-objects/base-url.vo";
import { LLMApiKey } from "@/core/domain/llm-provider-config/value-objects/llm-api-key.vo";
import { LLMProviderConfigId } from "@/core/domain/llm-provider-config/value-objects/llm-provider-config-id.vo";
import { LLMProviderConfigName } from "@/core/domain/llm-provider-config/value-objects/llm-provider-config-name.vo";
import { LLMProviderId } from "@/core/domain/llm-provider-config/value-objects/llm-provider-id.vo";

import {
  IUseCaseResponse,
  successUseCaseResponse,
} from "@/shared/application/use-case-response.dto";



import {
  CreateLLMProviderConfigUseCaseInput,
  CreateLLMProviderConfigUseCaseInputSchema,
  CreateLLMProviderConfigUseCaseOutput,
} from "./create-llm-provider-config.schema";

@injectable()
export class CreateLLMProviderConfigUseCase
  implements
    IUseCase<
      CreateLLMProviderConfigUseCaseInput,
      CreateLLMProviderConfigUseCaseOutput
    >
{
  constructor(
    @inject(LLM_PROVIDER_CONFIG_REPOSITORY_INTERFACE_TYPE)
    private readonly configRepository: ILLMProviderConfigRepository,
    @inject(LOGGER_INTERFACE_TYPE)
    private readonly logger: ILogger
  ) {}

  async execute(
    input: CreateLLMProviderConfigUseCaseInput
  ): Promise<IUseCaseResponse<CreateLLMProviderConfigUseCaseOutput>> {
    const validInput = CreateLLMProviderConfigUseCaseInputSchema.parse(input);

    const nameVo = LLMProviderConfigName.create(validInput.name);
    const providerIdVo = LLMProviderId.create(validInput.providerId);
    const apiKeyVo = validInput.apiKey
      ? LLMApiKey.create(validInput.apiKey)
      : undefined;

    const baseUrlVo = validInput.baseUrl
      ? BaseUrl.create(validInput.baseUrl)
      : undefined;

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