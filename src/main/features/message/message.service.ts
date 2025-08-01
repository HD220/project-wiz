import { eq, asc, and } from "drizzle-orm";

import { createDatabaseConnection } from "@/shared/database/config";

const { getDatabase } = createDatabaseConnection(true);

import { messagesTable, llmMessagesTable } from "./message.model";

import type {
  SelectMessage,
  SendMessageInput,
  SendLlmMessageInput,
  MessageSourceType,
} from "./message.types";

import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("message-service");

export const messageService = {
  async send(input: SendMessageInput): Promise<SelectMessage> {
    const db = getDatabase();

    const [message] = await db.insert(messagesTable).values(input).returning();

    if (!message) {
      throw new Error("Failed to send message");
    }

    return message;
  },

  async sendToDM(
    dmId: string,
    authorId: string,
    content: string,
  ): Promise<SelectMessage> {
    const message = await this.send({
      sourceType: "dm",
      sourceId: dmId,
      authorId,
      content,
    });

    // Emit user-sent-message event
    try {
      await this.emitUserMessageEvent(message, "dm");
    } catch (error) {
      logger.error("❌ Failed to emit user message event:", error);
      // Don't fail the message sending if event emission fails
    }

    return message;
  },

  async sendToChannel(
    channelId: string,
    authorId: string,
    content: string,
  ): Promise<SelectMessage> {
    const message = await this.send({
      sourceType: "channel",
      sourceId: channelId,
      authorId,
      content,
    });

    // Emit user-sent-message event
    try {
      await this.emitUserMessageEvent(message, "channel");
    } catch (error) {
      logger.error("❌ Failed to emit user message event:", error);
      // Don't fail the message sending if event emission fails
    }

    return message;
  },

  async sendWithLlmData(input: SendLlmMessageInput): Promise<SelectMessage> {
    const db = getDatabase();

    return db.transaction((tx) => {
      const messageResults = tx
        .insert(messagesTable)
        .values(input.messageInput)
        .returning()
        .all();

      const [message] = messageResults;
      if (!message) {
        throw new Error("Failed to send message");
      }

      tx.insert(llmMessagesTable)
        .values({
          messageId: message.id,
          ...input.llmData,
        })
        .run();

      return message;
    });
  },

  async getMessages(
    sourceType: MessageSourceType,
    sourceId: string,
    includeInactive = false,
  ): Promise<SelectMessage[]> {
    const db = getDatabase();

    const conditions = [
      eq(messagesTable.sourceType, sourceType),
      eq(messagesTable.sourceId, sourceId),
    ];

    if (!includeInactive) {
      conditions.push(eq(messagesTable.isActive, true));
    }

    return await db
      .select()
      .from(messagesTable)
      .where(and(...conditions))
      .orderBy(asc(messagesTable.createdAt));
  },

  async getDMMessages(
    dmId: string,
    includeInactive = false,
  ): Promise<SelectMessage[]> {
    return this.getMessages("dm", dmId, includeInactive);
  },

  async getChannelMessages(
    channelId: string,
    includeInactive = false,
  ): Promise<SelectMessage[]> {
    return this.getMessages("channel", channelId, includeInactive);
  },

  async getMessageWithLlmData(messageId: string, includeInactive = false) {
    const db = getDatabase();

    const messageConditions = [eq(messagesTable.id, messageId)];
    const llmConditions = [eq(messagesTable.id, llmMessagesTable.messageId)];

    if (!includeInactive) {
      messageConditions.push(eq(messagesTable.isActive, true));
      llmConditions.push(eq(llmMessagesTable.isActive, true));
    }

    const [result] = await db
      .select({
        message: messagesTable,
        llmMessage: llmMessagesTable,
      })
      .from(messagesTable)
      .leftJoin(llmMessagesTable, and(...llmConditions))
      .where(and(...messageConditions))
      .limit(1);

    return result;
  },

  async findById(
    id: string,
    includeInactive = false,
  ): Promise<SelectMessage | null> {
    const db = getDatabase();

    const conditions = [eq(messagesTable.id, id)];

    if (!includeInactive) {
      conditions.push(eq(messagesTable.isActive, true));
    }

    const [message] = await db
      .select()
      .from(messagesTable)
      .where(and(...conditions))
      .limit(1);

    return message || null;
  },

  async softDelete(id: string, deletedBy: string): Promise<void> {
    const db = getDatabase();

    await db.transaction((tx) => {
      const messageResults = tx
        .select()
        .from(messagesTable)
        .where(and(eq(messagesTable.id, id), eq(messagesTable.isActive, true)))
        .limit(1)
        .all();

      const [message] = messageResults;
      if (!message) {
        throw new Error("Message not found or already inactive");
      }

      tx.update(messagesTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(eq(messagesTable.id, id))
        .run();

      tx.update(llmMessagesTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(llmMessagesTable.messageId, id),
            eq(llmMessagesTable.isActive, true),
          ),
        )
        .run();
    });
  },

  async restore(id: string): Promise<SelectMessage> {
    const db = getDatabase();

    return db.transaction((tx) => {
      const restoredResults = tx
        .update(messagesTable)
        .set({
          isActive: true,
          deactivatedAt: null,
          deactivatedBy: null,
          updatedAt: new Date(),
        })
        .where(and(eq(messagesTable.id, id), eq(messagesTable.isActive, false)))
        .returning()
        .all();

      const [restored] = restoredResults;
      if (!restored) {
        throw new Error("Message not found or not in soft deleted state");
      }

      tx.update(llmMessagesTable)
        .set({
          isActive: true,
          deactivatedAt: null,
          deactivatedBy: null,
          updatedAt: new Date(),
        })
        .where(eq(llmMessagesTable.messageId, id))
        .run();

      return restored;
    });
  },

  async update(id: string, content: string): Promise<SelectMessage> {
    const db = getDatabase();

    const [updated] = await db
      .update(messagesTable)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(and(eq(messagesTable.id, id), eq(messagesTable.isActive, true)))
      .returning();

    if (!updated) {
      throw new Error("Message not found, inactive, or update failed");
    }

    return updated;
  },

  async getMessageCount(
    sourceType: MessageSourceType,
    sourceId: string,
  ): Promise<number> {
    const db = getDatabase();

    const result = await db
      .select({ count: messagesTable.id })
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.sourceType, sourceType),
          eq(messagesTable.sourceId, sourceId),
          eq(messagesTable.isActive, true),
        ),
      );

    return result.length;
  },

  /**
   * Emit user-sent-message event for AI integration
   */
  async emitUserMessageEvent(message: SelectMessage, conversationType: "dm" | "channel"): Promise<void> {
    logger.debug("📤 Emitting user-sent-message event:", {
      messageId: message.id,
      sourceType: message.sourceType,
      sourceId: message.sourceId
    });

    // Build conversation context (for future use)
    await this.buildConversationContext(message, conversationType);

    // Emit the event
    eventBus.emit("user-sent-message", {
      messageId: message.id,
      conversationId: message.sourceId,
      conversationType: conversationType,
      authorId: message.authorId,
      content: message.content,
      timestamp: message.createdAt
    });

    logger.info("✅ User message event emitted successfully:", {
      messageId: message.id,
      conversationId: message.sourceId
    });
  },

  /**
   * Build complete conversation context for event data
   */
  async buildConversationContext(message: SelectMessage, conversationType: "dm" | "channel"): Promise<any> {
    logger.debug("🔨 Building conversation context for message:", message.id);

    try {
      // Basic conversation info
      const messageCount = await this.getMessageCount(message.sourceType, message.sourceId);
      
      // Get recent message activity (last 5 messages for context)
      const recentMessages = await this.getMessages(
        message.sourceType,
        message.sourceId,
        false
      );
      const lastFiveMessages = recentMessages.slice(-5);

      // Build participant information
      const participantIds = new Set<string>();
      participantIds.add(message.authorId); // Current message author
      
      // Add authors from recent messages
      lastFiveMessages.forEach(msg => {
        participantIds.add(msg.authorId);
      });

      // Get conversation metadata based on type
      let conversationMetadata = {};
      
      if (conversationType === "dm") {
        // For DM conversations, we could get DM-specific metadata
        // For now, basic info is enough
        conversationMetadata = {
          type: "dm",
          participantCount: participantIds.size,
        };
      } else if (conversationType === "channel") {
        // For channel conversations, we could get channel/project info
        conversationMetadata = {
          type: "channel", 
          participantCount: participantIds.size,
        };
      }

      // Build activity timeline
      const activityTimeline = lastFiveMessages.map(msg => ({
        timestamp: msg.createdAt,
        authorId: msg.authorId,
        hasLlmData: false // Could check if message has LLM data
      }));

      // Build complete context
      const context = {
        conversationId: message.sourceId,
        conversationType,
        messageCount,
        lastActivity: message.createdAt,
        participants: {
          count: participantIds.size,
          ids: Array.from(participantIds)
        },
        metadata: conversationMetadata,
        recentActivity: {
          messageCount: lastFiveMessages.length,
          timeline: activityTimeline,
          timespan: lastFiveMessages.length > 0 ? {
            start: lastFiveMessages[0]?.createdAt || new Date(),
            end: lastFiveMessages[lastFiveMessages.length - 1]?.createdAt || new Date()
          } : null
        }
      };

      logger.debug("📋 Complete conversation context built:", {
        conversationId: context.conversationId,
        messageCount: context.messageCount,
        participantCount: context.participants.count,
        recentActivityCount: context.recentActivity.messageCount
      });

      return context;

    } catch (error) {
      logger.error("❌ Error building conversation context:", error);
      
      // Return minimal context on error
      return {
        conversationId: message.sourceId,
        conversationType,
        messageCount: 0,
        lastActivity: message.createdAt,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
};
