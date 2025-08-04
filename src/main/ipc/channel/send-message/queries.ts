import { createDatabaseConnection } from "@/shared/database/config";
import { messagesTable, type InsertMessage, type SelectMessage } from "@/main/database/schemas/message.schema";
import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const { getDatabase } = createDatabaseConnection(true);
const logger = getLogger("channel.send-message.model");

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function sendChannelMessage(data: InsertMessage): Promise<SelectMessage> {
  const db = getDatabase();

  // 1. Send message to database
  const [message] = await db
    .insert(messagesTable)
    .values(data)
    .returning();

  if (!message) {
    throw new Error("Failed to send message");
  }

  // 2. Emit user-sent-message event
  try {
    logger.debug("📤 Emitting user-sent-message event:", {
      messageId: message.id,
      sourceType: message.sourceType,
      sourceId: message.sourceId
    });

    eventBus.emit("user-sent-message", {
      messageId: message.id,
      conversationId: message.sourceId,
      conversationType: "channel",
      authorId: message.authorId,
      content: message.content,
      timestamp: new Date(message.createdAt)
    });

    logger.info("✅ User message event emitted successfully:", {
      messageId: message.id,
      conversationId: message.sourceId
    });
  } catch (error) {
    logger.error("❌ Failed to emit user message event:", error);
    // Don't fail the message sending if event emission fails
  }

  return message;
}