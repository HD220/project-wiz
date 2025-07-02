// src_refactored/core/application/use-cases/project/get-project-details.use-case.ts
import { injectable, inject } from 'inversify'; // Added for IoC

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service'; // Added ILogger

import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors'; // Added ValueError
import { IProjectRepository } from '@/domain/project/ports/project-repository.interface';
import { ProjectId } from '@/domain/project/value-objects/project-id.vo';
import { ISourceCodeRepository } from '@/domain/source-code/ports/source-code-repository.interface';

import { IUseCase } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types'; // Added IoC TYPES


// Import isSuccess and isError type guards
import { Result, ok, error, isSuccess, isError } from '@/shared/result';

import {
  GetProjectDetailsUseCaseInput,
  GetProjectDetailsUseCaseOutput,
  SourceCodeDetails,
} from './get-project-details.schema';

@injectable() // Added injectable
export class GetProjectDetailsUseCase
  implements
    IUseCase<
      GetProjectDetailsUseCaseInput,
      GetProjectDetailsUseCaseOutput,
      DomainError | NotFoundError | ValueError // Added ValueError for fromString
    >
{
  constructor(
    @inject(TYPES.IProjectRepository) private readonly projectRepository: IProjectRepository, // Use inject and readonly
    @inject(TYPES.ISourceCodeRepository) private readonly sourceCodeRepository: ISourceCodeRepository, // Use inject and readonly
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger, // Inject ILogger
  ) {}

  async execute(
    input: GetProjectDetailsUseCaseInput,
  ): Promise<Result<GetProjectDetailsUseCaseOutput, DomainError | NotFoundError | ValueError>> {
    try {
      const projectIdVo = ProjectId.fromString(input.projectId); // Can throw ValueError

      const projectResult = await this.projectRepository.findById(projectIdVo);

      if (isError(projectResult)) { // Use type guard
        this.logger.error(
            `[GetProjectDetailsUseCase] Error fetching project ${input.projectId}`,
            { error: projectResult.error, useCase: 'GetProjectDetailsUseCase', input }
        );
        // Ensure returned error is one of the declared types
        return error(projectResult.error instanceof DomainError ? projectResult.error : new DomainError('Failed to fetch project', projectResult.error));
      }
      const project = projectResult.value;
      if (!project) {
        return error(new NotFoundError('Project', input.projectId));
      }

      let sourceCodeDetails: SourceCodeDetails | null = null;
      const sourceCodeResult = await this.sourceCodeRepository.findByProjectId(projectIdVo);

      if (isError(sourceCodeResult)) { // Use type guard
        this.logger.warn(
            `[GetProjectDetailsUseCase] Error fetching source code for project ${input.projectId}`,
            { error: sourceCodeResult.error, useCase: 'GetProjectDetailsUseCase', input }
        );
        // Do not return error here, source code is optional
      } else {
        const sourceCodeEntity = sourceCodeResult.value; // Access value if success
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
        description: project.description()?.value() || null, // Handle potentially undefined description
        createdAt: project.createdAt().toISOString(),
        updatedAt: project.updatedAt().toISOString(),
        sourceCode: sourceCodeDetails,
      };

      return ok(output);

    } catch (e: unknown) {
      const errorToLog = e instanceof Error ? e : new Error(String(e));
      if (e instanceof ValueError) { // Catch ValueError from ProjectId.fromString
          this.logger.warn(`[GetProjectDetailsUseCase] Invalid project ID format: ${input.projectId}`, { error: errorToLog, useCase: 'GetProjectDetailsUseCase', input });
          return error(e);
      }
      this.logger.error(
        `[GetProjectDetailsUseCase] Unexpected error for project ID ${input.projectId}`,
        { error: errorToLog, useCase: 'GetProjectDetailsUseCase', input }
      );
      // Ensure returned error is one of the declared types
      return error(new DomainError(`An unexpected error occurred: ${errorToLog.message}`, errorToLog));
    }
  }
}
