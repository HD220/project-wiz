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
    
    // Update conversation's last message time
    await this.conversationService.updateLastMessageTime(data.conversationId);
    
    return message;
  }

  async getMessageById(id: string): Promise<MessageDto | null> {
    return await this.messageRepository.findById(id);
  }

  async getConversationMessages(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<MessageDto[]> {
    return await this.messageRepository.findByConversationId(
      conversationId,
      limit,
      offset
    );
  }
}