import { MessageEntity } from "../entities/message.entity";
import { MessageRepository } from "../persistence/message.repository";
import {
  CreateMessageData,
  UpdateMessageData,
  MessageData,
} from "../entities/message.schema";
import { ConversationService } from "./conversation.service";
import { ConversationEntity } from "../entities/conversation.entity";

export class MessageService {
  constructor(
    private repository: MessageRepository,
    private conversationService: ConversationService
  ) {}

  async createMessage(data: CreateMessageData): Promise<MessageData> {
    const message = new MessageEntity(data);
    const saved = await this.repository.save(message.toPlainObject());
    
    const conversation = await this.conversationService.getConversationById({id: data.conversationId});
    if (conversation) {
      // This is a bit of a hack, but it's the easiest way to update the conversation's updatedAt
      // without adding a new method to the repository.
      const conversationEntity = new ConversationEntity(conversation);
      conversationEntity.toPlainObject().updatedAt = new Date();
      this.conversationService.repository.update(conversationEntity.toPlainObject());
    }

    return saved;
  }

  async listMessagesByConversation(data: { conversationId: string }): Promise<MessageData[]> {
    return this.repository.findByConversationId(data.conversationId);
  }

  async getMessageById(data: { id: string }): Promise<MessageData | null> {
    return this.repository.findById(data.id);
  }

  async updateMessage(data: UpdateMessageData): Promise<MessageData> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Message not found");
    }

    const message = new MessageEntity(existing);

    if (data.content !== undefined) {
      message.updateContent({ content: data.content });
    }

    return this.repository.update(message.toPlainObject());
  }

  async deleteMessage(data: { id: string }): Promise<void> {
    await this.repository.delete(data.id);
  }
}