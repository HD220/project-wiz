import { ProjectIdentity, ProjectName } from "../value-objects";

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

  static create(props: { id?: string; name: string }): Project {
    const identity = new ProjectIdentity(props.id || crypto.randomUUID());
    const name = new ProjectName(props.name);
    return new Project(identity, name);
  }
}
