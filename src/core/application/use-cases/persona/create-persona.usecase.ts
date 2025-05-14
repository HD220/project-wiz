import { Executable } from "@/core/common/executable";
import { NOK, OK, Result } from "@/core/common/result";
import {
  PersonaBackstory,
  PersonaGender,
  PersonaGoal,
  PersonaName,
  PersonaPersonality,
  PersonaRole,
} from "@/core/domain/entities/persona/value-objects";
import { IPersonaRepository } from "@/core/ports/repositories/persona.repository";

export class CreatePersonaUseCase implements Executable<Input, Output> {
  constructor(private readonly personaRepository: IPersonaRepository) {}

  async execute(data: Input): Promise<Result<Output>> {
    try {
      const { name, role, goal, backstory, personality, gender } = data;

      const persona = await this.personaRepository.create({
        name: new PersonaName(name),
        gender: new PersonaGender(gender),
        role: new PersonaRole(role),
        goal: new PersonaGoal(goal),
        backstory: new PersonaBackstory(backstory),
        personality: new PersonaPersonality(personality),
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
  gender: "male" | "female";
  personality: string;
};

type Output = {
  personaId: string | number;
};
