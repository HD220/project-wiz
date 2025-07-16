import {
  ChannelName,
  ChannelDescription,
  ProjectIdentity,
} from "../value-objects";

export class Channel {
  constructor(
    private readonly identity: string,
    private readonly name: ChannelName,
    private readonly description: ChannelDescription,
    private readonly projectId: ProjectIdentity,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  static create(props: {
    id?: string;
    name: string;
    projectId: string;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Channel {
    const identity = props.id || crypto.randomUUID();
    return new Channel(
      identity,
      new ChannelName(props.name),
      new ChannelDescription(props.description || null),
      new ProjectIdentity(props.projectId),
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  getId(): string {
    return this.identity;
  }

  getName(): string {
    return this.name.getValue();
  }

  getDescription(): string | null {
    return this.description.getValue();
  }

  getProjectId(): string {
    return this.projectId.getValue();
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  static createGeneral(projectId: string): Channel {
    return Channel.create({
      name: "general",
      projectId,
      description: "Canal geral do projeto",
    });
  }

  toPlainObject() {
    return {
      id: this.identity,
      name: this.getName(),
      description: this.getDescription(),
      projectId: this.getProjectId(),
      createdAt: this.getCreatedAt(),
      updatedAt: this.getUpdatedAt(),
    };
  }
}
