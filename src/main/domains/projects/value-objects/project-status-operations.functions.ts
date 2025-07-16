import { z } from "zod";

import { ValidationError } from "../../../errors/validation.error";

const ProjectStatusSchema = z.enum(["active", "inactive", "archived"], {
  errorMap: () => ({
    message: "Project status must be active, inactive, or archived",
  }),
});

export type ProjectStatusType = z.infer<typeof ProjectStatusSchema>;

export function validateProjectStatus(status: string): ProjectStatusType {
  try {
    return ProjectStatusSchema.parse(status);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw ValidationError.singleField(
        "projectStatus",
        firstError.message,
        status,
      );
    }
    throw error;
  }
}

export function isValidProjectStatus(status: string): boolean {
  try {
    ProjectStatusSchema.parse(status);
    return true;
  } catch {
    return false;
  }
}

export function canActivateStatus(current: ProjectStatusType): boolean {
  return current !== "active";
}

export function canArchiveStatus(current: ProjectStatusType): boolean {
  return current !== "archived";
}
