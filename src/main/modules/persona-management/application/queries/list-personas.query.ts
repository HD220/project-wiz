import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { Persona } from "@/main/modules/persona-management/domain/persona.entity";
import { IPersonaRepository } from "@/main/modules/persona-management/domain/persona.repository";

export type ListPersonasQueryPayload = Record<string, never>;

export class ListPersonasQuery implements IQuery<ListPersonasQueryPayload> {
  readonly type = "ListPersonasQuery";
  constructor(public payload: ListPersonasQueryPayload = {}) {}
}

export class ListPersonasQueryHandler {
  constructor(private personaRepository: IPersonaRepository) {}

  async handle(_query: ListPersonasQuery): Promise<Persona[]> {
    try {
      return await this.personaRepository.findAll();
    } catch (error) {
      console.error(`Failed to list personas:`, error);
      throw new ApplicationError(`Failed to list personas: ${(error as Error).message}`);
    }
  }
}
