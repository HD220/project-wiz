import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { ForumTopic } from "@/main/modules/forum/domain/forum-topic.entity";
import { IForumTopicRepository } from "@/main/modules/forum/persistence/drizzle-forum-topic.repository";

export interface ICreateForumTopicCommandPayload {
  title: string;
  authorId: string;
}

export class CreateForumTopicCommand
  implements ICommand<ICreateForumTopicCommandPayload>
{
  readonly type = "CreateForumTopicCommand";
  constructor(public payload: ICreateForumTopicCommandPayload) {}
}

export class CreateForumTopicCommandHandler {
  constructor(private forumTopicRepository: IForumTopicRepository) {}

  async handle(command: CreateForumTopicCommand): Promise<ForumTopic> {
    const topic = new ForumTopic({
      title: command.payload.title,
      authorId: command.payload.authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    try {
      return await this.forumTopicRepository.save(topic);
    } catch (error) {
      console.error(`Failed to create forum topic:`, error);
      throw new Error(
        `Failed to create forum topic: ${(error as Error).message}`,
      );
    }
  }
}
