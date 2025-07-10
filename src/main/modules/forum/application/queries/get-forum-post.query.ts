import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { ForumPost } from "@/main/modules/forum/domain/forum-post.entity";
import { IForumPostRepository } from "@/main/modules/forum/persistence/drizzle-forum-post.repository";

export interface IGetForumPostQueryPayload {
  id: string;
}

export class GetForumPostQuery implements IQuery<IGetForumPostQueryPayload> {
  readonly type = "GetForumPostQuery";
  constructor(public payload: IGetForumPostQueryPayload) {}
}

export class GetForumPostQueryHandler {
  constructor(private forumPostRepository: IForumPostRepository) {}

  async handle(query: GetForumPostQuery): Promise<ForumPost | undefined> {
    try {
      return await this.forumPostRepository.findById(query.payload.id);
    } catch (error) {
      console.error(`Failed to get forum post:`, error);
      throw new ApplicationError(`Failed to get forum post: ${(error as Error).message}`);
    }
  }
}
