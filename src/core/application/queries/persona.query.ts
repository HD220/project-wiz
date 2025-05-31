import { Executable } from "@/core/common/executable";
import { NOK, OK, Result } from "@/core/common/result";
import { IPersonaRepository } from "@/core/ports/repositories/persona.interface";

export class PersonaQuery implements Executable<Input, Output> {
  constructor(private readonly personaRepository: IPersonaRepository) {}

  async execute(data: Input): Promise<Result<Output>> {
    try {
      const personas = await this.personaRepository.list();

      return OK({
        data: personas.map((persona) => ({
          id: persona.id.value,
          name: persona.name.value,
          role: persona.role.value,
          goal: persona.goal.value,
          backstory: persona.backstory.value,
          gender: persona.gender.value,
          personality: persona.personality.value,
        })),
      });
    } catch (error) {
      return NOK(error as Error);
    }
  }
}

type Input = undefined;
type Output = {
  data: {
    id: string | number;
    name: string;
    role: string;
    goal: string;
    backstory: string;
    gender: string;
    personality: string;
  }[];
};
