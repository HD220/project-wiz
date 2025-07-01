// src_refactored/core/application/use-cases/agent/create-agent.use-case.ts
import { ZodError } from 'zod';

import { ILogger } from '@/core/common/services/i-logger.service'; // Corrected import

import { Agent } from '@/domain/agent/agent.entity';
import { IAgentPersonaTemplateRepository } from '@/domain/agent/ports/agent-persona-template-repository.interface';
import { IAgentRepository } from '@/domain/agent/ports/agent-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
// Added import
import { AgentMaxIterations } from '@/domain/agent/value-objects/agent-max-iterations.vo';
import { AgentTemperature } from '@/domain/agent/value-objects/agent-temperature.vo';
import { PersonaId } from '@/domain/agent/value-objects/persona/persona-id.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
// Removed duplicate import of DomainError, NotFoundError, ValueError
import { ILLMProviderConfigRepository } from '@/domain/llm-provider-config/ports/llm-provider-config-repository.interface';
import { LLMProviderConfigId } from '@/domain/llm-provider-config/value-objects/llm-provider-config-id.vo';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { Result, ok, error } from '@/shared/result';


import {
  CreateAgentUseCaseInput,
  CreateAgentUseCaseInputSchema,
  CreateAgentUseCaseOutput,
} from './create-agent.schema';

export class CreateAgentUseCase
  implements
    Executable<
      CreateAgentUseCaseInput,
      CreateAgentUseCaseOutput,
      DomainError | NotFoundError | ZodError | ValueError
    >
{
  constructor(
    private readonly agentRepository: IAgentRepository,
    private readonly personaTemplateRepository: IAgentPersonaTemplateRepository,
    private readonly llmConfigRepository: ILLMProviderConfigRepository,
    private readonly logger: ILogger, // Corrected type
  ) {}

  async execute(
    input: CreateAgentUseCaseInput,
  ): Promise<Result<CreateAgentUseCaseOutput, DomainError | NotFoundError | ZodError | ValueError>> {
    // 1. Validate Input Schema
    const validationResult = CreateAgentUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const { personaTemplate, llmProviderConfig } = await this._fetchPrerequisites(validInput);
      const { temperatureVo, maxIterationsVo, agentIdVo } = this._createAgentValueObjects(validInput);

      const agentEntity = Agent.create({
        id: agentIdVo,
        personaTemplate,
        llmProviderConfig,
        temperature: temperatureVo,
        maxIterations: maxIterationsVo,
      });

      const saveResult = await this.agentRepository.save(agentEntity);
      if (saveResult.isError()) {
        return error(new DomainError(`Failed to save agent: ${saveResult.value.message}`, saveResult.value));
      }

      return ok({ agentId: agentEntity.id().value() });
    } catch (errorValue: unknown) {
      return this._handleUseCaseError(errorValue);
    }
  }

  private async _fetchPrerequisites(validInput: CreateAgentUseCaseInput) {
    const personaTemplateIdVo = PersonaId.fromString(validInput.personaTemplateId);
    const llmConfigIdVo = LLMProviderConfigId.fromString(validInput.llmProviderConfigId);

    const templateResult = await this.personaTemplateRepository.findById(personaTemplateIdVo);
    if (templateResult.isError()) {
      throw new DomainError(`Failed to fetch persona template: ${templateResult.value.message}`, templateResult.value);
    }
    const personaTemplate = templateResult.value;
    if (!personaTemplate) {
      throw new NotFoundError(`AgentPersonaTemplate with ID ${validInput.personaTemplateId} not found.`);
    }

    const llmConfigResult = await this.llmConfigRepository.findById(llmConfigIdVo);
    if (llmConfigResult.isError()) {
      throw new DomainError(`Failed to fetch LLM provider config: ${llmConfigResult.value.message}`, llmConfigResult.value);
    }
    const llmProviderConfig = llmConfigResult.value;
    if (!llmProviderConfig) {
      throw new NotFoundError(`LLMProviderConfig with ID ${validInput.llmProviderConfigId} not found.`);
    }
    return { personaTemplate, llmProviderConfig };
  }

  private _createAgentValueObjects(validInput: CreateAgentUseCaseInput) {
    const temperatureVo = validInput.temperature !== undefined
      ? AgentTemperature.create(validInput.temperature)
      : AgentTemperature.default();
    const maxIterationsVo = validInput.maxIterations !== undefined
      ? AgentMaxIterations.create(validInput.maxIterations)
      : AgentMaxIterations.default();
    const agentIdVo = AgentId.generate();
    return { temperatureVo, maxIterationsVo, agentIdVo };
  }

  private _handleUseCaseError(errorValue: unknown): Result<never, DomainError | NotFoundError | ZodError | ValueError> {
    if (errorValue instanceof ZodError) {
      return error(errorValue);
    }
    if (errorValue instanceof NotFoundError || errorValue instanceof DomainError || errorValue instanceof ValueError) {
      return error(errorValue);
    }
    const message = errorValue instanceof Error ? errorValue.message : String(errorValue);
    this.logger.error(`[CreateAgentUseCase] Unexpected error: ${message}`, { error: errorValue });
    return error(new DomainError(`An unexpected error occurred while creating the agent: ${message}`));
  }
}
