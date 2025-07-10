import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { ForumTopic } from "@/main/modules/forum/domain/forum-topic.entity";
import { IForumTopicRepository } from "@/main/modules/forum/persistence/drizzle-forum-topic.repository";

export interface IUpdateForumTopicCommandPayload {
  id: string;
  title: string;
}

export class UpdateForumTopicCommand
  implements ICommand<IUpdateForumTopicCommandPayload>
{
  readonly type = "UpdateForumTopicCommand";
  constructor(public payload: IUpdateForumTopicCommandPayload) {}
}

export class UpdateForumTopicCommandHandler {
  constructor(private forumTopicRepository: IForumTopicRepository) {}

  async handle(command: UpdateForumTopicCommand): Promise<ForumTopic> {
    try {
      const existingTopic = await this.forumTopicRepository.findById(
        command.payload.id,
      );

      if (existingTopic) {
        existingTopic.updateTitle(command.payload.title);
        return await this.forumTopicRepository.save(existingTopic);
      }
      throw new Error(`Forum topic with ID ${command.payload.id} not found.`);
    } catch (error) {
      console.error(`Failed to update forum topic:`, error);
      throw new Error(
        `Failed to update forum topic: ${(error as Error).message}`,
      );
    }
  }
}
