import { z } from "zod";
import { DomainError } from "@/core/common/errors";

// Example: Could also be an enum if roles are predefined
const personaRoleSchema = z.string().min(1, { message: "Persona role cannot be empty." });

export class PersonaRole {
  private constructor(private readonly _value: string) {
    // Validation in create method
  }

  public static create(role: string): PersonaRole {
    try {
      personaRoleSchema.parse(role);
      return new PersonaRole(role);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid PersonaRole: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: PersonaRole): boolean {
    return this._value === other._value;
  }
}
