import { ProjectData } from "./project-data.entity";
import { ProjectUpdater } from "./project-updater.entity";
import { Project } from "./project.entity";

export class ProjectOperations {
  constructor(
    private project: Project,
    private projectData: ProjectData,
    private projectUpdater: ProjectUpdater,
  ) {}

  archive(): void {
    this.projectUpdater.updateStatus("archived");
  }

  activate(): void {
    this.projectUpdater.updateStatus("active");
  }

  isActive(): boolean {
    return this.projectData.getStatus().getValue() === "active";
  }

  isArchived(): boolean {
    return this.projectData.getStatus().getValue() === "archived";
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
      description: this.projectData.getDescription().getValue(),
      gitUrl: this.projectData.getGitUrl().getValue(),
      status: this.projectData.getStatus().getValue() as
        | "active"
        | "inactive"
        | "archived",
      avatar: this.projectData.getAvatar(),
      createdAt: this.projectData.getCreatedAt(),
      updatedAt: this.projectData.getUpdatedAt(),
    };
  }
}
