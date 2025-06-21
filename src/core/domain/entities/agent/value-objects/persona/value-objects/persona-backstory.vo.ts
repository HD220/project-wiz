import { z } from "zod";
import { DomainError } from "@/core/common/errors";

// Allowing empty string for backstory, but could be .min(1) if required
const personaBackstorySchema = z.string();

export class PersonaBackstory {
  private constructor(private readonly _value: string) {
    // Validation in create method
  }

  public static create(backstory: string): PersonaBackstory {
    try {
      personaBackstorySchema.parse(backstory);
      return new PersonaBackstory(backstory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid PersonaBackstory: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: PersonaBackstory): boolean {
    return this._value === other._value;
  }
}
