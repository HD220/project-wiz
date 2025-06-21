import { z } from "zod";
import { DomainError } from "@/core/common/errors";

const projectNameSchema = z.string().min(1, { message: "Project name cannot be empty." });

export class ProjectName {
  private constructor(private readonly _value: string) {
    // Validation is handled by Zod in the static create method
  }

  public static create(name: string): ProjectName {
    try {
      projectNameSchema.parse(name);
      return new ProjectName(name);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid ProjectName: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: ProjectName): boolean {
    return !!other && this._value === other._value;
  }
}
