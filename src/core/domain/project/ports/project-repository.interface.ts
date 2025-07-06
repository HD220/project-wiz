import { Project } from "../project.entity";
import { ProjectId } from "../value-objects/project-id.vo";

export interface IProjectRepository {
  save(project: Project): Promise<Project>;
  findById(id: ProjectId): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  delete(id: ProjectId): Promise<void>;
}