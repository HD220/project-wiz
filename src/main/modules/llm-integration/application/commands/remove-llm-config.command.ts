import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { ILlmConfigRepository } from "@/main/modules/llm-integration/domain/llm-config.repository";

export interface IRemoveLlmConfigCommandPayload {
  id: string;
}

export class RemoveLlmConfigCommand
  implements ICommand<IRemoveLlmConfigCommandPayload>
{
  readonly type = "RemoveLlmConfigCommand";
  constructor(public payload: IRemoveLlmConfigCommandPayload) {}
}

export class RemoveLlmConfigCommandHandler {
  constructor(private llmConfigRepository: ILlmConfigRepository) {}

  async handle(command: RemoveLlmConfigCommand): Promise<boolean> {
    try {
      return await this.llmConfigRepository.delete(command.payload.id);
    } catch (error) {
      console.error(`Failed to remove LLM config:`, error);
      throw new ApplicationError(
        `Failed to remove LLM config: ${(error as Error).message}`,
      );
    }
  }
}
