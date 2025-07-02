// src_refactored/core/application/use-cases/agent/create-agent.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';

import { AgentPersonaTemplate } from '@/domain/agent/agent-persona-template.vo';
import { Agent } from '@/domain/agent/agent.entity';
import { IAgentPersonaTemplateRepository } from '@/domain/agent/ports/agent-persona-template-repository.interface';
import { IAgentRepository } from '@/domain/agent/ports/agent-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { AgentMaxIterations } from '@/domain/agent/value-objects/agent-max-iterations.vo';
import { AgentTemperature } from '@/domain/agent/value-objects/agent-temperature.vo';
import { PersonaId } from '@/domain/agent/value-objects/persona/persona-id.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
import { LLMProviderConfig } from '@/domain/llm-provider-config/llm-provider-config.entity';
import { ILLMProviderConfigRepository } from '@/domain/llm-provider-config/ports/llm-provider-config-repository.interface';
import { LLMProviderConfigId } from '@/domain/llm-provider-config/value-objects/llm-provider-config-id.vo';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types';

import { Result, ok, error as resultError, isError, isSuccess } from '@/shared/result';

import {
  CreateAgentUseCaseInput,
  CreateAgentUseCaseInputSchema,
  CreateAgentUseCaseOutput,
} from './create-agent.schema';

@injectable()
export class CreateAgentUseCase
  implements
    Executable<
      CreateAgentUseCaseInput,
      CreateAgentUseCaseOutput,
      DomainError | NotFoundError | ZodError | ValueError
    >
{
  constructor(
    @inject(TYPES.IAgentRepository) private readonly agentRepository: IAgentRepository,
    @inject(TYPES.IAgentPersonaTemplateRepository) private readonly personaTemplateRepository: IAgentPersonaTemplateRepository,
    @inject(TYPES.ILLMProviderConfigRepository) private readonly llmConfigRepository: ILLMProviderConfigRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async execute(
    input: CreateAgentUseCaseInput,
  ): Promise<Result<CreateAgentUseCaseOutput, DomainError | NotFoundError | ZodError | ValueError>> {
    const validationResult = CreateAgentUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return resultError(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const prerequisitesResult = await this._fetchPrerequisites(validInput);
      if (isError(prerequisitesResult)) {
        return resultError(prerequisitesResult.error);
      }
      const { personaTemplate, llmProviderConfig } = prerequisitesResult.value;

      const agentValueObjectsResult = this._createAgentValueObjects(validInput);
      if (isError(agentValueObjectsResult)) {
        return resultError(agentValueObjectsResult.error);
      }
      const { temperatureVo, maxIterationsVo, agentIdVo } = agentValueObjectsResult.value;

      // Agent.create is expected to throw on error
      const agentEntity = Agent.create({
        id: agentIdVo,
        personaTemplate,
        llmProviderConfig,
        temperature: temperatureVo,
        maxIterations: maxIterationsVo,
      });

      const saveResult = await this.agentRepository.save(agentEntity);
      if (isError(saveResult)) {
        const err = saveResult.error instanceof DomainError ? saveResult.error : new DomainError(`Failed to save agent: ${saveResult.error.message}`, saveResult.error);
        return resultError(err);
      }

      return ok({ agentId: agentEntity.id().value() });
    } catch (e: unknown) {
      return this._handleUseCaseError(e, validInput);
    }
  }

  private async _fetchPrerequisites(validInput: CreateAgentUseCaseInput): Promise<Result<{
    personaTemplate: AgentPersonaTemplate;
    llmProviderConfig: LLMProviderConfig;
  }, DomainError | NotFoundError | ValueError >> {
    try {
      // These VO creations can throw ValueError
      const personaTemplateIdVo = PersonaId.fromString(validInput.personaTemplateId);
      const llmConfigIdVo = LLMProviderConfigId.fromString(validInput.llmProviderConfigId);

      const templateResult = await this.personaTemplateRepository.findById(personaTemplateIdVo);
      if (isError(templateResult)) {
        return resultError(new DomainError(`Failed to fetch persona template: ${templateResult.error.message}`, templateResult.error));
      }
      const personaTemplate = templateResult.value;
      if (!personaTemplate) {
        return resultError(new NotFoundError(`AgentPersonaTemplate with ID ${validInput.personaTemplateId} not found.`));
      }

      const llmConfigResult = await this.llmConfigRepository.findById(llmConfigIdVo);
      if (isError(llmConfigResult)) {
        return resultError(new DomainError(`Failed to fetch LLM provider config: ${llmConfigResult.error.message}`, llmConfigResult.error));
      }
      const llmProviderConfig = llmConfigResult.value;
      if (!llmProviderConfig) {
        return resultError(new NotFoundError(`LLMProviderConfig with ID ${validInput.llmProviderConfigId} not found.`));
      }
      return ok({ personaTemplate, llmProviderConfig });
    } catch (e: unknown) {
      if (e instanceof ValueError) return resultError(e);
      const message = e instanceof Error ? e.message : String(e);
      const errorToLog = e instanceof Error ? e : new Error(message);
      this.logger.error(
        `[CreateAgentUseCase/_fetchPrerequisites] Error: ${message}`,
        errorToLog,
        { useCase: 'CreateAgentUseCase', method: '_fetchPrerequisites', input: validInput },
      );
      return resultError(new DomainError(`Error fetching prerequisites: ${message}`, errorToLog));
    }
  }

  private _createAgentValueObjects(validInput: CreateAgentUseCaseInput): Result<{
    temperatureVo: AgentTemperature;
    maxIterationsVo: AgentMaxIterations;
    agentIdVo: AgentId;
  }, ValueError> {
    try {
      // These VOs .create/.default methods are expected to throw ValueError on failure
      const temperatureVo = validInput.temperature !== undefined
        ? AgentTemperature.create(validInput.temperature)
        : AgentTemperature.default();
      const maxIterationsVo = validInput.maxIterations !== undefined
        ? AgentMaxIterations.create(validInput.maxIterations)
        : AgentMaxIterations.default();
      const agentIdVo = AgentId.generate();
      return ok({ temperatureVo, maxIterationsVo, agentIdVo });
    } catch (e: unknown) {
      if (e instanceof ValueError) return resultError(e);
      const message = e instanceof Error ? e.message : String(e);
      const errorToLog = e instanceof Error ? e : new Error(message);
      this.logger.warn(
        `[CreateAgentUseCase/_createAgentValueObjects] Unexpected error: ${message}`,
        errorToLog,
        { useCase: 'CreateAgentUseCase', method: '_createAgentValueObjects', input: validInput },
      );
      return resultError(new ValueError(`Error creating agent value objects: ${message}`));
    }
  }

  private _handleUseCaseError(e: unknown, input?: CreateAgentUseCaseInput): Result<never, DomainError | NotFoundError | ZodError | ValueError> {
    if (e instanceof ZodError) {
      return resultError(e);
    }
    if (e instanceof NotFoundError || e instanceof DomainError || e instanceof ValueError) {
      return resultError(e);
    }
    const message = e instanceof Error ? e.message : String(e);
    const logError = e instanceof Error ? e : new Error(message);
    this.logger.error(
      `[CreateAgentUseCase] Unexpected error: ${message}`,
      logError,
      { useCase: 'CreateAgentUseCase', input: input ?? 'Unknown input' },
    );
    return resultError(new DomainError(`An unexpected error occurred while creating the agent: ${message}`, logError));
  }
}
