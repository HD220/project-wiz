import { z } from "zod";

import { ValidationUtils } from "../../../../shared/utils/validation.utils";
import { ValidationError } from "../../../errors/validation.error";

const ProjectNameSchema = z
  .string()
  .min(1, "Project name cannot be empty")
  .max(100, "Project name cannot exceed 100 characters")
  .refine(
    (name) => ValidationUtils.isNonEmptyString(name.trim()),
    "Project name must contain non-whitespace characters",
  );

export function validateProjectName(name: string): string {
  const sanitized = ValidationUtils.sanitizeString(name);

  try {
    return ProjectNameSchema.parse(sanitized);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw ValidationError.singleField(
        "projectName",
        firstError.message,
        name,
      );
    }
    throw error;
  }
}

export function isValidProjectName(name: string): boolean {
  try {
    const sanitized = ValidationUtils.sanitizeString(name);
    ProjectNameSchema.parse(sanitized);
    return true;
  } catch {
    return false;
  }
}
