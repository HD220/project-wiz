import { Project } from "../entities/project.entity";

export interface ProjectRepository {
  save(project: Project): Promise<void>;
  findById(id: string): Promise<Project | null>;
  findByName(name: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  update(project: Project): Promise<void>;
  delete(id: string): Promise<void>;
}