import {
  ProjectName,
  ProjectDescription,
  ProjectGitUrl,
  ProjectStatus,
  ProjectIdentity,
} from "../value-objects";

interface ProjectData {
  name: ProjectName;
  description: ProjectDescription;
  gitUrl: ProjectGitUrl;
  status: ProjectStatus;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Project {
  private readonly identity: ProjectIdentity;
  private data: ProjectData;

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
    this.identity = new ProjectIdentity(props.id || crypto.randomUUID());
    this.data = this.buildProjectData(props);
  }

  private buildProjectData(props: {
    name: string;
    description?: string | null;
    gitUrl?: string | null;
    status?: string;
    avatar?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): ProjectData {
    return {
      name: new ProjectName(props.name),
      description: new ProjectDescription(props.description),
      gitUrl: new ProjectGitUrl(props.gitUrl),
      status: new ProjectStatus(props.status || "active"),
      avatar: props.avatar || null,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  getId(): string {
    return this.identity.getValue();
  }

  getName(): string {
    return this.data.name.getValue();
  }

  updateName(newName: string): void {
    this.data.name = new ProjectName(newName);
    this.touchUpdatedAt();
  }

  updateDescription(newDescription?: string | null): void {
    this.data.description = new ProjectDescription(newDescription);
    this.touchUpdatedAt();
  }

  updateGitUrl(newGitUrl?: string | null): void {
    this.data.gitUrl = new ProjectGitUrl(newGitUrl);
    this.touchUpdatedAt();
  }

  updateStatus(newStatus: string): void {
    this.data.status = new ProjectStatus(newStatus);
    this.touchUpdatedAt();
  }

  getStatus(): string {
    return this.data.status.getValue();
  }

  getDescription(): string | null {
    return this.data.description.getValue();
  }

  getGitUrl(): string | null {
    return this.data.gitUrl.getValue();
  }

  getAvatar(): string | null {
    return this.data.avatar;
  }

  getCreatedAt(): Date {
    return this.data.createdAt;
  }

  getUpdatedAt(): Date {
    return this.data.updatedAt;
  }

  private touchUpdatedAt(): void {
    this.data.updatedAt = new Date();
  }
}