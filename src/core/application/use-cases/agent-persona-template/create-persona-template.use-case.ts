import { injectable, inject } from "inversify";

import { AGENT_PERSONA_TEMPLATE_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/logger.port";
import { AgentPersonaTemplate } from "@/core/domain/agent/agent-persona-template.vo";
import { IAgentPersonaTemplateRepository } from "@/core/domain/agent/ports/agent-persona-template-repository.interface";
import { PersonaBackstory } from "@/core/domain/agent/value-objects/persona/persona-backstory.vo";
import { PersonaGoal } from "@/core/domain/agent/value-objects/persona/persona-goal.vo";
import { PersonaId } from "@/core/domain/agent/value-objects/persona/persona-id.vo";
import { PersonaName } from "@/core/domain/agent/value-objects/persona/persona-name.vo";
import { PersonaRole } from "@/core/domain/agent/value-objects/persona/persona-role.vo";
import { ToolNames } from "@/core/domain/agent/value-objects/persona/tool-names.vo";


import {
  CreatePersonaTemplateUseCaseInput,
  CreatePersonaTemplateUseCaseInputSchema,
  CreatePersonaTemplateUseCaseOutput,
} from "./create-persona-template.schema";

@injectable()
export class CreatePersonaTemplateUseCase
  implements
    IUseCase<
      CreatePersonaTemplateUseCaseInput,
      CreatePersonaTemplateUseCaseOutput
    >
{
  constructor(
    @inject(AGENT_PERSONA_TEMPLATE_REPOSITORY_INTERFACE_TYPE) private readonly templateRepository: IAgentPersonaTemplateRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  async execute(
    input: CreatePersonaTemplateUseCaseInput
  ): Promise<CreatePersonaTemplateUseCaseOutput> {
    const validInput = CreatePersonaTemplateUseCaseInputSchema.parse(input);

    const nameVo = PersonaName.create(validInput.name);
    const roleVo = PersonaRole.create(validInput.role);
    const goalVo = PersonaGoal.create(validInput.goal);
    const backstoryVo = validInput.backstory ? PersonaBackstory.create(validInput.backstory) : null;
    const toolNamesVo = ToolNames.create(validInput.toolNames);
    const personaIdVo = PersonaId.generate();

    const personaTemplate = AgentPersonaTemplate.create({
      id: personaIdVo,
      name: nameVo,
      role: roleVo,
      goal: goalVo,
      backstory: backstoryVo,
      toolNames: toolNamesVo,
    });

    const savedPersonaTemplate = await this.templateRepository.save(
      personaTemplate
    );

    return {
      personaTemplateId: savedPersonaTemplate.id.value,
    };
  }
}