import type {
  MessageDto,
} from "../../../../shared/types/domains/users/message.types";

export class DirectMessageChatService {
  static async sendToAgent(
    conversationId: string,
    content: string,
    senderId: string,
  ) {
    return await window.electronIPC.directMessages.sendAgent(
      conversationId,
      content,
      senderId,
    );
  }

  static async regenerateResponse(
    conversationId: string,
    senderId: string,
  ) {
    return await window.electronIPC.directMessages.regenerateResponse(
      conversationId,
      senderId,
    );
  }

  static createOptimisticMessage(
    content: string,
    conversationId: string,
  ): MessageDto {
    return {
      id: `temp-user-${Date.now()}`,
      content: content.trim(),
      senderId: "user",
      senderName: "João Silva",
      senderType: "user",
      conversationId,
      createdAt: new Date(),
      timestamp: new Date(),
    };
  }
}
