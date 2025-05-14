import { ProjectId } from "../project/value-objects";
import { RepositoryDocsPath, RepositoryPath } from "./value-objects";
import { RepositoryId } from "./value-objects/repository-id.vo";

type SourceCodeConstructor = {
  id: RepositoryId;
  path: RepositoryPath;
  docsPath: RepositoryDocsPath;
  projectId: ProjectId;
};

export class SourceCode {
  constructor(private readonly fields: SourceCodeConstructor) {}

  get id() {
    return this.fields.id;
  }

  get path() {
    return this.fields.path;
  }

  get docsPath() {
    return this.fields.docsPath;
  }

  get projectId() {
    return this.fields.projectId;
  }
}
