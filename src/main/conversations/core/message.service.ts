import { eq, and, desc, asc } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { messages } from '../../database/schema/messages.schema';
import { dmConversations } from '../../database/schema/dm-conversations.schema';
import { generateId } from '../../utils/id-generator';

export interface CreateMessageInput {
  content: string;
  contentType?: string;
  authorId: string;
  authorType: 'user' | 'agent';
  messageType?: string;
  channelId?: string;
  dmConversationId?: string;
  replyToId?: string;
  metadata?: any;
}

export interface MessageResponse {
  id: string;
  content: string;
  contentType: string;
  authorId: string;
  authorType: 'user' | 'agent';
  messageType: string;
  channelId?: string;
  dmConversationId?: string;
  replyToId?: string;
  threadId?: string;
  metadata: any;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class MessageService {
  static async create(input: CreateMessageInput): Promise<MessageResponse> {
    const db = getDatabase();
    
    if (!input.channelId && !input.dmConversationId) {
      throw new Error('Message must belong to either a channel or DM conversation');
    }
    
    const messageId = generateId();
    const now = new Date();
    
    await db.insert(messages).values({
      id: messageId,
      channelId: input.channelId,
      dmConversationId: input.dmConversationId,
      content: input.content,
      contentType: input.contentType || 'text',
      authorId: input.authorId,
      authorType: input.authorType,
      messageType: input.messageType || 'text',
      replyToId: input.replyToId,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      createdAt: now,
    });
    
    // Update DM conversation if this is a DM
    if (input.dmConversationId) {
      await db.update(dmConversations)
        .set({
          lastMessageAt: now,
          updatedAt: now,
        })
        .where(eq(dmConversations.id, input.dmConversationId));
    }
    
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });
    
    if (!message) {
      throw new Error('Failed to create message');
    }
    
    return {
      id: message.id,
      content: message.content,
      contentType: message.contentType,
      authorId: message.authorId,
      authorType: message.authorType as 'user' | 'agent',
      messageType: message.messageType,
      channelId: message.channelId,
      dmConversationId: message.dmConversationId,
      replyToId: message.replyToId,
      threadId: message.threadId,
      metadata: message.metadata ? JSON.parse(message.metadata) : {},
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      deletedAt: message.deletedAt,
    };
  }
  
  static async findChannelMessages(channelId: string, limit = 50, before?: string): Promise<MessageResponse[]> {
    const db = getDatabase();
    
    let whereCondition = and(
      eq(messages.channelId, channelId),
      eq(messages.deletedAt, null)
    );
    
    // TODO: Add pagination support with 'before' parameter if needed
    
    const channelMessages = await db.query.messages.findMany({
      where: whereCondition,
      orderBy: [asc(messages.createdAt)],
      limit,
    });
    
    return channelMessages.map(message => ({
      id: message.id,
      content: message.content,
      contentType: message.contentType,
      authorId: message.authorId,
      authorType: message.authorType as 'user' | 'agent',
      messageType: message.messageType,
      channelId: message.channelId,
      dmConversationId: message.dmConversationId,
      replyToId: message.replyToId,
      threadId: message.threadId,
      metadata: message.metadata ? JSON.parse(message.metadata) : {},
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      deletedAt: message.deletedAt,
    }));
  }
  
  static async findDMMessages(dmConversationId: string, limit = 50, before?: string): Promise<MessageResponse[]> {
    const db = getDatabase();
    
    let whereCondition = and(
      eq(messages.dmConversationId, dmConversationId),
      eq(messages.deletedAt, null)
    );
    
    const dmMessages = await db.query.messages.findMany({
      where: whereCondition,
      orderBy: [asc(messages.createdAt)],
      limit,
    });
    
    return dmMessages.map(message => ({
      id: message.id,
      content: message.content,
      contentType: message.contentType,
      authorId: message.authorId,
      authorType: message.authorType as 'user' | 'agent',
      messageType: message.messageType,
      channelId: message.channelId,
      dmConversationId: message.dmConversationId,
      replyToId: message.replyToId,
      threadId: message.threadId,
      metadata: message.metadata ? JSON.parse(message.metadata) : {},
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      deletedAt: message.deletedAt,
    }));
  }
  
  static async findById(messageId: string): Promise<MessageResponse | null> {
    const db = getDatabase();
    
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });
    
    if (!message) {
      return null;
    }
    
    return {
      id: message.id,
      content: message.content,
      contentType: message.contentType,
      authorId: message.authorId,
      authorType: message.authorType as 'user' | 'agent',
      messageType: message.messageType,
      channelId: message.channelId,
      dmConversationId: message.dmConversationId,
      replyToId: message.replyToId,
      threadId: message.threadId,
      metadata: message.metadata ? JSON.parse(message.metadata) : {},
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      deletedAt: message.deletedAt,
    };
  }
  
  static async update(messageId: string, content: string, authorId: string): Promise<MessageResponse> {
    const db = getDatabase();
    
    // Check if user can edit this message
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });
    
    if (!message) {
      throw new Error('Message not found');
    }
    
    if (message.authorId !== authorId) {
      throw new Error('Permission denied');
    }
    
    if (message.deletedAt) {
      throw new Error('Cannot edit deleted message');
    }
    
    // Update message
    await db.update(messages)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId));
    
    // Get updated message
    const updatedMessage = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });
    
    if (!updatedMessage) {
      throw new Error('Failed to update message');
    }
    
    return {
      id: updatedMessage.id,
      content: updatedMessage.content,
      contentType: updatedMessage.contentType,
      authorId: updatedMessage.authorId,
      authorType: updatedMessage.authorType as 'user' | 'agent',
      messageType: updatedMessage.messageType,
      channelId: updatedMessage.channelId,
      dmConversationId: updatedMessage.dmConversationId,
      replyToId: updatedMessage.replyToId,
      threadId: updatedMessage.threadId,
      metadata: updatedMessage.metadata ? JSON.parse(updatedMessage.metadata) : {},
      createdAt: updatedMessage.createdAt,
      updatedAt: updatedMessage.updatedAt,
      deletedAt: updatedMessage.deletedAt,
    };
  }
  
  static async delete(messageId: string, authorId: string): Promise<void> {
    const db = getDatabase();
    
    // Check if user can delete this message
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });
    
    if (!message) {
      throw new Error('Message not found');
    }
    
    if (message.authorId !== authorId) {
      throw new Error('Permission denied');
    }
    
    // Soft delete message
    await db.update(messages)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(messages.id, messageId));
  }
}