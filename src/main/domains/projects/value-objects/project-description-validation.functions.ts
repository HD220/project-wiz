import { z } from "zod";

import { ValidationUtils } from "../../../../shared/utils/validation.utils";
import { ValidationError } from "../../../errors/validation.error";

const ProjectDescriptionSchema = z
  .string()
  .max(500, "Project description cannot exceed 500 characters")
  .nullable()
  .optional();

export function validateProjectDescription(
  description?: string | null,
): string | null {
  if (!description) {
    return null;
  }

  const sanitized = ValidationUtils.sanitizeString(description);

  try {
    return ProjectDescriptionSchema.parse(sanitized) ?? null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw ValidationError.singleField(
        "projectDescription",
        firstError.message,
        description,
      );
    }
    throw error;
  }
}

export function isValidProjectDescription(
  description?: string | null,
): boolean {
  try {
    if (!description) return true;
    const sanitized = ValidationUtils.sanitizeString(description);
    ProjectDescriptionSchema.parse(sanitized);
    return true;
  } catch {
    return false;
  }
}
