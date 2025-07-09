import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { IForumPostRepository } from "@/main/modules/forum/persistence/drizzle-forum-post.repository";

export interface RemoveForumPostCommandPayload {
  id: string;
}

export class RemoveForumPostCommand implements ICommand<RemoveForumPostCommandPayload> {
  readonly type = "RemoveForumPostCommand";
  constructor(public payload: RemoveForumPostCommandPayload) {}
}

export class RemoveForumPostCommandHandler {
  constructor(private forumPostRepository: IForumPostRepository) {}

  async handle(command: RemoveForumPostCommand): Promise<boolean> {
    try {
      return await this.forumPostRepository.delete(command.payload.id);
    } catch (error) {
      console.error(`Failed to remove forum post:`, error);
      throw new Error(`Failed to remove forum post: ${(error as Error).message}`);
    }
  }
}