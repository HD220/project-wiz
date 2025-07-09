import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ForumPost } from "@/main/modules/forum/domain/forum-post.entity";
import { IForumPostRepository } from "@/main/modules/forum/persistence/drizzle-forum-post.repository";

export interface ListForumPostsQueryPayload {
  topicId: string;
}

export class ListForumPostsQuery implements IQuery<ListForumPostsQueryPayload> {
  readonly type = "ListForumPostsQuery";
  constructor(public payload: ListForumPostsQueryPayload) {}
}

export class ListForumPostsQueryHandler {
  constructor(private forumPostRepository: IForumPostRepository) {}

  async handle(query: ListForumPostsQuery): Promise<ForumPost[]> {
    try {
      return await this.forumPostRepository.findByTopicId(query.payload.topicId);
    } catch (error) {
      console.error(`Failed to list forum posts:`, error);
      throw new Error(`Failed to list forum posts: ${(error as Error).message}`);
    }
  }
}