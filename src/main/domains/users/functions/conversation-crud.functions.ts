import { getDatabase } from "../../../infrastructure/database";
import {
  conversations,
  ConversationSchema,
} from "../../../persistence/schemas";

import type {
  ConversationDto,
  CreateConversationDto,
} from "../../../../shared/types";

function parseConversationResult(
  conversation: ConversationSchema,
): ConversationDto {
  return {
    ...conversation,
    participants: JSON.parse(conversation.participants),
    createdAt: new Date(conversation.createdAt),
    lastMessageAt: conversation.lastMessageAt
      ? new Date(conversation.lastMessageAt)
      : undefined,
  };
}

export async function createConversation(
  data: CreateConversationDto,
): Promise<ConversationDto> {
  const db = getDatabase();

  const [newConversation] = await db
    .insert(conversations)
    .values({
      participants: JSON.stringify(data.participants.sort()),
    })
    .returning();

  return parseConversationResult(newConversation);
}

export async function findConversationById(
  id: string,
): Promise<ConversationDto | null> {
  const db = getDatabase();

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(conversations.id.eq(id))
    .limit(1);

  if (!conversation) return null;

  return parseConversationResult(conversation);
}

export async function findAllConversations(): Promise<ConversationDto[]> {
  const db = getDatabase();

  const allConversations = await db.select().from(conversations);

  return allConversations.map(parseConversationResult);
}
