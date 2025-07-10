import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { Project } from "@/main/modules/project-management/domain/project.entity";
import { IProjectRepository } from "@/main/modules/project-management/domain/project.repository";

export interface CreateProjectCommandPayload {
  name: string;
}

export class CreateProjectCommand
  implements ICommand<CreateProjectCommandPayload>
{
  readonly type = "CreateProjectCommand";
  constructor(public payload: CreateProjectCommandPayload) {}
}

export class CreateProjectCommandHandler {
  constructor(private projectRepository: IProjectRepository) {}

  async handle(command: CreateProjectCommand): Promise<Project> {
    const project = new Project({
      name: command.payload.name,
      createdAt: new Date(),
    });
    try {
      return await this.projectRepository.save(project);
    } catch (error) {
      console.error(`Failed to create project:`, error);
      throw new Error(`Failed to create project: ${(error as Error).message}`);
    }
  }
}
