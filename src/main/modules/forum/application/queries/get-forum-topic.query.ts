import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { ForumTopic } from "@/main/modules/forum/domain/forum-topic.entity";
import { IForumTopicRepository } from "@/main/modules/forum/persistence/drizzle-forum-topic.repository";

export interface IGetForumTopicQueryPayload {
  id: string;
}

export class GetForumTopicQuery implements IQuery<IGetForumTopicQueryPayload> {
  readonly type = "GetForumTopicQuery";
  constructor(public payload: IGetForumTopicQueryPayload) {}
}

export class GetForumTopicQueryHandler {
  constructor(private forumTopicRepository: IForumTopicRepository) {}

  async handle(query: GetForumTopicQuery): Promise<ForumTopic | undefined> {
    try {
      return await this.forumTopicRepository.findById(query.payload.id);
    } catch (error) {
      console.error(`Failed to get forum topic:`, error);
      throw new ApplicationError(`Failed to get forum topic: ${(error as Error).message}`);
    }
  }
}
