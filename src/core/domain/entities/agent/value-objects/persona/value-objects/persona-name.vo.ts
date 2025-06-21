import { z } from "zod";
import { DomainError } from "@/core/common/errors";

const personaNameSchema = z.string().min(1, { message: "Persona name cannot be empty." });

export class PersonaName {
  private constructor(private readonly _value: string) {
    // Validation is now primarily in the create method via Zod parse
  }

  public static create(name: string): PersonaName {
    try {
      personaNameSchema.parse(name);
      return new PersonaName(name);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid PersonaName: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: PersonaName): boolean {
    return this._value === other._value;
  }
}
