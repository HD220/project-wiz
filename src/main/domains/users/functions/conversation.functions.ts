import { eq, sql } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { publishEvent } from "../../../infrastructure/events";
import { getLogger } from "../../../infrastructure/logger";
import { conversations } from "../../../persistence/schemas";
import { UserIdentity } from "../value-objects";

import type {
  ConversationDto,
  CreateConversationDto,
} from "../../../../shared/types/message.types";

const logger = getLogger("ConversationFunctions");

export async function createConversation(
  data: CreateConversationDto,
): Promise<ConversationDto> {
  const db = getDatabase();

  const result = await db
    .insert(conversations)
    .values({
      participants: JSON.stringify(data.participants),
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    })
    .returning();

  logger.info("Conversation created", { conversationId: result[0].id });
  publishEvent({
    type: "conversation.created",
    data: { conversationId: result[0].id },
  });

  return {
    ...result[0],
    participants: JSON.parse(result[0].participants),
    createdAt: new Date(result[0].createdAt),
    lastMessageAt: result[0].lastMessageAt
      ? new Date(result[0].lastMessageAt)
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

  return {
    ...conversation,
    participants: JSON.parse(conversation.participants),
    createdAt: new Date(conversation.createdAt),
    lastMessageAt: conversation.lastMessageAt
      ? new Date(conversation.lastMessageAt)
      : undefined,
  };
}

export async function findConversationByParticipants(
  participants: string[],
): Promise<ConversationDto | null> {
  const db = getDatabase();

  const result = await db
    .select()
    .from(conversations)
    .where(sql`participants = ${JSON.stringify(participants.sort())}`)
    .limit(1);

  const conversation = result[0];
  if (!conversation) return null;

  return {
    ...conversation,
    participants: JSON.parse(conversation.participants),
    createdAt: new Date(conversation.createdAt),
    lastMessageAt: conversation.lastMessageAt
      ? new Date(conversation.lastMessageAt)
      : undefined,
  };
}

export async function findOrCreateDirectMessage(
  participants: string[],
): Promise<ConversationDto> {
  const existing = await findConversationByParticipants(participants);

  if (existing) {
    return existing;
  }

  return await createConversation({ participants });
}

export async function findAllConversations(): Promise<ConversationDto[]> {
  const db = getDatabase();

  const result = await db
    .select()
    .from(conversations);

  return result.map((conversation) => ({
    ...conversation,
    participants: JSON.parse(conversation.participants),
    createdAt: new Date(conversation.createdAt),
    lastMessageAt: conversation.lastMessageAt
      ? new Date(conversation.lastMessageAt)
      : undefined,
  }));
}
