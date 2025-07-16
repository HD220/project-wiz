import { 
  validateProjectDescription, 
  isValidProjectDescription 
} from "./project-description-validation.functions";

export class ProjectDescription {
  private readonly value: string | null;

  constructor(description?: string | null) {
    this.value = validateProjectDescription(description);
  }

  getValue(): string | null {
    return this.value;
  }

  equals(other: ProjectDescription): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value ?? "";
  }

  isEmpty(): boolean {
    return !this.value || this.value.trim().length === 0;
  }

  static isValid(description?: string | null): boolean {
    return isValidProjectDescription(description);
  }
}