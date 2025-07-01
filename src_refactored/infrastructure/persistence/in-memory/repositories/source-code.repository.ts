import { injectable } from "inversify";

import { ProjectId } from "@/core/domain/project/value-objects/project-id.vo";
import { ISourceCodeRepository } from "@/core/domain/source-code/ports/source-code-repository.interface";
import { SourceCode } from "@/core/domain/source-code/source-code.entity";
import { RepositoryIdVO as SourceCodeId } from "@/core/domain/source-code/value-objects/repository-id.vo";

import { Result, Ok, Err } from "@/shared/result";

@injectable()
export class InMemorySourceCodeRepository implements ISourceCodeRepository {
  private readonly sourceCodes: Map<string, SourceCode> = new Map();

  async save(sourceCode: SourceCode): Promise<Result<void, Error>> {
    this.sourceCodes.set(sourceCode.id.value, sourceCode);
    return Ok(undefined);
  }

  async findById(id: SourceCodeId): Promise<Result<SourceCode | null, Error>> {
    const sourceCode = this.sourceCodes.get(id.value);
    return Ok(sourceCode || null);
  }

  async findByProjectId(
    projectId: ProjectId
  ): Promise<Result<SourceCode[], Error>> {
    const found = Array.from(this.sourceCodes.values()).filter((sc) =>
      sc.projectId.equals(projectId)
    );
    return Ok(found);
  }

  async delete(id: SourceCodeId): Promise<Result<void, Error>> {
    if (!this.sourceCodes.has(id.value)) {
      return Err(new Error(`SourceCode with ID ${id.value} not found.`));
    }
    this.sourceCodes.delete(id.value);
    return Ok(undefined);
  }
}
