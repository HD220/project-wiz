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

  archive(): void {
    this.data.status = this.data.status.toArchived();
    this.touchUpdatedAt();
  }

  activate(): void {
    this.data.status = this.data.status.toActive();
    this.touchUpdatedAt();
  }

  isActive(): boolean {
    return this.data.status.isActive();
  }

  isArchived(): boolean {
    return this.data.status.isArchived();
  }

  private touchUpdatedAt(): void {
    this.data.updatedAt = new Date();
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
      id: this.identity.getValue(),
      name: this.data.name.getValue(),
      description: this.data.description.getValue(),
      gitUrl: this.data.gitUrl.getValue(),
      status: this.data.status.getValue() as "active" | "inactive" | "archived",
      avatar: this.data.avatar || null,
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
    };
  }
}
