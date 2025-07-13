import { Persona } from "./domain/persona.entity";
import type { PersonaSchema } from "./persistence/schema";
import type { PersonaDto } from "../../../shared/types/persona.types";

export class PersonaMapper {
  toDomain(schema: PersonaSchema): Persona {
    return new Persona(
      schema.id,
      schema.nome,
      schema.papel,
      schema.goal,
      schema.backstory,
      schema.llmProviderId || undefined,
      schema.isActive,
      schema.createdAt,
      schema.updatedAt,
    );
  }

  toDto(persona: Persona): PersonaDto {
    return {
      id: persona.id,
      nome: persona.nome,
      papel: persona.papel,
      goal: persona.goal,
      backstory: persona.backstory,
      llmProviderId: persona.llmProviderId,
      isActive: persona.isActive,
      createdAt: persona.createdAt,
      updatedAt: persona.updatedAt,
    };
  }

  toSchema(
    persona: Persona,
  ): Omit<PersonaSchema, "id" | "createdAt" | "updatedAt"> {
    return {
      nome: persona.nome,
      papel: persona.papel,
      goal: persona.goal,
      backstory: persona.backstory,
      llmProviderId: persona.llmProviderId || null,
      isActive: persona.isActive,
    };
  }
}
