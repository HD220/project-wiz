import { z } from "zod";
import { ValidationError } from "../../../errors/validation.error";

const ProjectStatusSchema = z.enum(["active", "inactive", "archived"], {
  errorMap: () => ({ message: "Project status must be active, inactive, or archived" })
});

export type ProjectStatusType = z.infer<typeof ProjectStatusSchema>;

export class ProjectStatus {
  private readonly value: ProjectStatusType;

  constructor(status: string = "active") {
    try {
      this.value = ProjectStatusSchema.parse(status);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw ValidationError.singleField("projectStatus", firstError.message, status);
      }
      throw error;
    }
  }

  getValue(): ProjectStatusType {
    return this.value;
  }

  equals(other: ProjectStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isActive(): boolean {
    return this.value === "active";
  }

  isArchived(): boolean {
    return this.value === "archived";
  }

  toArchived(): ProjectStatus {
    return new ProjectStatus("archived");
  }

  toActive(): ProjectStatus {
    return new ProjectStatus("active");
  }

  static isValid(status: string): boolean {
    try {
      ProjectStatusSchema.parse(status);
      return true;
    } catch {
      return false;
    }
  }
}