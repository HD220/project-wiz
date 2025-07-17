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

  static create(props: {
    name: string;
    description?: string | null;
    gitUrl?: string | null;
    status?: string;
    avatar?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): ProjectData {
    const name = new ProjectName(props.name);
    const description = new ProjectDescription(props.description || "");
    const gitUrl = new ProjectGitUrl(props.gitUrl || "");
    const status = new ProjectStatus(props.status || "active");
    const avatar = props.avatar || null;
    const createdAt = props.createdAt || new Date();
    const updatedAt = props.updatedAt || new Date();

    return new ProjectData(
      name,
      description,
      gitUrl,
      status,
      avatar,
      createdAt,
      updatedAt,
    );
  }
}
