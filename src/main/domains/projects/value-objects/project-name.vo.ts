import {
  validateProjectName,
  isValidProjectName,
} from "./project-name-validation.functions";

export class ProjectName {
  private readonly value: string;

  constructor(name: string) {
    this.value = validateProjectName(name);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProjectName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static isValid(name: string): boolean {
    return isValidProjectName(name);
  }
}
