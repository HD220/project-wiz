import { z } from "zod";
import { DomainError } from "@/core/common/errors";

// Descriptions can often be empty, so no .min(1) by default unless specified.
const projectDescriptionSchema = z.string();

export class ProjectDescription {
  private constructor(private readonly _value: string) {
    // Validation handled by Zod in the static create method
  }

  public static create(description: string = ""): ProjectDescription {
    try {
      projectDescriptionSchema.parse(description);
      return new ProjectDescription(description);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid ProjectDescription: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: ProjectDescription): boolean {
    // Added check for other being null or undefined
    return !!other && this._value === other._value;
  }
}
