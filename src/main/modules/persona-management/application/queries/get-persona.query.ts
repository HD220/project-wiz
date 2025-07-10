import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { Persona } from "@/main/modules/persona-management/domain/persona.entity";
import { IPersonaRepository } from "@/main/modules/persona-management/domain/persona.repository";

export interface IGetPersonaQueryPayload {
  id: string;
}

export class GetPersonaQuery implements IQuery<IGetPersonaQueryPayload> {
  readonly type = "GetPersonaQuery";
  constructor(public payload: IGetPersonaQueryPayload) {}
}

export class GetPersonaQueryHandler {
  constructor(private personaRepository: IPersonaRepository) {}

  async handle(query: GetPersonaQuery): Promise<Persona | undefined> {
    try {
      return await this.personaRepository.findById(query.payload.id);
    } catch (error) {
      console.error(`Failed to get persona:`, error);
      throw new ApplicationError(`Failed to get persona: ${(error as Error).message}`);
    }
  }
}
