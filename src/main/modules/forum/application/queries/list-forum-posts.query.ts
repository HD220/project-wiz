import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { ForumPost } from "@/main/modules/forum/domain/forum-post.entity";
import { IForumPostRepository } from "@/main/modules/forum/persistence/drizzle-forum-post.repository";

export interface IListForumPostsQueryPayload {
  topicId: string;
}

export class ListForumPostsQuery
  implements IQuery<IListForumPostsQueryPayload>
{
  readonly type = "ListForumPostsQuery";
  constructor(public payload: IListForumPostsQueryPayload) {}
}

export class ListForumPostsQueryHandler {
  constructor(private forumPostRepository: IForumPostRepository) {}

  async handle(query: ListForumPostsQuery): Promise<ForumPost[]> {
    try {
      return await this.forumPostRepository.findByTopicId(
        query.payload.topicId,
      );
    } catch (error) {
      console.error(`Failed to list forum posts:`, error);
      throw new ApplicationError(
        `Failed to list forum posts: ${(error as Error).message}`,
      );
  }
}
