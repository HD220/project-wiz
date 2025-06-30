// src_refactored/core/application/use-cases/project/list-projects.use-case.ts
import { DomainError } from '@/domain/common/errors';
import { IProjectRepository } from '@/domain/project/ports/project-repository.interface';
import { Project } from '@/domain/project/project.entity';

import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result, ok, error } from '@/shared/result';

import {
  ListProjectsUseCaseInput,
  ListProjectsUseCaseOutput,
  ProjectListItem,
} from './list-projects.schema';

export class ListProjectsUseCase
  implements
    IUseCase<
      ListProjectsUseCaseInput,
      ListProjectsUseCaseOutput,
      DomainError
    >
{
  private projectRepository: IProjectRepository;

  constructor(projectRepository: IProjectRepository) {
    this.projectRepository = projectRepository;
  }

  async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    input: ListProjectsUseCaseInput,
  ): Promise<Result<ListProjectsUseCaseOutput, DomainError>> {
    try {
      const projectsResult = await this.projectRepository.findAll();

      if (projectsResult.isError()) {
        return error(projectsResult.value);
      }

      const projects = projectsResult.value;

      const outputItems: ListProjectsUseCaseOutput = projects.map(
        (project: Project): ProjectListItem => {
          const createdAtVo = project.createdAt();

          return {
            id: project.id().value(),
            name: project.name().value(),
            createdAt: createdAtVo.toISOString(),
          };
        },
      );

      return ok(outputItems);
    } catch (err: unknown) {
      console.error('[ListProjectsUseCase] Unexpected error:', err);
      const message = err instanceof Error ? err.message : String(err);
      return error(
        new DomainError(
          `An unexpected error occurred while listing projects: ${message}`,
        ),
      );
    }
  }
}
