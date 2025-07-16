import { eq, sql } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { publishEvent } from "../../../infrastructure/events";
import { getLogger } from "../../../infrastructure/logger";
import { conversations } from "../../../persistence/schemas";
import { UserIdentity } from "../value-objects";

import type {
  ConversationDto,
  CreateConversationDto,
} from "../../../../shared/types";

const logger = getLogger("ConversationFunctions");

export async function createConversation(
  data: CreateConversationDto,
): Promise<ConversationDto> {
  const db = getDatabase();

  const result = await db
    .insert(conversations)
    .values(buildConversationData(data))
    .returning();

  logger.info("Conversation created", { conversationId: result[0].id });
  publishEvent({
    type: "conversation.created",
    data: { conversationId: result[0].id },
  });

  return parseConversationResult(result[0]);
}

function buildConversationData(data: CreateConversationDto) {
  return {
    participants: JSON.stringify(data.participants),
    createdAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
  };
}

function parseConversationResult(conversation: any): ConversationDto {
  return {
    ...conversation,
    participants: JSON.parse(conversation.participants),
    createdAt: new Date(conversation.createdAt),
    lastMessageAt: conversation.lastMessageAt
      ? new Date(conversation.lastMessageAt)
      : undefined,
  };
}

export async function findConversationById(
  id: string,
): Promise<ConversationDto | null> {
  const db = getDatabase();
  const conversationId = new UserIdentity(id);

  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId.getValue()))
    .limit(1);

  const conversation = result[0];
  if (!conversation) return null;

  return parseConversationResult(conversation);
}

export async function findAllConversations(): Promise<ConversationDto[]> {
  const db = getDatabase();
  const result = await db.select().from(conversations);
  return result.map(parseConversationResult);
}