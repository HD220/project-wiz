import { injectable, inject } from "inversify";

import { AGENT_REPOSITORY_INTERFACE_TYPE, AGENT_PERSONA_TEMPLATE_REPOSITORY_INTERFACE_TYPE, LLM_PROVIDER_CONFIG_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { Agent } from "@/core/domain/agent/agent.entity";
import { IAgentPersonaTemplateRepository } from "@/core/domain/agent/ports/agent-persona-template-repository.interface";
import { IAgentRepository } from "@/core/domain/agent/ports/agent-repository.interface";
import { AgentId } from "@/core/domain/agent/value-objects/agent-id.vo";
import { AgentMaxIterations } from "@/core/domain/agent/value-objects/agent-max-iterations.vo";
import { AgentTemperature } from "@/core/domain/agent/value-objects/agent-temperature.vo";
import { NotFoundError } from "@/core/domain/common/errors";
import { ILLMProviderConfigRepository } from "@/core/domain/llm-provider-config/ports/llm-provider-config-repository.interface";

import { IUseCaseResponse, successUseCaseResponse, errorUseCaseResponse } from "@/shared/application/use-case-response.dto";


import {
  CreateAgentUseCaseInput,
  CreateAgentUseCaseInputSchema,
  CreateAgentUseCaseOutput,
} from "./create-agent.schema";

@injectable()
export class CreateAgentUseCase
  implements
    IUseCase<
      CreateAgentUseCaseInput,
      IUseCaseResponse<CreateAgentUseCaseOutput>
    >
{
  constructor(
    @inject(AGENT_REPOSITORY_INTERFACE_TYPE) private readonly agentRepository: IAgentRepository,
    @inject(AGENT_PERSONA_TEMPLATE_REPOSITORY_INTERFACE_TYPE) private readonly personaTemplateRepository: IAgentPersonaTemplateRepository,
    @inject(LLM_PROVIDER_CONFIG_REPOSITORY_INTERFACE_TYPE) private readonly llmProviderConfigRepository: ILLMProviderConfigRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  async execute(
    input: CreateAgentUseCaseInput
  ): Promise<IUseCaseResponse<CreateAgentUseCaseOutput>> {
    const validInput = CreateAgentUseCaseInputSchema.parse(input);

    const { temperatureVo, maxIterationsVo, agentIdVo } = this._createAgentValueObjects(validInput);

    const personaTemplate = await this.personaTemplateRepository.findById(validInput.personaTemplateId);
    if (!personaTemplate) {
      return errorUseCaseResponse(new NotFoundError("PersonaTemplate", validInput.personaTemplateId));
    }

    const llmProviderConfig = await this.llmProviderConfigRepository.findById(LLMProviderConfigId.fromString(validInput.llmProviderConfigId));
    if (!llmProviderConfig) {
      return errorUseCaseResponse(new NotFoundError("LLMProviderConfig", validInput.llmProviderConfigId));
    }

    const agentEntity = Agent.create({
      id: agentIdVo,
      personaTemplate: personaTemplate,
      llmProviderConfig: llmProviderConfig,
      temperature: temperatureVo,
      maxIterations: maxIterationsVo,
    });

    const savedAgent = await this.agentRepository.save(agentEntity);

    return successUseCaseResponse({ agentId: savedAgent.id.value });
  }

  private _createAgentValueObjects(validInput: CreateAgentUseCaseInput): {
    temperatureVo: AgentTemperature;
    maxIterationsVo: AgentMaxIterations;
    agentIdVo: AgentId;
  } {
    const temperatureVo =
      validInput.temperature !== undefined
        ? AgentTemperature.create(validInput.temperature)
        : AgentTemperature.default();
    const maxIterationsVo =
      validInput.maxIterations !== undefined
        ? AgentMaxIterations.create(validInput.maxIterations)
        : AgentMaxIterations.default();
    const agentIdVo = AgentId.generate();
    return { temperatureVo, maxIterationsVo, agentIdVo };
  }
}