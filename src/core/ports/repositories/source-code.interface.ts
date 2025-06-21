import { IRepository } from '@/core/common/repository';
import { SourceCode } from '@/core/domain/entities/source-code';
// RepositoryId is implicitly part of IRepository<typeof SourceCode> through ConstructorParameters<typeof SourceCode>[0]['id']
// but can be imported for clarity if needed elsewhere, though not strictly for this interface change.
// import { RepositoryId } from '@/core/domain/entities/source-code/value-objects';
import { ProjectId } from '@/core/domain/entities/project/value-objects';
import { Result } from '@/shared/result';

export interface ISourceCodeRepository extends IRepository<typeof SourceCode> {
    findByProjectId(projectId: ProjectId): Promise<Result<SourceCode[]>>;
}
