import {
  PersonaConstructor,
  Persona,
} from "@/core/domain/entities/agent/value-objects/persona";
import { PersonaId } from "@/core/domain/entities/agent/value-objects/persona/value-objects";
import { IPersonaRepository } from "@/core/ports/repositories/persona.interface";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export class PersonaRepositoryDrizzle implements IPersonaRepository {
  constructor(
    private readonly db: BetterSQLite3Database<Record<string, never>>
  ) {}
  create(props: Omit<PersonaConstructor, "id">): Promise<Persona> {
    throw new Error("Method not implemented.");
  }
  load(id: PersonaId): Promise<Persona> {
    throw new Error("Method not implemented.");
  }
  save(entity: Persona): Promise<PersonaId> {
    throw new Error("Method not implemented.");
  }
  list(): Promise<Persona[]> {
    throw new Error("Method not implemented.");
  }
  delete(id: PersonaId): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
