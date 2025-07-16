import { ProjectIdentity, ProjectName } from "../value-objects";
import { Channel } from "./channel.entity";

export class Project {
  constructor(
    private readonly id: ProjectIdentity,
    private readonly name: ProjectName,
  ) {}

  getId(): string {
    return this.id.getValue();
  }

  getName(): string {
    return this.name.getValue();
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

  static create(props: { id?: string; name: string }): Project {
    const identity = new ProjectIdentity(props.id || crypto.randomUUID());
    const name = new ProjectName(props.name);
    return new Project(identity, name);
  }
}
