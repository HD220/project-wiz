import {
  ProjectName,
  ProjectDescription,
  ProjectGitUrl,
  ProjectStatus,
} from "../value-objects";

export class ProjectData {
  constructor(
    private name: ProjectName,
    private description: ProjectDescription,
    private gitUrl: ProjectGitUrl,
    private status: ProjectStatus,
    private avatar: string | null,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  getName(): ProjectName {
    return this.name;
  }

  getDescription(): ProjectDescription {
    return this.description;
  }

  getGitUrl(): ProjectGitUrl {
    return this.gitUrl;
  }

  getStatus(): ProjectStatus {
    return this.status;
  }

  getAvatar(): string | null {
    return this.avatar;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  touchUpdatedAt(): void {
    this.updatedAt = new Date();
  }
}
