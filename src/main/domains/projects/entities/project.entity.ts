import { ProjectIdentity } from "../value-objects";

import { Channel } from "./channel.entity";
import { ProjectData } from "./project-data.entity";

export class Project {
  constructor(
    private readonly identity: ProjectIdentity,
    private readonly data: ProjectData,
  ) {}

  getId(): string {
    return this.identity.getValue();
  }

  getName(): string {
    return this.data.getName().getValue();
  }

  getDescription(): string {
    return this.data.getDescription().getValue();
  }

  getGitUrl(): string | null {
    return this.data.getGitUrl().getValue();
  }

  getStatus(): string {
    return this.data.getStatus().getValue();
  }

  getAvatar(): string | null {
    return this.data.getAvatar();
  }

  getCreatedAt(): Date {
    return this.data.getCreatedAt();
  }

  getUpdatedAt(): Date {
    return this.data.getUpdatedAt();
  }

  createChannel(props: { name: string; description?: string }): Channel {
    return Channel.create({
      name: props.name,
      projectId: this.getId(),
      description: props.description,
    });
  }

  createGeneralChannel(): Channel {
    return Channel.createGeneral(this.getId());
  }

  touchUpdatedAt(): void {
    this.data.touchUpdatedAt();
  }

  toPlainObject() {
    return {
      id: this.getId(),
      name: this.getName(),
      description: this.getDescription(),
      gitUrl: this.getGitUrl(),
      status: this.getStatus(),
      avatar: this.getAvatar(),
      createdAt: this.getCreatedAt(),
      updatedAt: this.getUpdatedAt(),
    };
  }

  static create(props: {
    id?: string;
    name: string;
    description?: string | null;
    gitUrl?: string | null;
    status?: string;
    avatar?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Project {
    const identity = new ProjectIdentity(props.id || crypto.randomUUID());
    const data = ProjectData.create({
      name: props.name,
      description: props.description,
      gitUrl: props.gitUrl,
      status: props.status,
      avatar: props.avatar,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });

    return new Project(identity, data);
  }
}
