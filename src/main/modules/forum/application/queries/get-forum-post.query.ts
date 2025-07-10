import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ForumPost } from "@/main/modules/forum/domain/forum-post.entity";
import { IForumPostRepository } from "@/main/modules/forum/persistence/drizzle-forum-post.repository";

export interface GetForumPostQueryPayload {
  id: string;
}

export class GetForumPostQuery implements IQuery<GetForumPostQueryPayload> {
  readonly type = "GetForumPostQuery";
  constructor(public payload: GetForumPostQueryPayload) {}
}

export class GetForumPostQueryHandler {
  constructor(private forumPostRepository: IForumPostRepository) {}

  async handle(query: GetForumPostQuery): Promise<ForumPost | undefined> {
    try {
      return await this.forumPostRepository.findById(query.payload.id);
    } catch (error) {
      console.error(`Failed to get forum post:`, error);
      throw new Error(`Failed to get forum post: ${(error as Error).message}`);
    }
  }
}
