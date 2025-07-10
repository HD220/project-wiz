import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ForumTopic } from "@/main/modules/forum/domain/forum-topic.entity";
import { IForumTopicRepository } from "@/main/modules/forum/persistence/drizzle-forum-topic.repository";

export interface GetForumTopicQueryPayload {
  id: string;
}

export class GetForumTopicQuery implements IQuery<GetForumTopicQueryPayload> {
  readonly type = "GetForumTopicQuery";
  constructor(public payload: GetForumTopicQueryPayload) {}
}

export class GetForumTopicQueryHandler {
  constructor(private forumTopicRepository: IForumTopicRepository) {}

  async handle(query: GetForumTopicQuery): Promise<ForumTopic | undefined> {
    try {
      return await this.forumTopicRepository.findById(query.payload.id);
    } catch (error) {
      console.error(`Failed to get forum topic:`, error);
      throw new Error(`Failed to get forum topic: ${(error as Error).message}`);
    }
  }
}
