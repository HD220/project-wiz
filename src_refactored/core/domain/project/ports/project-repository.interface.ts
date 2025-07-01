import { Result } from "../../../../shared/result";
import { Project } from "../project.entity";
import { ProjectId } from "../value-objects/project-id.vo";

export interface IProjectRepository {
  save(project: Project): Promise<Result<void>>;
  findById(id: ProjectId): Promise<Result<Project | null>>;
  findAll(): Promise<Result<Project[]>>;
}
