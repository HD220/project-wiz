import { Project, ProjectCreationProps, ProjectUpdateProps } from "../entities/project";

export interface IProjectRepository {
  getAllProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  createProject(projectProps: ProjectCreationProps): Promise<Project>;
  updateProject(id: string, updates: ProjectUpdateProps): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;
}
