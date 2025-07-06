

import { ProjectId } from "../../project/value-objects/project-id.vo";
import { SourceCode } from "../source-code.entity";
import { RepositoryId } from "../value-objects/repository-id.vo";

export interface ISourceCodeRepository {
  save(sourceCode: SourceCode): Promise<void>;
  findById(id: RepositoryId): Promise<SourceCode | null>;
  findByProjectId(projectId: ProjectId): Promise<SourceCode | null>;
  // delete(id: RepositoryId): Promise<void>; // Optional
}
