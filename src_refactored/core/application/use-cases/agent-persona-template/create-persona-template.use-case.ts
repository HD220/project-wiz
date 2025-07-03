// src_refactored/core/application/use-cases/agent-persona-template/create-persona-template.use-case.ts
import { ZodError } from 'zod';

import { ILogger } from '@/core/common/services/i-logger.service';

import { AgentPersonaTemplate } from '@/domain/agent/agent-persona-template.vo';
import { IAgentPersonaTemplateRepository } from '@/domain/agent/ports/agent-persona-template-repository.interface';
import { PersonaBackstory } from '@/domain/agent/value-objects/persona/persona-backstory.vo';
import { PersonaGoal } from '@/domain/agent/value-objects/persona/persona-goal.vo';
import { PersonaId } from '@/domain/agent/value-objects/persona/persona-id.vo';
import { PersonaName } from '@/domain/agent/value-objects/persona/persona-name.vo';
import { PersonaRole } from '@/domain/agent/value-objects/persona/persona-role.vo';
import { ToolNames } from '@/domain/agent/value-objects/persona/tool-names.vo';
import { DomainError, ValueError } from '@/domain/common/errors';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { Result, ok, error as resultError, isError, isSuccess } from '@/shared/result';


import {
  CreatePersonaTemplateUseCaseInput,
  CreatePersonaTemplateUseCaseInputSchema,
  CreatePersonaTemplateUseCaseOutput,
} from './create-persona-template.schema';

export class CreatePersonaTemplateUseCase
  implements
    Executable<
      CreatePersonaTemplateUseCaseInput,
      CreatePersonaTemplateUseCaseOutput,
      DomainError | ZodError | ValueError
    >
{
  constructor(
    private readonly templateRepository: IAgentPersonaTemplateRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(
    input: CreatePersonaTemplateUseCaseInput,
  ): Promise<Result<CreatePersonaTemplateUseCaseOutput, DomainError | ZodError | ValueError>> {
    // 1. Validate Input Schema
    const validationResult = CreatePersonaTemplateUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return resultError(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      // 2. Create Value Objects (these throw on error)
      const nameVo = PersonaName.create(validInput.name);
      const roleVo = PersonaRole.create(validInput.role);
      const goalVo = PersonaGoal.create(validInput.goal);
      const backstoryVo = PersonaBackstory.create(validInput.backstory);
      const toolNamesVo = ToolNames.create(validInput.toolNames);
      const personaIdVo = PersonaId.generate();

      // 3. Create AgentPersonaTemplate VO (this throws on error)
      const personaTemplate = AgentPersonaTemplate.create({
        id: personaIdVo,
        name: nameVo,
        role: roleVo,
        goal: goalVo,
        backstory: backstoryVo,
        toolNames: toolNamesVo,
      });

      // 4. Save Entity/VO
      const saveResult = await this.templateRepository.save(personaTemplate);
      if (isError(saveResult)) {
        return resultError(new DomainError(`Failed to save persona template: ${saveResult.error.message}`, saveResult.error));
      }

      // 5. Return Output
      return ok({
        personaTemplateId: personaTemplate.id.value,
      });
    } catch (e: unknown) {
      if (e instanceof ZodError) {
        return resultError(e);
      }
      if (e instanceof DomainError || e instanceof ValueError) {
        return resultError(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      const logError = e instanceof Error ? e : new Error(message);
      this.logger.error(`[CreatePersonaTemplateUseCase] Unexpected error: ${message}`, logError, {
        input,
        useCase: 'CreatePersonaTemplateUseCase',
      });
      return resultError(
        new DomainError(
          `An unexpected error occurred while creating the persona template: ${message}`,
          logError
        ),
      );
    }
  }
}
