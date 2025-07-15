import {
  ChannelName,
  ChannelDescription,
  ChannelPrivacy,
  ProjectIdentity,
} from "../value-objects";

interface ChannelData {
  name: ChannelName;
  description: ChannelDescription;
  privacy: ChannelPrivacy;
  projectId: ProjectIdentity;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Channel {
  private readonly identity: string;
  private data: ChannelData;

  constructor(props: {
    id?: string;
    name: string;
    projectId: string;
    createdBy: string;
    isPrivate?: boolean;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.identity = props.id || crypto.randomUUID();
    this.data = this.buildChannelData(props);
  }

  private buildChannelData(props: {
    name: string;
    projectId: string;
    createdBy: string;
    isPrivate?: boolean;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): ChannelData {
    return {
      name: new ChannelName(props.name),
      description: new ChannelDescription(props.description),
      privacy: new ChannelPrivacy(props.isPrivate || false),
      projectId: new ProjectIdentity(props.projectId),
      createdBy: props.createdBy,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  getId(): string {
    return this.identity;
  }

  getName(): string {
    return this.data.name.getValue();
  }

  getProjectId(): string {
    return this.data.projectId.getValue();
  }

  canBeAccessedBy(userId: string): boolean {
    if (this.data.privacy.isPublic()) return true;
    return this.data.createdBy === userId;
  }

  isPrivate(): boolean {
    return this.data.privacy.isPrivate();
  }

  isEditable(): boolean {
    return true;
  }

  canBeDeleted(): boolean {
    return true;
  }

  private touchUpdatedAt(): void {
    this.data.updatedAt = new Date();
  }

  static createGeneral(projectId: string, createdBy: string): Channel {
    return new Channel({
      name: "geral",
      projectId,
      createdBy,
      isPrivate: false,
      description: "Canal principal do projeto",
    });
  }

  toPlainObject(): {
    id: string;
    name: string;
    projectId: string;
    createdBy: string;
    isPrivate: boolean;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.identity,
      name: this.data.name.getValue(),
      projectId: this.data.projectId.getValue(),
      createdBy: this.data.createdBy,
      isPrivate: this.data.privacy.getValue(),
      description: this.data.description.getValue(),
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
    };
  }
}
