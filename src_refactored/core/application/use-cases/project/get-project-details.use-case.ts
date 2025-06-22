// src_refactored/core/application/use-cases/project/get-project-details.use-case.ts
import { Executable } from '../../../common/executable';
import {
  GetProjectDetailsUseCaseInput,
  GetProjectDetailsUseCaseOutput,
  SourceCodeDetails,
} from './get-project-details.schema';
import { IProjectRepository } from '../../../../domain/project/ports/project-repository.interface';
import { ProjectId } from '../../../../domain/project/value-objects/project-id.vo';
import { ISourceCodeRepository } from '../../../../domain/source-code/ports/source-code-repository.interface';
import { Result, ok, error } from '../../../../../shared/result';
import { DomainError, NotFoundError } from '../../../../common/errors';

export class GetProjectDetailsUseCase
  implements
    Executable<
      GetProjectDetailsUseCaseInput,
      GetProjectDetailsUseCaseOutput,
      DomainError | NotFoundError // Possible error types
    >
{
  private projectRepository: IProjectRepository;
  private sourceCodeRepository: ISourceCodeRepository;

  constructor(
    projectRepository: IProjectRepository,
    sourceCodeRepository: ISourceCodeRepository,
  ) {
    this.projectRepository = projectRepository;
    this.sourceCodeRepository = sourceCodeRepository;
  }

  async execute(
    input: GetProjectDetailsUseCaseInput,
  ): Promise<Result<GetProjectDetailsUseCaseOutput, DomainError | NotFoundError>> {
    try {
      const projectIdVo = ProjectId.fromString(input.projectId);

      // 1. Fetch Project
      const projectResult = await this.projectRepository.findById(projectIdVo);
      if (projectResult.isError()) {
        return error(projectResult.value); // Propagate repository error
      }
      const project = projectResult.value;
      if (!project) {
        return error(new NotFoundError(`Project with ID ${input.projectId} not found.`));
      }

      // 2. Fetch SourceCode
      let sourceCodeDetails: SourceCodeDetails | null = null;
      const sourceCodeResult = await this.sourceCodeRepository.findByProjectId(projectIdVo);

      if (sourceCodeResult.isError()) {
        // Log this error but don't necessarily fail the whole use case if project exists
        // Or, decide if this should be a hard failure. For now, let's allow project details without source code details on error.
        console.warn(`[GetProjectDetailsUseCase] Error fetching source code for project ${input.projectId}: ${sourceCodeResult.value.message}`);
        // If SourceCode must exist or its fetch error is critical, uncomment below:
        // return error(new DomainError(`Failed to fetch source code details: ${sourceCodeResult.value.message}`));
      } else {
        const sourceCodeEntity = sourceCodeResult.value;
        if (sourceCodeEntity) {
          sourceCodeDetails = {
            id: sourceCodeEntity.id().value(),
            repositoryPath: sourceCodeEntity.path().value(), // path() is RepositoryPath, then .value() for string
            docsPath: sourceCodeEntity.docsPath()?.value() || null, // docsPath() is RepositoryDocsPath | undefined
          };
        }
      }

      // 3. Map to Output DTO
      const output: GetProjectDetailsUseCaseOutput = {
        id: project.id().value(),
        name: project.name().value(),
        description: project.description().value(), // ProjectDescription.value() returns string
        createdAt: project.createdAt().toISOString(),
        updatedAt: project.updatedAt().toISOString(),
        sourceCode: sourceCodeDetails,
      };

      return ok(output);

    } catch (err: any) {
      // Catch unexpected errors (e.g., VO creation if input.projectId is malformed, though Zod should catch it before)
      console.error(`[GetProjectDetailsUseCase] Unexpected error for project ID ${input.projectId}:`, err);
      return error(
        new DomainError(
          `An unexpected error occurred while fetching details for project ${input.projectId}: ${err.message || err}`,
        ),
      );
    }
  }
}
