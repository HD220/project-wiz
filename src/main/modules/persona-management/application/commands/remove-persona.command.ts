import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { IPersonaRepository } from "@/main/modules/persona-management/domain/persona.repository";

export interface RemovePersonaCommandPayload {
  id: string;
}

export class RemovePersonaCommand implements ICommand<RemovePersonaCommandPayload> {
  readonly type = "RemovePersonaCommand";
  constructor(public payload: RemovePersonaCommandPayload) {}
}

export class RemovePersonaCommandHandler {
  constructor(private personaRepository: IPersonaRepository) {}

  async handle(command: RemovePersonaCommand): Promise<boolean> {
    try {
      return await this.personaRepository.delete(command.payload.id);
    } catch (error) {
      console.error(`Failed to remove persona:`, error);
      throw new Error(`Failed to remove persona: ${(error as Error).message}`);
    }
  }
}
