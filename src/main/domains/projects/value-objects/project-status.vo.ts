import {
  ProjectStatusType,
  validateProjectStatus,
  isValidProjectStatus,
} from "./project-status-operations.functions";

export class ProjectStatus {
  private readonly value: ProjectStatusType;

  constructor(status: string = "active") {
    this.value = validateProjectStatus(status);
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
    return isValidProjectStatus(status);
  }
}
