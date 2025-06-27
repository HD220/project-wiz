// src_refactored/core/application/use-cases/agent-persona-template/create-persona-template.use-case.ts
import { ZodError } from 'zod';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { AgentPersonaTemplate } from '@/domain/agent/agent-persona-template.vo';
import { IAgentPersonaTemplateRepository } from '@/domain/agent/ports/agent-persona-template-repository.interface';
import { PersonaBackstory } from '@/domain/agent/value-objects/persona/persona-backstory.vo';
import { PersonaGoal } from '@/domain/agent/value-objects/persona/persona-goal.vo';
import { PersonaId } from '@/domain/agent/value-objects/persona/persona-id.vo';
import { PersonaName } from '@/domain/agent/value-objects/persona/persona-name.vo';
import { PersonaRole } from '@/domain/agent/value-objects/persona/persona-role.vo';
import { ToolNames } from '@/domain/agent/value-objects/persona/tool-names.vo';
import { DomainError, ValueError } from '@/domain/common/errors';

import { Result, ok, error } from '@/shared/result';

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
  private templateRepository: IAgentPersonaTemplateRepository;

  constructor(templateRepository: IAgentPersonaTemplateRepository) {
    this.templateRepository = templateRepository;
  }

  async execute(
    input: CreatePersonaTemplateUseCaseInput,
  ): Promise<Result<CreatePersonaTemplateUseCaseOutput, DomainError | ZodError | ValueError>> {
    // 1. Validate Input Schema
    const validationResult = CreatePersonaTemplateUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      // 2. Create Value Objects
      const nameVo = PersonaName.create(validInput.name);
      const roleVo = PersonaRole.create(validInput.role);
      const goalVo = PersonaGoal.create(validInput.goal);
      const backstoryVo = PersonaBackstory.create(validInput.backstory);
      const toolNamesVo = ToolNames.create(validInput.toolNames);
      const personaIdVo = PersonaId.generate(); // Generate ID for the new template

      // 3. Create AgentPersonaTemplate VO
      const personaTemplate = AgentPersonaTemplate.create({
        id: personaIdVo,
        name: nameVo,
        role: roleVo,
        goal: goalVo,
        backstory: backstoryVo,
        toolNames: toolNamesVo,
      });

      // 4. Save Entity/VO
      // Assuming repository's save method handles AgentPersonaTemplate
      const saveResult = await this.templateRepository.save(personaTemplate);
      if (saveResult.isError()) {
        return error(new DomainError(`Failed to save persona template: ${saveResult.value.message}`, saveResult.value));
      }

      // 5. Return Output
      return ok({
        personaTemplateId: personaTemplate.id().value(),
      });

    } catch (err: any) {
      if (err instanceof ZodError) {
        return error(err);
      }
      if (err instanceof DomainError || err instanceof ValueError) {
        return error(err);
      }
      console.error('[CreatePersonaTemplateUseCase] Unexpected error:', err);
      return error(
        new DomainError(
          `An unexpected error occurred while creating the persona template: ${err.message || err}`,
        ),
      );
    }
  }
}
