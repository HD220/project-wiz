import { DirectMessage } from "@/main/modules/direct-messages/domain/direct-message.entity";

export interface IDirectMessageRepository {
  save(message: DirectMessage): Promise<DirectMessage>;
  findByConversation(
    senderId: string,
    receiverId: string,
  ): Promise<DirectMessage[]>;
}
