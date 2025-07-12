import { eq, desc } from "drizzle-orm";
import { db } from "../../../persistence/db";
import { messages, MessageSchema, CreateMessageSchema } from "./schema";
import type {
  MessageDto,
  CreateMessageDto,
  MessageFilterDto,
} from "../../../../shared/types/message.types";

export class MessageRepository {
  async create(data: CreateMessageDto): Promise<MessageDto> {
    const messageData: CreateMessageSchema = {
      content: data.content,
      senderId: data.senderId,
      senderName: data.senderName,
      senderType: data.senderType,
      conversationId: data.conversationId,
    };

    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();

    return this.mapToDto(message);
  }

  async findById(id: string): Promise<MessageDto | null> {
    const message = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);

    return message.length > 0 ? this.mapToDto(message[0]) : null;
  }

  async findByConversationId(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<MessageDto[]> {
    let query = db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt));

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      query = query.offset(offset);
    }

    const results = await query;
    return results.map(this.mapToDto);
  }

  private mapToDto(message: MessageSchema): MessageDto {
    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.senderName,
      senderType: message.senderType,
      conversationId: message.conversationId,
      timestamp: message.createdAt,
    };
  }
}