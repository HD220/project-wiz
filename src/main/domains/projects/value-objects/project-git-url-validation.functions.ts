import { z } from "zod";

import { ValidationUtils } from "../../../../shared/utils/validation.utils";
import { ValidationError } from "../../../errors/validation.error";

const ProjectGitUrlSchema = z
  .string()
  .url("Invalid Git URL format")
  .refine(
    (url) =>
      url.includes("github.com") ||
      url.includes("gitlab.com") ||
      url.includes("bitbucket.org") ||
      url.includes(".git"),
    "URL must be a valid Git repository URL",
  )
  .nullable()
  .optional();

export function validateProjectGitUrl(gitUrl?: string | null): string | null {
  if (!gitUrl) {
    return null;
  }

  const sanitized = ValidationUtils.sanitizeString(gitUrl);

  try {
    return ProjectGitUrlSchema.parse(sanitized) ?? null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw ValidationError.singleField(
        "projectGitUrl",
        firstError.message,
        gitUrl,
      );
    }
    throw error;
  }
}

export function isValidProjectGitUrl(gitUrl?: string | null): boolean {
  try {
    if (!gitUrl) return true;
    const sanitized = ValidationUtils.sanitizeString(gitUrl);
    ProjectGitUrlSchema.parse(sanitized);
    return true;
  } catch {
    return false;
  }
}