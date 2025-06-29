// src_refactored/core/application/use-cases/agent/create-agent.use-case.ts
import { ZodError } from 'zod';

import { ILoggerService } from '@/core/common/services/i-logger.service';

import { Agent } from '@/domain/agent/agent.entity';
import { IAgentPersonaTemplateRepository } from '@/domain/agent/ports/agent-persona-template-repository.interface';
import { IAgentRepository } from '@/domain/agent/ports/agent-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { AgentMaxIterations } from '@/domain/agent/value-objects/agent-max-iterations.vo'; // Added import
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
    private readonly logger: ILoggerService,
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
      // 2. Convert IDs to VOs
      const personaTemplateIdVo = PersonaId.fromString(validInput.personaTemplateId);
      const llmConfigIdVo = LLMProviderConfigId.fromString(validInput.llmProviderConfigId);

      // 3. Fetch AgentPersonaTemplate
      const templateResult = await this.personaTemplateRepository.findById(personaTemplateIdVo);
      if (templateResult.isError()) {
        return error(new DomainError(`Failed to fetch persona template: ${templateResult.value.message}`, templateResult.value));
      }
      const personaTemplate = templateResult.value;
      if (!personaTemplate) {
        return error(new NotFoundError(`AgentPersonaTemplate with ID ${validInput.personaTemplateId} not found.`));
      }

      // 4. Fetch LLMProviderConfig
      const llmConfigResult = await this.llmConfigRepository.findById(llmConfigIdVo);
      if (llmConfigResult.isError()) {
        return error(new DomainError(`Failed to fetch LLM provider config: ${llmConfigResult.value.message}`, llmConfigResult.value));
      }
      const llmProviderConfig = llmConfigResult.value;
      if (!llmProviderConfig) {
        return error(new NotFoundError(`LLMProviderConfig with ID ${validInput.llmProviderConfigId} not found.`));
      }

      // 5. Create AgentTemperature VO
      const temperatureVo = validInput.temperature !== undefined
        ? AgentTemperature.create(validInput.temperature)
        : AgentTemperature.default();

      // 5.b Create AgentMaxIterations VO
      const maxIterationsVo = validInput.maxIterations !== undefined
        ? AgentMaxIterations.create(validInput.maxIterations)
        : AgentMaxIterations.default();

      // 6. Generate AgentId
      const agentIdVo = AgentId.generate();

      // 7. Create Agent Entity
      const agentEntity = Agent.create({
        id: agentIdVo,
        personaTemplate, // Shorthand property
        llmProviderConfig, // Shorthand property
        temperature: temperatureVo,
        maxIterations: maxIterationsVo,
      });

      // 8. Save Agent Entity
      const saveResult = await this.agentRepository.save(agentEntity);
      if (saveResult.isError()) {
        return error(new DomainError(`Failed to save agent: ${saveResult.value.message}`, saveResult.value));
      }

      // 9. Return Output
      return ok({
        agentId: agentEntity.id().value(),
      });
    } catch (e: unknown) {
      if (e instanceof ZodError) {
        return error(e);
      }
      if (e instanceof NotFoundError || e instanceof DomainError || e instanceof ValueError) {
        return error(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`[CreateAgentUseCase] Unexpected error: ${message}`, { error: e }); // Added logger
      return error(
        new DomainError(
          `An unexpected error occurred while creating the agent: ${message}`,
        ),
      );
    }
  }
}
