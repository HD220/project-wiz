import { eq, desc, and } from "drizzle-orm";
import { db } from "../../../persistence/db";
import {
  messages,
  MessageSchema,
  CreateMessageSchema,
} from "../../../persistence/schemas";
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
      contextType: data.contextType || "direct",
      contextId: data.contextId || data.conversationId,
      type: data.type || "text",
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    };

    const [message] = await db.insert(messages).values(messageData).returning();

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
    limit: number = 50,
    offset: number = 0,
  ): Promise<MessageDto[]> {
    const results = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.contextType, "direct"),
          eq(messages.contextId, conversationId),
        ),
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map(this.mapToDto);
  }

  async delete(id: string): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
  }

  private mapToDto(message: MessageSchema): MessageDto {
    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.senderName,
      senderType: message.senderType,
      contextType: message.contextType,
      contextId: message.contextId,
      type: message.type,
      metadata: message.metadata ? JSON.parse(message.metadata) : undefined,
      isEdited: message.isEdited,
      createdAt: new Date(message.createdAt),
      updatedAt: new Date(message.updatedAt),
      // Legacy compatibility - use conversationId from schema directly
      conversationId: message.conversationId,
      timestamp: new Date(message.createdAt),
    };
  }
}
