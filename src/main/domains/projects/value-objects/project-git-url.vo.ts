import { 
  validateProjectGitUrl, 
  isValidProjectGitUrl 
} from "./project-git-url-validation.functions";

export class ProjectGitUrl {
  private readonly value: string | null;

  constructor(gitUrl?: string | null) {
    this.value = validateProjectGitUrl(gitUrl);
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
    return isValidProjectGitUrl(gitUrl);
  }
}