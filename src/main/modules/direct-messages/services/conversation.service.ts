import { ConversationEntity } from "../entities/conversation.entity";
import { ConversationRepository } from "../persistence/conversation.repository";
import {
  CreateConversationData,
  ConversationData,
} from "../entities/conversation.schema";

export class ConversationService {
  constructor(private repository: ConversationRepository) {}

  async createConversation(data: CreateConversationData): Promise<ConversationData> {
    const conversation = new ConversationEntity(data);
    const saved = await this.repository.save(conversation.toPlainObject());
    return saved;
  }

  async findOrCreateConversation(data: { userId1: string, userId2: string }): Promise<ConversationData> {
    const existing = await this.repository.findByUsers(data.userId1, data.userId2);
    if (existing) {
      return existing;
    }

    return this.createConversation(data);
  }

  async getConversationById(data: { id: string }): Promise<ConversationData | null> {
    return this.repository.findById(data.id);
  }

  async deleteConversation(data: { id: string }): Promise<void> {
    await this.repository.delete(data.id);
  }
}