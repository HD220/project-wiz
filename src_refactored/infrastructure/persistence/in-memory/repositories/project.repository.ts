// src_refactored/infrastructure/persistence/in-memory/repositories/project.repository.ts
import { injectable } from 'inversify';

import { IProjectRepository } from '@/core/domain/project/ports/project-repository.interface';
import { Project } from '@/core/domain/project/project.entity';
import { ProjectId } from '@/core/domain/project/value-objects/project-id.vo';

import { DomainError, NotFoundError } from '@/domain/common/errors';

import { Result, Ok, Err } from '@/shared/result';

@injectable()
export class InMemoryProjectRepository implements IProjectRepository {
  private readonly projects: Map<string, Project> = new Map();

  async save(project: Project): Promise<Result<Project, DomainError>> {
    this.projects.set(project.id.value, project);
    return Ok(project);
  }

  async findById(id: ProjectId): Promise<Result<Project | null, DomainError>> {
    const project = this.projects.get(id.value);
    return Ok(project || null);
  }

  async findByName(name: string): Promise<Result<Project | null, DomainError>> {
    for (const project of this.projects.values()) {
      if (project.name.value === name) { // Assuming name is a VO with a value property
        return Ok(project);
      }
    }
    return Ok(null);
  }

  async listAll(): Promise<Result<Project[], DomainError>> {
    return Ok(Array.from(this.projects.values()));
  }

  async delete(id: ProjectId): Promise<Result<void, DomainError | NotFoundError>> {
    if (!this.projects.has(id.value)) {
      return Err(new NotFoundError(`Project with ID ${id.value} not found.`));
    }
    this.projects.delete(id.value);
    return Ok(undefined);
  }
}
