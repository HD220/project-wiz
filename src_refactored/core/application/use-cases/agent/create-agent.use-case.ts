// src_refactored/core/application/use-cases/agent/create-agent.use-case.ts
import { ZodError } from 'zod';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';
import { Agent } from '@/domain/agent/agent.entity';
import { IAgentPersonaTemplateRepository } from '@/domain/agent/ports/agent-persona-template-repository.interface';
import { IAgentRepository } from '@/domain/agent/ports/agent-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { AgentMaxIterations } from '@/domain/agent/value-objects/agent-max-iterations.vo'; // Added import
import { AgentTemperature } from '@/domain/agent/value-objects/agent-temperature.vo';
import { PersonaId } from '@/domain/agent/value-objects/persona/persona-id.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
import { ILLMProviderConfigRepository } from '@/domain/llm-provider-config/ports/llm-provider-config-repository.interface';
import { LLMProviderConfigId } from '@/domain/llm-provider-config/value-objects/llm-provider-config-id.vo';
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
    private agentRepository: IAgentRepository,
    private personaTemplateRepository: IAgentPersonaTemplateRepository,
    private llmConfigRepository: ILLMProviderConfigRepository,
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
        personaTemplate: personaTemplate,
        llmProviderConfig: llmProviderConfig,
        temperature: temperatureVo,
        maxIterations: maxIterationsVo, // Added maxIterations
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

    } catch (err: any) {
      if (err instanceof ZodError) { // Should be caught by safeParse earlier
        return error(err);
      }
      if (err instanceof NotFoundError || err instanceof DomainError || err instanceof ValueError) {
        return error(err); // Errors from VO creation or explicit NotFoundErrors
      }
      console.error('[CreateAgentUseCase] Unexpected error:', err);
      return error(
        new DomainError(
          `An unexpected error occurred while creating the agent: ${err.message || err}`,
        ),
      );
    }
  }
}
