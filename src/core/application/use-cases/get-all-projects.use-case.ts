import { Project } from "../../domain/entities/project";
import { IProjectRepository } from "../../domain/repositories/project.repository";

export class GetAllProjectsUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(): Promise<Project[]> {
    return this.projectRepository.getAllProjects();
  }
}
