import { Persona } from "../entities/persona.entity";

export interface PersonaRepository {
  save(persona: Persona): Promise<void>;
  findById(id: string): Promise<Persona | null>;
  findByName(name: string): Promise<Persona | null>;
  findAll(): Promise<Persona[]>;
  findByRole(role: string): Promise<Persona[]>;
  findBuiltInPersona(): Promise<Persona | null>;
  update(persona: Persona): Promise<void>;
  delete(id: string): Promise<void>;
}