import type {
  MessageDto,
  CreateMessageDto,
  MessageFilterDto,
} from "../../../../shared/types/domains/users/message.types";

export const messageService = {
  async listByConversation(
    conversationId: string,
    limit?: number,
    offset?: number,
  ): Promise<MessageDto[]> {
    const messages = await window.electronIPC.directMessages.listByConversation(
      conversationId,
      limit,
      offset,
    );

    return messages.sort(
      (a, b) =>
        new Date(a.timestamp || a.createdAt).getTime() -
        new Date(b.timestamp || b.createdAt).getTime(),
    );
  },

  async create(data: CreateMessageDto): Promise<MessageDto> {
    return window.electronIPC.directMessages.create(data);
  },

  async getById(id: string): Promise<MessageDto | null> {
    return window.electronIPC.invoke("dm:message:getById", { id });
  },
};
