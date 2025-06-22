// src_refactored/core/domain/project/ports/project-repository.interface.ts
import { Result } from '../../../../shared/result'; // Assuming shared Result type
import { Project } from '../project.entity';
import { ProjectId } from '../value-objects/project-id.vo';

export interface IProjectRepository {
  save(project: Project): Promise<Result<void>>;
  findById(id: ProjectId): Promise<Result<Project | null>>;
  findAll(): Promise<Result<Project[]>>;
  // delete(id: ProjectId): Promise<Result<void>>; // Optional: if deletion is a requirement
}
