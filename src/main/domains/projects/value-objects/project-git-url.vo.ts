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

export class ProjectGitUrl {
  private readonly value: string | null;

  constructor(gitUrl?: string | null) {
    if (!gitUrl) {
      this.value = null;
      return;
    }

    const sanitized = ValidationUtils.sanitizeString(gitUrl);

    try {
      this.value = ProjectGitUrlSchema.parse(sanitized) ?? null;
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

  getValue(): string | null {
    return this.value;
  }

  equals(other: ProjectGitUrl): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value ?? "";
  }

  isEmpty(): boolean {
    return !this.value;
  }

  static isValid(gitUrl?: string | null): boolean {
    try {
      if (!gitUrl) return true;
      const sanitized = ValidationUtils.sanitizeString(gitUrl);
      ProjectGitUrlSchema.parse(sanitized);
      return true;
    } catch {
      return false;
    }
  }
}
