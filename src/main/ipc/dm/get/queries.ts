import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmConversationsTable,
  dmParticipantsTable,
  type SelectDMConversation,
  type SelectDMParticipant 
} from "@/main/database/schemas/dm-conversation.schema";
import type { FindDMByIdInput, FindDMByIdOutput } from "@/shared/types/dm-conversation";

const { getDatabase } = createDatabaseConnection(true);

export async function findDMById(input: FindDMByIdInput): Promise<FindDMByIdOutput> {
  const db = getDatabase();
  
  const { id, includeInactive } = input;

  // 1. Buscar a DM conversation
  const conversationConditions = [eq(dmConversationsTable.id, id)];

  if (!includeInactive) {
    conversationConditions.push(eq(dmConversationsTable.isActive, true));
  }

  const [dmConversation] = await db
    .select()
    .from(dmConversationsTable)
    .where(and(...conversationConditions))
    .limit(1);

  if (!dmConversation) {
    return null;
  }

  // 2. Buscar os participantes
  const participantConditions = [
    eq(dmParticipantsTable.dmConversationId, id),
  ];

  if (!includeInactive) {
    participantConditions.push(eq(dmParticipantsTable.isActive, true));
  }

  const participants = await db
    .select()
    .from(dmParticipantsTable)
    .where(and(...participantConditions));

  const result = {
    ...dmConversation,
    participants,
  };

  return result;
}