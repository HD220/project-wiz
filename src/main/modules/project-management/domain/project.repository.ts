import { Project } from "@/main/modules/project-management/domain/project.entity";

export interface IProjectRepository {
  save(project: Project): Promise<Project>;
  findById(id: string): Promise<Project | undefined>;
  findAll(): Promise<Project[]>;
  delete(id: string): Promise<boolean>;
}
