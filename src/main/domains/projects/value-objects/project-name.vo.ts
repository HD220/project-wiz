import { z } from "zod";
import { ValidationError } from "../../../errors/validation.error";
import { ValidationUtils } from "../../../../shared/utils/validation.utils";

const ProjectNameSchema = z.string()
  .min(1, "Project name cannot be empty")
  .max(100, "Project name cannot exceed 100 characters")
  .refine(
    (name) => ValidationUtils.isNonEmptyString(name.trim()),
    "Project name must contain non-whitespace characters"
  );

export class ProjectName {
  private readonly value: string;

  constructor(name: string) {
    const sanitized = ValidationUtils.sanitizeString(name);
    
    try {
      this.value = ProjectNameSchema.parse(sanitized);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw ValidationError.singleField("projectName", firstError.message, name);
      }
      throw error;
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProjectName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static isValid(name: string): boolean {
    try {
      const sanitized = ValidationUtils.sanitizeString(name);
      ProjectNameSchema.parse(sanitized);
      return true;
    } catch {
      return false;
    }
  }
}