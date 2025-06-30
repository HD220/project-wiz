// src_refactored/core/application/use-cases/project/get-project-details.use-case.ts
import { DomainError, NotFoundError } from '@/domain/common/errors';
import { IProjectRepository } from '@/domain/project/ports/project-repository.interface';
import { ProjectId } from '@/domain/project/value-objects/project-id.vo';
import { ISourceCodeRepository } from '@/domain/source-code/ports/source-code-repository.interface';

import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result, ok, error } from '@/shared/result';

import {
  GetProjectDetailsUseCaseInput,
  GetProjectDetailsUseCaseOutput,
  SourceCodeDetails,
} from './get-project-details.schema';

export class GetProjectDetailsUseCase
  implements
    IUseCase<
      GetProjectDetailsUseCaseInput,
      GetProjectDetailsUseCaseOutput,
      DomainError | NotFoundError
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

      const projectResult = await this.projectRepository.findById(projectIdVo);
      if (projectResult.isError()) {
        return error(projectResult.value);
      }
      const project = projectResult.value;
      if (!project) {
        return error(new NotFoundError(`Project with ID ${input.projectId} not found.`));
      }

      let sourceCodeDetails: SourceCodeDetails | null = null;
      const sourceCodeResult = await this.sourceCodeRepository.findByProjectId(projectIdVo);

      if (sourceCodeResult.isError()) {
        console.warn(`[GetProjectDetailsUseCase] Error fetching source code for project ${input.projectId}: ${sourceCodeResult.value.message}`);
      } else {
        const sourceCodeEntity = sourceCodeResult.value;
        if (sourceCodeEntity) {
          sourceCodeDetails = {
            id: sourceCodeEntity.id().value(),
            repositoryPath: sourceCodeEntity.path().value(),
            docsPath: sourceCodeEntity.docsPath()?.value() || null,
          };
        }
      }

      const output: GetProjectDetailsUseCaseOutput = {
        id: project.id().value(),
        name: project.name().value(),
        description: project.description().value(),
        createdAt: project.createdAt().toISOString(),
        updatedAt: project.updatedAt().toISOString(),
        sourceCode: sourceCodeDetails,
      };

      return ok(output);

    } catch (err: unknown) {
      console.error(`[GetProjectDetailsUseCase] Unexpected error for project ID ${input.projectId}:`, err);
      const message = err instanceof Error ? err.message : String(err);
      return error(
        new DomainError(
          `An unexpected error occurred while fetching details for project ${input.projectId}: ${message}`,
        ),
      );
    }
  }
}
