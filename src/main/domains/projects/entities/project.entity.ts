import { Project as ProjectCore } from "./project-core.entity";
import { ProjectOperations } from "./project-operations.entity";

export class Project {
  private core: ProjectCore;
  private operations: ProjectOperations;

  constructor(props: {
    id?: string;
    name: string;
    description?: string | null;
    gitUrl?: string | null;
    status?: string;
    avatar?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.core = new ProjectCore(props);
    this.operations = new ProjectOperations(this.core);
  }

  getId(): string {
    return this.core.getId();
  }

  getName(): string {
    return this.core.getName();
  }

  updateName(newName: string): void {
    this.core.updateName(newName);
  }

  updateDescription(newDescription?: string | null): void {
    this.core.updateDescription(newDescription);
  }

  updateGitUrl(newGitUrl?: string | null): void {
    this.core.updateGitUrl(newGitUrl);
  }

  archive(): void {
    this.operations.archive();
  }

  activate(): void {
    this.operations.activate();
  }

  isActive(): boolean {
    return this.operations.isActive();
  }

  isArchived(): boolean {
    return this.operations.isArchived();
  }

  toPlainObject() {
    return this.operations.toPlainObject();
  }
}
