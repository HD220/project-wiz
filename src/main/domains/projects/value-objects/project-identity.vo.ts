import { z } from "zod";

import { ValidationUtils } from "../../../../shared/utils/validation.utils";
import { ValidationError } from "../../../errors/validation.error";

const ProjectIdentitySchema = z
  .string()
  .min(1, "Project ID cannot be empty")
  .uuid("Project ID must be a valid UUID");

export class ProjectIdentity {
  private readonly value: string;

  constructor(id: string) {
    const sanitized = ValidationUtils.sanitizeString(id);

    try {
      this.value = ProjectIdentitySchema.parse(sanitized);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw ValidationError.singleField("projectId", firstError.message, id);
      }
      throw error;
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProjectIdentity): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static isValid(id: string): boolean {
    try {
      const sanitized = ValidationUtils.sanitizeString(id);
      ProjectIdentitySchema.parse(sanitized);
      return true;
    } catch {
      return false;
    }
  }
}
