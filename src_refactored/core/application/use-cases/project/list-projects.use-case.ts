// src_refactored/core/application/use-cases/project/list-projects.use-case.ts
import { injectable, inject } from 'inversify'; // Added for IoC

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service'; // Added ILogger

import { DomainError } from '@/domain/common/errors';
import { IProjectRepository } from '@/domain/project/ports/project-repository.interface';
import { Project } from '@/domain/project/project.entity';

import { IUseCase } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types'; // Added IoC TYPES


// Import isSuccess and isError type guards
import { Result, ok, error, isSuccess, isError } from '@/shared/result';

import {
  ListProjectsUseCaseInput,
  ListProjectsUseCaseOutput,
  ProjectListItem,
} from './list-projects.schema';

@injectable() // Added injectable
export class ListProjectsUseCase
  implements
    IUseCase<
      ListProjectsUseCaseInput,
      ListProjectsUseCaseOutput,
      DomainError
    >
{
  constructor(
    @inject(TYPES.IProjectRepository) private readonly projectRepository: IProjectRepository, // Use inject and readonly
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger, // Inject ILogger
  ) {}

  async execute(
    _input: ListProjectsUseCaseInput, // Input is not used, hence prefixed with _
  ): Promise<Result<ListProjectsUseCaseOutput, DomainError>> {
    try {
      const projectsResult = await this.projectRepository.findAll();

      if (isError(projectsResult)) { // Use type guard
        this.logger.error(
            '[ListProjectsUseCase] Error fetching all projects',
            { meta: { error: projectsResult.error, useCase: 'ListProjectsUseCase' } }
        );
        // Ensure returned error is DomainError
        return error(projectsResult.error instanceof DomainError ? projectsResult.error : new DomainError('Failed to list projects', projectsResult.error));
      }

      const projects = projectsResult.value; // Access value if success

      const outputItems: ListProjectsUseCaseOutput = projects.map(
        (project: Project): ProjectListItem => {
          // Assuming project.createdAt() returns a Date directly or a VO with toISOString()
          // If project.createdAt is a VO, it might need .value().toISOString()
          const createdAtDate = project.createdAt();

          return {
            id: project.id().value(),
            name: project.name().value(),
            createdAt: createdAtDate.toISOString(),
          };
        },
      );

      return ok(outputItems);
    } catch (e: unknown) {
      const errorToLog = e instanceof Error ? e : new Error(String(e));
      this.logger.error(
        '[ListProjectsUseCase] Unexpected error',
        { meta: { error: errorToLog, useCase: 'ListProjectsUseCase' } }
      );
      return error(new DomainError(`An unexpected error occurred while listing projects: ${errorToLog.message}`, errorToLog));
    }
  }
}
