import { Executable } from "@/core/common/executable"; // Assuming Executable is in common, not application
import { error, ok, Result } from "@/shared/result";
import {
  CreatePersonaUseCaseInput,
  CreatePersonaUseCaseOutput,
  CreatePersonaInputSchema,
} from "./create-persona.schema"; // Import from new schema file
import {
  PersonaBackstory,
  PersonaGoal,
  PersonaName,
  PersonaRole,
  PersonaId, // Import PersonaId
} from "@/core/domain/entities/agent/value-objects/persona/value-objects";
import { Persona } from "@/core/domain/entities/agent/value-objects/persona"; // Import Persona entity
import { IPersonaRepository } from "@/core/ports/repositories/persona.interface";
import { DomainError } from "@/core/common/errors"; // Import DomainError

export class CreatePersonaUseCase
  implements Executable<CreatePersonaUseCaseInput, Result<CreatePersonaUseCaseOutput>> {
  constructor(private readonly personaRepository: IPersonaRepository) {}

  async execute(data: CreatePersonaUseCaseInput): Promise<Result<CreatePersonaUseCaseOutput>> {
    try {
      const validationResult = CreatePersonaInputSchema.safeParse(data);
      if (!validationResult.success) {
        return error(validationResult.error.flatten().fieldErrors as any); // Cast for simplicity
      }
      const validInput = validationResult.data;

      const personaId = PersonaId.create(); // Generates new ID
      const nameVo = PersonaName.create(validInput.name);
      const roleVo = PersonaRole.create(validInput.role);
      const goalVo = PersonaGoal.create(validInput.goal);
      const backstoryVo = PersonaBackstory.create(validInput.backstory);

      // Use Persona.create() static method
      const persona = Persona.create({
        id: personaId,
        name: nameVo,
        role: roleVo,
        goal: goalVo,
        backstory: backstoryVo,
      });

      // Assuming IPersonaRepository has a 'save' method,
      // as 'create' on repository was for the entity factory pattern which is now in Persona.create()
      await this.personaRepository.save(persona);

      return ok({
        // persona.id is now a method returning PersonaId VO
        personaId: persona.id().getValue(),
      });
    } catch (err) {
      // Log the actual error for observability
      console.error("Error in CreatePersonaUseCase:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return error(new DomainError(errorMessage)); // Wrap error in DomainError
    }
  }
}

// Removed local type Input and Output, now imported from schema file
