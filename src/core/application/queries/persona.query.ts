import { Executable } from "@/core/common/executable";
import { error, ok, Result } from "@/shared/result";
import { IPersonaRepository } from "@/core/ports/repositories/persona.interface";

export class PersonaQuery implements Executable<Input, Output> {
  constructor(private readonly personaRepository: IPersonaRepository) {}

  async execute(_: Input): Promise<Result<Output>> {
    try {
      const personas = await this.personaRepository.list();

      return ok({
        data: personas.map((persona) => ({
          id: persona.id.value,
          name: persona.name.value,
          role: persona.role.value,
          goal: persona.goal.value,
          backstory: persona.backstory.value,
        })),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return error(errorMessage);
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
  }[];
};
