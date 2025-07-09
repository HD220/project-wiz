import { Persona } from "@/main/modules/persona-management/domain/persona.entity";

export interface IPersonaRepository {
  save(persona: Persona): Promise<Persona>;
  findById(id: string): Promise<Persona | undefined>;
  findAll(): Promise<Persona[]>;
  delete(id: string): Promise<boolean>;
}
