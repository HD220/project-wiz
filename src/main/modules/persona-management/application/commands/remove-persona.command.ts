import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { IPersonaRepository } from "@/main/modules/persona-management/domain/persona.repository";

export interface IRemovePersonaCommandPayload {
  id: string;
}

export class RemovePersonaCommand
  implements ICommand<IRemovePersonaCommandPayload>
{
  readonly type = "RemovePersonaCommand";
  constructor(public payload: IRemovePersonaCommandPayload) {}
}

export class RemovePersonaCommandHandler {
  constructor(private personaRepository: IPersonaRepository) {}

  async handle(command: RemovePersonaCommand): Promise<boolean> {
    try {
      return await this.personaRepository.delete(command.payload.id);
    } catch (error) {
      console.error(`Failed to remove persona:`, error);
      throw new ApplicationError(`Failed to remove persona: ${(error as Error).message}`);
    }
  }
}
