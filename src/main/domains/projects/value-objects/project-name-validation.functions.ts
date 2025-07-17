import { z } from "zod";

import { ValidationUtils } from "../../../../shared/utils/validation.utils";
import { ValidationError } from "../../../errors/validation.error";
import { VALIDATION_LIMITS } from "../../../../shared/constants";

const ProjectNameSchema = z
  .string()
  .min(VALIDATION_LIMITS.NAME_MIN_LENGTH, "Project name cannot be empty")
  .max(
    VALIDATION_LIMITS.NAME_MAX_LENGTH,
    `Project name cannot exceed ${VALIDATION_LIMITS.NAME_MAX_LENGTH} characters`,
  )
  .refine(
    (name) => ValidationUtils.isNonEmptyString(name.trim()),
    "Project name must contain non-whitespace characters",
  )
  .refine(
    (name) => !name.includes("\n") && !name.includes("\r"),
    "Project name cannot contain line breaks",
  )
  .refine(
    (name) => !/^\s|\s$/.test(name),
    "Project name cannot start or end with whitespace",
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
