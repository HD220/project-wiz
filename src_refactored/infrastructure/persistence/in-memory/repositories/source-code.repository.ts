import { injectable } from 'inversify';

import { ProjectId } from '@/core/domain/project/value-objects/project-id.vo';
import { ISourceCodeRepository } from '@/core/domain/source-code/ports/source-code-repository.interface';
import { SourceCode } from '@/core/domain/source-code/source-code.entity';
import { RepositoryIdVO as SourceCodeId } from '@/core/domain/source-code/value-objects/repository-id.vo';

import { NotFoundError } from '@/shared/errors/core.error';

@injectable()
export class InMemorySourceCodeRepository implements ISourceCodeRepository {
  private readonly sourceCodes: Map<string, SourceCode> = new Map();

  async save(sourceCode: SourceCode): Promise<void> {
    this.sourceCodes.set(sourceCode.id.value, sourceCode);
  }

  async findById(id: SourceCodeId): Promise<SourceCode | null> {
    const sourceCode = this.sourceCodes.get(id.value);
    return sourceCode || null;
  }

  async findByProjectId(projectId: ProjectId): Promise<SourceCode[]> {
    const found = Array.from(this.sourceCodes.values()).filter((sc) =>
      sc.projectId.equals(projectId),
    );
    return found;
  }

  async delete(id: SourceCodeId): Promise<void> {
    if (!this.sourceCodes.has(id.value)) {
      throw new NotFoundError(`SourceCode with ID ${id.value} not found.`);
    }
    this.sourceCodes.delete(id.value);
  }
}
