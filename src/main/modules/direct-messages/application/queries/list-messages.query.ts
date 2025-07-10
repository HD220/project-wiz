import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { DirectMessage } from "@/main/modules/direct-messages/domain/direct-message.entity";
import { IDirectMessageRepository } from "@/main/modules/direct-messages/domain/direct-message.repository";

export interface IListMessagesQueryPayload {
  senderId: string;
  receiverId: string;
}

export class ListMessagesQuery implements IQuery<IListMessagesQueryPayload> {
  readonly type = "ListMessagesQuery";
  constructor(public payload: IListMessagesQueryPayload) {}
}

export class ListMessagesQueryHandler {
  constructor(private messageRepository: IDirectMessageRepository) {}

  async handle(query: ListMessagesQuery): Promise<DirectMessage[]> {
    try {
      return await this.messageRepository.findByConversation(
        query.payload.senderId,
        query.payload.receiverId,
      );
    } catch (error) {
      console.error("Failed to list messages:", error);
      throw new ApplicationError(`Failed to list messages: ${(error as Error).message}`);
    }
  }
}
