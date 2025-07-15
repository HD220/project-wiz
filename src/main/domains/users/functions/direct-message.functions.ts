import { eq, desc } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { publishEvent } from "../../../infrastructure/events";
import { getLogger } from "../../../infrastructure/logger";
import { messages } from "../../../persistence/schemas";
import { DirectMessage } from "../entities";
import { MessageContent, SenderType, UserIdentity } from "../value-objects";

import type { MessageDto } from "../../../../shared/types";

const logger = getLogger("DirectMessageFunctions");

export async function createDirectMessage(data: {
  content: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "agent";
  conversationId: string;
}): Promise<MessageDto> {
  const db = getDatabase();
  const content = new MessageContent(data.content);
  const senderType = new SenderType(data.senderType);
  const messageId = new UserIdentity(crypto.randomUUID());

  const _message = new DirectMessage(messageId, content);

  const result = await db
    .insert(messages)
    .values({
      content: content.getValue(),
      senderId: data.senderId,
      senderName: data.senderName,
      senderType: senderType.getValue(),
      contextType: "direct",
      contextId: data.conversationId,
      conversationId: data.conversationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning();

  logger.info("Direct message created", { messageId: result[0].id });
  publishEvent({
    type: "directMessage.created",
    data: { messageId: result[0].id },
  });

  return {
    ...result[0],
    createdAt: new Date(result[0].createdAt),
    updatedAt: new Date(result[0].updatedAt),
    metadata: result[0].metadata ? JSON.parse(result[0].metadata) : undefined,
  };
}

export async function getConversationMessages(
  conversationId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<MessageDto[]> {
  const db = getDatabase();

  const result = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);

  logger.info("Retrieved conversation messages", {
    conversationId,
    count: result.length,
  });

  return result.map((msg) => ({
    ...msg,
    createdAt: new Date(msg.createdAt),
    updatedAt: new Date(msg.updatedAt),
    metadata: msg.metadata ? JSON.parse(msg.metadata) : undefined,
  }));
}
