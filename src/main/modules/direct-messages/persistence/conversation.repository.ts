import { eq, and } from "drizzle-orm";
import { db } from "../../../persistence/db";
import { conversationsSchema, ConversationSchema, CreateConversationSchema } from "../../messaging/persistence/schema";
import type {
  ConversationDto,
  CreateConversationDto,
  ConversationFilterDto,
} from "../../../../shared/types/message.types";

export class ConversationRepository {
  async create(data: CreateConversationDto): Promise<ConversationDto> {
    const conversationData: CreateConversationSchema = {
      type: data.type || "direct",
      participants: JSON.stringify(data.participants),
    };

    const [conversation] = await db
      .insert(conversationsSchema)
      .values(conversationData)
      .returning();

    return this.mapToDto(conversation);
  }

  async findById(id: string): Promise<ConversationDto | null> {
    const conversation = await db
      .select()
      .from(conversationsSchema)
      .where(eq(conversationsSchema.id, id))
      .limit(1);

    return conversation.length > 0 ? this.mapToDto(conversation[0]) : null;
  }

  async findAll(filter?: ConversationFilterDto): Promise<ConversationDto[]> {
    const allConversations = await db
      .select()
      .from(conversationsSchema);

    let filtered = allConversations;

    if (filter?.participantId) {
      filtered = allConversations.filter((conv: ConversationSchema) => {
        const participants = JSON.parse(conv.participants);
        return participants.includes(filter.participantId);
      });
    }

    return filtered.map(this.mapToDto);
  }

  async findByParticipants(participants: string[]): Promise<ConversationDto | null> {
    const sortedParticipants = participants.sort();
    
    const allConversations = await db
      .select()
      .from(conversationsSchema);

    const conversation = allConversations.find((conv: ConversationSchema) => {
      const convParticipants = JSON.parse(conv.participants);
      return JSON.stringify(convParticipants.sort()) === JSON.stringify(sortedParticipants);
    });

    return conversation ? this.mapToDto(conversation) : null;
  }

  async updateLastMessageAt(id: string): Promise<void> {
    await db
      .update(conversationsSchema)
      .set({ lastMessageAt: new Date().toISOString() })
      .where(eq(conversationsSchema.id, id));
  }

  private mapToDto(conversation: ConversationSchema): ConversationDto {
    return {
      id: conversation.id,
      type: conversation.type,
      participants: JSON.parse(conversation.participants),
      lastMessageAt: conversation.lastMessageAt ? new Date(conversation.lastMessageAt) : undefined,
      createdAt: new Date(conversation.createdAt),
    };
  }
}