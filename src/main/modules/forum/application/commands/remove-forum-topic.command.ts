import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { IForumTopicRepository } from "@/main/modules/forum/persistence/drizzle-forum-topic.repository";

export interface RemoveForumTopicCommandPayload {
  id: string;
}

export class RemoveForumTopicCommand implements ICommand<RemoveForumTopicCommandPayload> {
  readonly type = "RemoveForumTopicCommand";
  constructor(public payload: RemoveForumTopicCommandPayload) {}
}

export class RemoveForumTopicCommandHandler {
  constructor(private forumTopicRepository: IForumTopicRepository) {}

  async handle(command: RemoveForumTopicCommand): Promise<boolean> {
    try {
      return await this.forumTopicRepository.delete(command.payload.id);
    } catch (error) {
      console.error(`Failed to remove forum topic:`, error);
      throw new Error(`Failed to remove forum topic: ${(error as Error).message}`);
    }
  }
}