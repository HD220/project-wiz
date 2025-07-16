import { Project } from "./project-core.entity";

export class ProjectOperations {
  constructor(private project: Project) {}

  archive(): void {
    this.project.updateStatus("archived");
  }

  activate(): void {
    this.project.updateStatus("active");
  }

  isActive(): boolean {
    return this.project.getStatus() === "active";
  }

  isArchived(): boolean {
    return this.project.getStatus() === "archived";
  }

  toPlainObject(): {
    id: string;
    name: string;
    description: string | null;
    gitUrl: string | null;
    status: "active" | "inactive" | "archived";
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.project.getId(),
      name: this.project.getName(),
      description: this.project.getDescription(),
      gitUrl: this.project.getGitUrl(),
      status: this.project.getStatus() as "active" | "inactive" | "archived",
      avatar: this.project.getAvatar(),
      createdAt: this.project.getCreatedAt(),
      updatedAt: this.project.getUpdatedAt(),
    };
  }
}
