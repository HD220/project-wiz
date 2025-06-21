import { Identity } from "@/core/common/identity";
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import { z } from 'zod'; // For potential specific validation if needed
import { DomainError } from "@/core/common/errors";


// The base Identity class already validates for UUID if it's a string.
// Specific schema for create method if we want different error messages or additional checks.
const personaIdSchema = z.string().uuid({ message: "PersonaId must be a valid UUID if provided." });

export class PersonaId extends Identity<string> {
  private constructor(value: string) {
    // The `super(value)` call will use Identity's constructor,
    // which should already perform z.string().uuid() validation.
    super(value);
  }

  public static create(id?: string): PersonaId {
    const newId = id || uuidv4();
    try {
      // Although super(newId) will validate, parsing here allows for specific errors
      // or if PersonaId had rules stricter than general Identity<string>.
      // For now, Identity's validation for UUID is sufficient.
      // If we wanted a custom message just for PersonaId not being UUID:
      // personaIdSchema.parse(newId);
      return new PersonaId(newId);
    } catch (error) {
      if (error instanceof z.ZodError) { // Should not happen if super() validates same schema
        throw new DomainError(`Invalid PersonaId format: ${error.errors.map(e => e.message).join(', ')}`);
      }
      // Catch errors from Identity constructor (e.g. if super(value) throws DomainError)
      if (error instanceof DomainError) {
          throw new DomainError(`Cannot create PersonaId: ${error.message}`);
      }
      throw error; // Re-throw other unexpected errors
    }
  }

  // Equals method is inherited from Identity and should work correctly
  // as Identity.equals compares the underlying _value.
  // No need to override unless specific PersonaId comparison logic is needed.
}
