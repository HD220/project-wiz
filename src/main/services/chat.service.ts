import { eq, and, desc, lt } from 'drizzle-orm';
import { getDatabase } from '../database/connection';
import { messages, dmConversations, channels } from '../database/schema';
import { 
  SendMessageSchema,
  type SendMessageInput,
  type ListOptions
} from '../../shared/schemas/validation.schemas';
import { 
  ValidationError, 
  NotFoundError,
  AuthorizationError,
  type Message,
  type DmConversation,
  type MessageType,
  type AuthorType
} from '../../shared/types/common';
import { generateMessageId, generateConversationId } from '../../shared/utils/id-generator';

export class ChatService {
  /**
   * Send message to channel or DM
   */
  static async sendMessage(input: SendMessageInput, authorId: string): Promise<Message> {
    // Validate input
    const validated = SendMessageSchema.parse(input);
    const db = getDatabase();
    
    // Validate access to channel or DM
    if (validated.channelId) {
      await this.validateChannelAccess(validated.channelId, authorId);
    } else if (validated.dmConversationId) {
      await this.validateDMAccess(validated.dmConversationId, authorId);
    }
    
    // Create message
    const messageId = generateMessageId();
    const now = new Date();
    
    const newMessage = {
      id: messageId,
      channelId: validated.channelId,
      dmConversationId: validated.dmConversationId,
      content: validated.content,
      contentType: 'text' as const,
      authorId,
      authorType: 'user' as const,
      messageType: validated.messageType,
      metadata: validated.metadata ? JSON.stringify(validated.metadata) : null,
      replyToId: validated.replyToId,
      threadId: validated.replyToId, // Simple thread grouping
      createdAt: now,
    };
    
    await db.insert(messages).values(newMessage);
    
    // Update DM conversation if applicable
    if (validated.dmConversationId) {
      await this.updateDMLastMessage(validated.dmConversationId);
    }
    
    // TODO: Process message for agent actions
    
    return {
      ...newMessage,
      metadata: newMessage.metadata ? JSON.parse(newMessage.metadata) : undefined,
    };
  }
  
  /**
   * Send agent message
   */
  static async sendAgentMessage(
    agentId: string,
    content: string,
    channelId?: string,
    dmConversationId?: string,
    messageType: MessageType = 'text'
  ): Promise<Message> {
    const db = getDatabase();
    
    const messageId = generateMessageId();
    const now = new Date();
    
    const newMessage = {
      id: messageId,
      channelId,
      dmConversationId,
      content,
      contentType: 'text' as const,
      authorId: agentId,
      authorType: 'agent' as const,
      messageType,
      createdAt: now,
    };
    
    await db.insert(messages).values(newMessage);
    
    // Update DM conversation if applicable
    if (dmConversationId) {
      await this.updateDMLastMessage(dmConversationId);
    }
    
    return newMessage;
  }
  
  /**
   * List messages by channel
   */
  static async listByChannel(
    channelId: string,
    options: ListOptions = {}
  ): Promise<Message[]> {
    const db = getDatabase();
    const { limit = 50, before } = options;
    
    const whereConditions = [eq(messages.channelId, channelId)];
    
    if (before) {
      whereConditions.push(lt(messages.createdAt, new Date(before)));
    }
    
    const messagesList = await db.query.messages.findMany({
      where: and(...whereConditions),
      orderBy: [desc(messages.createdAt)],
      limit,
    });
    
    // Return in chronological order
    const orderedMessages = messagesList.reverse();
    
    return orderedMessages.map(message => ({
      ...message,
      metadata: message.metadata ? JSON.parse(message.metadata) : undefined,
    }));
  }
  
  /**
   * List messages by DM conversation
   */
  static async listByDM(
    conversationId: string,
    options: ListOptions = {}
  ): Promise<Message[]> {
    const db = getDatabase();
    const { limit = 50, before } = options;
    
    const whereConditions = [eq(messages.dmConversationId, conversationId)];
    
    if (before) {
      whereConditions.push(lt(messages.createdAt, new Date(before)));
    }
    
    const messagesList = await db.query.messages.findMany({
      where: and(...whereConditions),
      orderBy: [desc(messages.createdAt)],
      limit,
    });
    
    // Return in chronological order
    const orderedMessages = messagesList.reverse();
    
    return orderedMessages.map(message => ({
      ...message,
      metadata: message.metadata ? JSON.parse(message.metadata) : undefined,
    }));
  }
  
