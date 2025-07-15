import { z } from "zod";
import { ValidationError } from "../../../errors/validation.error";
import { ValidationUtils } from "../../../../shared/utils/validation.utils";

const ProjectDescriptionSchema = z.string()
  .max(500, "Project description cannot exceed 500 characters")
  .nullable()
  .optional();

export class ProjectDescription {
  private readonly value: string | null;

  constructor(description?: string | null) {
    if (!description) {
      this.value = null;
      return;
    }

    const sanitized = ValidationUtils.sanitizeString(description);
    
    try {
      this.value = ProjectDescriptionSchema.parse(sanitized) ?? null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw ValidationError.singleField("projectDescription", firstError.message, description);
      }
      throw error;
    }
  }

  getValue(): string | null {
    return this.value;
  }

  equals(other: ProjectDescription): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value ?? "";
  }

  isEmpty(): boolean {
    return !this.value || this.value.trim().length === 0;
  }

  static isValid(description?: string | null): boolean {
    try {
      if (!description) return true;
      const sanitized = ValidationUtils.sanitizeString(description);
      ProjectDescriptionSchema.parse(sanitized);
      return true;
    } catch {
      return false;
    }
  }
}