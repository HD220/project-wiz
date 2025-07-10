import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { NotFoundError } from "@/main/errors/not-found.error";
import { ForumPost } from "@/main/modules/forum/domain/forum-post.entity";
import { IForumPostRepository } from "@/main/modules/forum/persistence/drizzle-forum-post.repository";

export interface IUpdateForumPostCommandPayload {
  id: string;
  content: string;
}

export class UpdateForumPostCommand
  implements ICommand<IUpdateForumPostCommandPayload>
{
  readonly type = "UpdateForumPostCommand";
  constructor(public payload: IUpdateForumPostCommandPayload) {}
}

export class UpdateForumPostCommandHandler {
  constructor(private forumPostRepository: IForumPostRepository) {}

  async handle(command: UpdateForumPostCommand): Promise<ForumPost> {
    try {
      const existingPost = await this.forumPostRepository.findById(
        command.payload.id,
      );

      if (existingPost) {
        existingPost.updateContent(command.payload.content);
        return await this.forumPostRepository.save(existingPost);
      }
      throw new NotFoundError(`Forum post with ID ${command.payload.id} not found.`);
    } catch (error) {
      console.error(`Failed to update forum post:`, error);
      throw new ApplicationError(
        `Failed to update forum post: ${(error as Error).message}`,
      );
    }
  }
}
