import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { ForumPost } from "@/main/modules/forum/domain/forum-post.entity";
import { IForumPostRepository } from "@/main/modules/forum/persistence/drizzle-forum-post.repository";

export interface ICreateForumPostCommandPayload {
  topicId: string;
  authorId: string;
  content: string;
}

export class CreateForumPostCommand
  implements ICommand<ICreateForumPostCommandPayload>
{
  readonly type = "CreateForumPostCommand";
  constructor(public payload: ICreateForumPostCommandPayload) {}
}

export class CreateForumPostCommandHandler {
  constructor(private forumPostRepository: IForumPostRepository) {}

  async handle(command: CreateForumPostCommand): Promise<ForumPost> {
    const post = new ForumPost({
      topicId: command.payload.topicId,
      authorId: command.payload.authorId,
      content: command.payload.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    try {
      return await this.forumPostRepository.save(post);
    } catch (error) {
      console.error(`Failed to create forum post:`, error);
      throw new Error(
        `Failed to create forum post: ${(error as Error).message}`,
      );
    }
  }
}
