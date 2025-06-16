import { ProjectDescription, ProjectId, ProjectName } from "./value-objects";

export type ProjectConstructor = {
  id: ProjectId;
  name: ProjectName;
  description: ProjectDescription;
};
export class Project {
  constructor(private readonly fields: ProjectConstructor) {}

  get id() {
    return this.fields.id;
  }
}
