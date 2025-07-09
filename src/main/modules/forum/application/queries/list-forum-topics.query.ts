import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ForumTopic } from "@/main/modules/forum/domain/forum-topic.entity";
import { IForumTopicRepository } from "@/main/modules/forum/persistence/drizzle-forum-topic.repository";

export type ListForumTopicsQueryPayload = Record<string, never>;

export class ListForumTopicsQuery implements IQuery<ListForumTopicsQueryPayload> {
  readonly type = "ListForumTopicsQuery";
  constructor(public payload: ListForumTopicsQueryPayload = {}) {}
}

export class ListForumTopicsQueryHandler {
  constructor(private forumTopicRepository: IForumTopicRepository) {}

  async handle(_query: ListForumTopicsQuery): Promise<ForumTopic[]> {
    try {
      return await this.forumTopicRepository.findAll();
    } catch (error) {
      console.error(`Failed to list forum topics:`, error);
      throw new Error(`Failed to list forum topics: ${(error as Error).message}`);
    }
  }
}