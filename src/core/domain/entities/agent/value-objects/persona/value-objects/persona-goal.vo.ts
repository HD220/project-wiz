import { z } from "zod";
import { DomainError } from "@/core/common/errors";

const personaGoalSchema = z.string().min(1, { message: "Persona goal cannot be empty." });

export class PersonaGoal {
  private constructor(private readonly _value: string) {
    // Validation in create method
  }

  public static create(goal: string): PersonaGoal {
    try {
      personaGoalSchema.parse(goal);
      return new PersonaGoal(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid PersonaGoal: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: PersonaGoal): boolean {
    return this._value === other._value;
  }
}