  /**
   * Update message content
   */
  static async updateMessage(messageId: string, content: string, userId: string): Promise<Message> {
    const db = getDatabase();
    
    // Find message and validate ownership
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });
    
    if (!message) {
      throw new NotFoundError('Message', messageId);
    }
    
    if (message.authorId !== userId || message.authorType !== 'user') {
      throw new AuthorizationError('You can only edit your own messages');
    }
    
    // Update message
    await db.update(messages)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId));
    
    // Return updated message
    const updatedMessage = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });
    
    return {
      ...updatedMessage!,
      metadata: updatedMessage!.metadata ? JSON.parse(updatedMessage!.metadata) : undefined,
    };
  }
  
  /**
   * Delete message (soft delete)
   */
  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    const db = getDatabase();
    
    // Find message and validate ownership
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });
    
    if (!message) {
      throw new NotFoundError('Message', messageId);
    }
    
    if (message.authorId !== userId || message.authorType !== 'user') {
      throw new AuthorizationError('You can only delete your own messages');
    }
    
    // Soft delete message
    await db.update(messages)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(messages.id, messageId));
  }
  
  /**
   * Get or create DM conversation
   */
  static async getOrCreateDMConversation(
    userId: string,
    agentId: string
  ): Promise<string> {
    const db = getDatabase();
    
    // Look for existing active conversation
    const existing = await db.query.dmConversations.findFirst({
      where: and(
        eq(dmConversations.userId, userId),
        eq(dmConversations.agentId, agentId),
        eq(dmConversations.isActive, true)
      ),
    });
    
    if (existing) {
      return existing.id;
    }
    
    // Create new conversation
    const conversationId = generateConversationId();
    const now = new Date();
    
    const newConversation = {
      id: conversationId,
      userId,
      agentId,
      isActive: true,
      isPinned: false,
      unreadCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.insert(dmConversations).values(newConversation);
    
    return conversationId;
  }
  
  /**
   * List DM conversations for user
   */
  static async listDMConversations(userId: string): Promise<DmConversation[]> {
    const db = getDatabase();
    
    const conversations = await db.query.dmConversations.findMany({
      where: and(
        eq(dmConversations.userId, userId),
        eq(dmConversations.isActive, true)
      ),
      orderBy: [desc(dmConversations.lastMessageAt), desc(dmConversations.createdAt)],
      with: {
        agent: true,
      },
    });
    
    return conversations.map(conv => ({
      id: conv.id,
      userId: conv.userId,
      agentId: conv.agentId,
      isActive: conv.isActive,
      isPinned: conv.isPinned,
      lastMessageAt: conv.lastMessageAt,
      lastReadAt: conv.lastReadAt,
      unreadCount: conv.unreadCount,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));
  }
  
  /**
   * Mark DM conversation as read
   */
  static async markAsRead(conversationId: string, userId: string): Promise<void> {
    const db = getDatabase();
    
    // Validate access
    await this.validateDMAccess(conversationId, userId);
    
    await db.update(dmConversations)
      .set({
        lastReadAt: new Date(),
        unreadCount: 0,
        updatedAt: new Date(),
      })
      .where(eq(dmConversations.id, conversationId));
  }
  
  // Private methods
  private static async validateChannelAccess(
    channelId: string,
    userId: string
  ): Promise<void> {
    const db = getDatabase();
    
    const channel = await db.query.channels.findFirst({
      where: eq(channels.id, channelId),
      with: {
        project: true,
      },
    });
    
    if (!channel) {
      throw new NotFoundError('Channel', channelId);
    }
    
    // TODO: Implement proper project membership check
    // For now, only project owner can access
    if (channel.project.ownerId !== userId) {
      throw new AuthorizationError('No access to this channel');
    }
  }
  
  private static async validateDMAccess(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const db = getDatabase();
    
    const conversation = await db.query.dmConversations.findFirst({
      where: eq(dmConversations.id, conversationId),
    });
    
    if (!conversation) {
      throw new NotFoundError('DM Conversation', conversationId);
    }
    
    if (conversation.userId !== userId) {
      throw new AuthorizationError('No access to this conversation');
    }
  }
  
  private static async updateDMLastMessage(conversationId: string): Promise<void> {
    const db = getDatabase();
    
    await db.update(dmConversations)
      .set({
        lastMessageAt: new Date(),
        unreadCount: db.query.dmConversations.findFirst({
          where: eq(dmConversations.id, conversationId),
        }).then(conv => (conv?.unreadCount || 0) + 1),
        updatedAt: new Date(),
      })
      .where(eq(dmConversations.id, conversationId));
  }
}