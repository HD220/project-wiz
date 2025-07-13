import type { ProjectSchema, CreateProjectSchema } from '../../persistence/schemas';

export interface ProjectFilterOptions {
  status?: "active" | "inactive" | "archived";
  limit?: number;
  offset?: number;
}

export interface IProjectRepository {
  save(data: CreateProjectSchema): Promise<ProjectSchema>;
  findById(id: string): Promise<ProjectSchema | null>;
  findByName(name: string): Promise<ProjectSchema | null>;
  findAll(filter?: ProjectFilterOptions): Promise<ProjectSchema[]>;
  update(id: string, data: Partial<CreateProjectSchema>): Promise<ProjectSchema>;
  delete(id: string): Promise<void>;
  findByStatus(status: "active" | "inactive" | "archived"): Promise<ProjectSchema[]>;
}