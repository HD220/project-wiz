import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { IForumTopicRepository } from "@/main/modules/forum/persistence/drizzle-forum-topic.repository";

export interface IRemoveForumTopicCommandPayload {
  id: string;
}

export class RemoveForumTopicCommand
  implements ICommand<IRemoveForumTopicCommandPayload>
{
  readonly type = "RemoveForumTopicCommand";
  constructor(public payload: IRemoveForumTopicCommandPayload) {}
}

export class RemoveForumTopicCommandHandler {
  constructor(private forumTopicRepository: IForumTopicRepository) {}

  async handle(command: RemoveForumTopicCommand): Promise<boolean> {
    try {
      return await this.forumTopicRepository.delete(command.payload.id);
    } catch (error) {
      console.error(`Failed to remove forum topic:`, error);
      throw new ApplicationError(
        `Failed to remove forum topic: ${(error as Error).message}`,
      );
  }
}
