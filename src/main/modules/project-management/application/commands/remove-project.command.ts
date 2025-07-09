import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { IProjectRepository } from "@/main/modules/project-management/domain/project.repository";

export interface RemoveProjectCommandPayload {
  id: string;
}

export class RemoveProjectCommand implements ICommand<RemoveProjectCommandPayload> {
  readonly type = "RemoveProjectCommand";
  constructor(public payload: RemoveProjectCommandPayload) {}
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
