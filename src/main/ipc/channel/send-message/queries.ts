import { z } from "zod";
import { createDatabaseConnection } from "@/shared/database/config";
import { messagesTable, type SelectMessage } from "@/main/database/schemas/message.schema";
import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const { getDatabase } = createDatabaseConnection(true);
const logger = getLogger("channel.send-message.model");

// Input validation schema
export const SendChannelMessageInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  authorId: z.string().min(1, "Author ID is required"),
  content: z.string().min(1, "Content is required")
});

// Output validation schema
export const SendChannelMessageOutputSchema = z.object({
  id: z.string(),
  sourceType: z.string(),
  sourceId: z.string(),
  authorId: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable()
});

export type SendChannelMessageInput = z.infer<typeof SendChannelMessageInputSchema>;
export type SendChannelMessageOutput = z.infer<typeof SendChannelMessageOutputSchema>;

export async function sendChannelMessage(input: SendChannelMessageInput): Promise<SendChannelMessageOutput> {
  const db = getDatabase();
  
  const validatedInput = SendChannelMessageInputSchema.parse(input);

  // 1. Send message to database
  const [message] = await db
    .insert(messagesTable)
    .values({
      sourceType: "channel",
      sourceId: validatedInput.channelId,
      authorId: validatedInput.authorId,
      content: validatedInput.content
    })
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
      timestamp: message.createdAt
    });

    logger.info("✅ User message event emitted successfully:", {
      messageId: message.id,
      conversationId: message.sourceId
    });
  } catch (error) {
    logger.error("❌ Failed to emit user message event:", error);
    // Don't fail the message sending if event emission fails
  }

  return SendChannelMessageOutputSchema.parse(message);
}