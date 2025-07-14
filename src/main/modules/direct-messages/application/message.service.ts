import { MessageRepository } from "../persistence/message.repository";
import { ConversationService } from "./conversation.service";
import type {
  MessageDto,
  CreateMessageDto,
  MessageFilterDto,
} from "../../../../shared/types/message.types";

export class MessageService {
  private messageRepository = new MessageRepository();
  private conversationService = new ConversationService();

  async createMessage(data: CreateMessageDto): Promise<MessageDto> {
    const message = await this.messageRepository.create(data);

    // Update conversation's last message time if this is a direct message
    const conversationId = data.contextId || data.conversationId;
    if (
      conversationId &&
      (data.contextType === "direct" || data.conversationId)
    ) {
      await this.conversationService.updateLastMessageTime(conversationId);
    }

    return message;
  }

  async getMessageById(id: string): Promise<MessageDto | null> {
    return await this.messageRepository.findById(id);
  }

  async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<MessageDto[]> {
    return await this.messageRepository.findByConversationId(
      conversationId,
      limit,
      offset,
    );
  }

  async deleteMessage(id: string): Promise<void> {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new Error("Mensagem não encontrada");
    }

    await this.messageRepository.delete(id);
  }
}
