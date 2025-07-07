import { injectable, inject } from "inversify";

import { LLM_PROVIDER_CONFIG_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/logger.port";
import { LLMProviderConfig } from '@/core/domain/llm-provider-config/llm-provider-config.entity';
import { ILLMProviderConfigRepository } from "@/core/domain/llm-provider-config/ports/llm-provider-config-repository.interface";
import { LLMApiKey } from "@/core/domain/llm-provider-config/value-objects/llm-api-key.vo";
import { LLMProviderConfigName } from "@/core/domain/llm-provider-config/value-objects/llm-provider-config-name.vo";
import { LLMProviderId } from "@/core/domain/llm-provider-config/value-objects/llm-provider-id.vo";





import {
  CreateLLMProviderConfigUseCaseInput,
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

  public async execute(input: CreateLLMProviderConfigUseCaseInput): Promise<CreateLLMProviderConfigUseCaseOutput> {
    const { name, providerId, apiKey, baseUrl } = input;

    const llmProviderConfigName = LLMProviderConfigName.create(name);
    const llmProviderConfigProvider = LLMProviderId.create(providerId);
    const llmProviderConfigApiKey = LLMApiKey.create(apiKey);

    const llmProviderConfig = LLMProviderConfig.create({
      name: llmProviderConfigName,
      providerId: llmProviderConfigProvider,
      apiKey: llmProviderConfigApiKey,
      baseUrl: baseUrl ?? undefined,
    });

    await this.configRepository.save(llmProviderConfig);

    return { llmProviderConfigId: llmProviderConfig.id.value };
  }
}