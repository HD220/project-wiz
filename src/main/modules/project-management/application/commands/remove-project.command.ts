import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { IProjectRepository } from "@/main/modules/project-management/domain/project.repository";

export interface IRemoveProjectCommandPayload {
  id: string;
}

export class RemoveProjectCommand
  implements ICommand<IRemoveProjectCommandPayload>
{
  readonly type = "RemoveProjectCommand";
  constructor(public payload: IRemoveProjectCommandPayload) {}
}

export class RemoveProjectCommandHandler {
  constructor(private projectRepository: IProjectRepository) {}

  async handle(command: RemoveProjectCommand): Promise<boolean> {
    try {
      return await this.projectRepository.delete(command.payload.id);
    } catch (error) {
      console.error(`Failed to remove project:`, error);
      throw new Error(`Failed to remove project: ${(error as Error).message}`);
    }
  }
}
