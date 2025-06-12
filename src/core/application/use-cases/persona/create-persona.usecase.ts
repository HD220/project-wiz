import { Executable } from "@/core/common/executable";
import { NOK, OK, Result } from "@/shared/result";
import {
  PersonaBackstory,
  PersonaGoal,
  PersonaName,
  PersonaRole,
} from "@/core/domain/entities/agent/value-objects/persona/value-objects";
import { IPersonaRepository } from "@/core/ports/repositories/persona.interface";

export class CreatePersonaUseCase implements Executable<Input, Output> {
  constructor(private readonly personaRepository: IPersonaRepository) {}

  async execute(data: Input): Promise<Result<Output>> {
    try {
      const { name, role, goal, backstory } = data;

      const persona = await this.personaRepository.create({
        name: new PersonaName(name),
        role: new PersonaRole(role),
        goal: new PersonaGoal(goal),
        backstory: new PersonaBackstory(backstory),
      });

      return OK({
        personaId: persona.id.value,
      });
    } catch (error) {
      return NOK(error as Error);
    }
  }
}

type Input = {
  name: string;
  role: string;
  goal: string;
  backstory: string;
};

type Output = {
  personaId: string | number;
};
