import { ConversationRepository } from "../persistence/conversation.repository";
import type {
  ConversationDto,
  CreateConversationDto,
  ConversationFilterDto,
} from "../../../../shared/types/message.types";

export class ConversationService {
  private conversationRepository = new ConversationRepository();

  async createConversation(
    data: CreateConversationDto,
  ): Promise<ConversationDto> {
    return await this.conversationRepository.create(data);
  }

  async getConversationById(id: string): Promise<ConversationDto | null> {
    return await this.conversationRepository.findById(id);
  }

  async listConversations(
    filter?: ConversationFilterDto,
  ): Promise<ConversationDto[]> {
    return await this.conversationRepository.findAll(filter);
  }

  async findOrCreateDirectMessage(
    participants: string[],
  ): Promise<ConversationDto> {
    const existing =
      await this.conversationRepository.findByParticipants(participants);

    if (existing) {
      return existing;
    }

    return await this.conversationRepository.create({ participants });
  }

  async updateLastMessageTime(conversationId: string): Promise<void> {
    await this.conversationRepository.updateLastMessageAt(conversationId);
  }
}
