

import { ProjectId } from "../../project/value-objects/project-id.vo";
import { SourceCode } from "../source-code.entity";
import { RepositoryId } from "../value-objects/repository-id.vo";

export interface ISourceCodeRepository {
  save(sourceCode: SourceCode): Promise<Result<void>>;
  findById(id: RepositoryId): Promise<Result<SourceCode | null>>;
  findByProjectId(projectId: ProjectId): Promise<Result<SourceCode | null>>;
  // delete(id: RepositoryId): Promise<Result<void>>; // Optional
}
