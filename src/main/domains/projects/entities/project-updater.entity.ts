import {
  ProjectName,
  ProjectDescription,
  ProjectGitUrl,
  ProjectStatus,
} from "../value-objects";

import { ProjectData } from "./project-data.entity";

export class ProjectUpdater {
  constructor(private projectData: ProjectData) {}

  updateName(newName: string): void {
    const name = new ProjectName(newName);
    this.projectData = new ProjectData(
      name,
      this.projectData.getDescription(),
      this.projectData.getGitUrl(),
      this.projectData.getStatus(),
      this.projectData.getAvatar(),
      this.projectData.getCreatedAt(),
      new Date(),
    );
  }

  updateDescription(newDescription?: string | null): void {
    const description = new ProjectDescription(newDescription);
    this.projectData = new ProjectData(
      this.projectData.getName(),
      description,
      this.projectData.getGitUrl(),
      this.projectData.getStatus(),
      this.projectData.getAvatar(),
      this.projectData.getCreatedAt(),
      new Date(),
    );
  }

  updateGitUrl(newGitUrl?: string | null): void {
    const gitUrl = new ProjectGitUrl(newGitUrl);
    this.projectData = new ProjectData(
      this.projectData.getName(),
      this.projectData.getDescription(),
      gitUrl,
      this.projectData.getStatus(),
      this.projectData.getAvatar(),
      this.projectData.getCreatedAt(),
      new Date(),
    );
  }

  updateStatus(newStatus: string): void {
    const status = new ProjectStatus(newStatus);
    this.projectData = new ProjectData(
      this.projectData.getName(),
      this.projectData.getDescription(),
      this.projectData.getGitUrl(),
      status,
      this.projectData.getAvatar(),
      this.projectData.getCreatedAt(),
      new Date(),
    );
  }
}
