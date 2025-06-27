// src_refactored/core/application/use-cases/project/list-projects.use-case.ts
import { DomainError } from '@/domain/common/errors'; // Using DomainError as a general error type from repo
import { IProjectRepository } from '@/domain/project/ports/project-repository.interface';
import { Project } from '@/domain/project/project.entity';

import { IUseCase } from '@/application/common/ports/use-case.interface'; // Corrected import

import { Result, ok, error } from '@/shared/result';

import {
  ListProjectsUseCaseInput,
  ListProjectsUseCaseOutput,
  ProjectListItem, // Explicitly import if needed for mapping, though output type implies it
} from './list-projects.schema';

// Assuming IProjectRepositoryToken would be defined alongside IProjectRepository
// For now, direct constructor injection without DI framework specifics.

export class ListProjectsUseCase
  implements
    IUseCase< // Changed Executable to IUseCase
      ListProjectsUseCaseInput,
      ListProjectsUseCaseOutput,
      DomainError // Errors from repository are likely DomainErrors
    >
{
  private projectRepository: IProjectRepository;

  constructor(projectRepository: IProjectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    input: ListProjectsUseCaseInput, // Input is currently empty but defined for consistency
  ): Promise<Result<ListProjectsUseCaseOutput, DomainError>> {
    try {
      const projectsResult = await this.projectRepository.findAll();

      if (projectsResult.isError()) {
        // Propagate the error from the repository
        return error(projectsResult.value);
      }

      const projects = projectsResult.value;

      // Map Project entities to ProjectListItem DTOs
      const outputItems: ListProjectsUseCaseOutput = projects.map(
        (project: Project): ProjectListItem => {
          // Ensure createdAt is available and correctly formatted
          // The Project entity from DOM-PROJ-002 should have createdAt() method
          const createdAtVo = project.createdAt(); // Assuming this returns a Date object

          return {
            id: project.id().value(), // Access value from ProjectId VO
            name: project.name().value(), // Access value from ProjectName VO
            createdAt: createdAtVo.toISOString(), // Format Date to ISO string
          };
        },
      );

      return ok(outputItems);
    } catch (err: any) {
      // Catch unexpected errors during the process
      console.error('[ListProjectsUseCase] Unexpected error:', err);
      return error(
        new DomainError(
          `An unexpected error occurred while listing projects: ${err.message || err}`,
        ),
      );
    }
  }
}
