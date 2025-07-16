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
    this.updateField(() => description);
  }

  updateGitUrl(newGitUrl?: string | null): void {
    const gitUrl = new ProjectGitUrl(newGitUrl);
    this.updateField(undefined, () => gitUrl);
  }

  updateStatus(newStatus: string): void {
    const status = new ProjectStatus(newStatus);
    this.updateField(undefined, undefined, () => status);
  }

  private updateField(
    _nameUpdater?: () => ProjectName,
    _gitUrlUpdater?: () => ProjectGitUrl,
    _statusUpdater?: () => ProjectStatus,
  ): void {
    this.projectData.touchUpdatedAt();
  }
}
