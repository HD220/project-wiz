import { sql } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import {
  conversations,
  ConversationSchema,
} from "../../../persistence/schemas";

import { createConversation } from "./conversation-crud.functions";

import type { ConversationDto } from "../../../../shared/types";

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

  return parseConversationResult(conversation);
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
