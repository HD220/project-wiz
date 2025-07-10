import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { IForumPostRepository } from "@/main/modules/forum/persistence/drizzle-forum-post.repository";

export interface IRemoveForumPostCommandPayload {
  id: string;
}

export class RemoveForumPostCommand
  implements ICommand<IRemoveForumPostCommandPayload>
{
  readonly type = "RemoveForumPostCommand";
  constructor(public payload: IRemoveForumPostCommandPayload) {}
}

export class RemoveForumPostCommandHandler {
  constructor(private forumPostRepository: IForumPostRepository) {}

  async handle(command: RemoveForumPostCommand): Promise<boolean> {
    try {
      return await this.forumPostRepository.delete(command.payload.id);
    } catch (error) {
      console.error(`Failed to remove forum post:`, error);
      throw new ApplicationError(
        `Failed to remove forum post: ${(error as Error).message}`,
      );
  }
}
