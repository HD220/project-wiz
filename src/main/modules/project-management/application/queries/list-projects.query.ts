import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { Project } from "@/main/modules/project-management/domain/project.entity";
import { IProjectRepository } from "@/main/modules/project-management/domain/project.repository";

export type ListProjectsQueryPayload = void;

export class ListProjectsQuery implements IQuery<ListProjectsQueryPayload> {
  readonly type = "ListProjects";
  constructor(public payload: ListProjectsQueryPayload = undefined) {}
}

export class ListProjectsQueryHandler {
  constructor(private projectRepository: IProjectRepository) {}

  async handle(_query: ListProjectsQuery): Promise<Project[]> {
    try {
      return await this.projectRepository.findAll();
    } catch (error) {
      console.error(`Failed to list projects:`, error);
      throw new Error(`Failed to list projects: ${(error as Error).message}`);
    }
  }
}
