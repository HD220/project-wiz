import { eq, inArray } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmConversationsTable,
  dmParticipantsTable,
  type SelectDMConversation,
  type InsertDMConversation 
} from "@/main/database/schemas/dm-conversation.schema";
import { usersTable } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

// Função para gerar título da DM (replicando do service original)
async function generateDMTitle(
  participantIds: string[],
  currentUserId?: string,
): Promise<string> {
  const otherParticipantIds = currentUserId
    ? participantIds.filter((id) => id !== currentUserId)
    : participantIds;

  if (otherParticipantIds.length === 0) {
    return "Self Conversation";
  }

  const participantNames: string[] = [];
  for (const participantId of otherParticipantIds) {
    const db = getDatabase();
    const [user] = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, participantId))
      .limit(1);
    if (user) {
      participantNames.push(user.name);
    }
  }

  if (participantNames.length === 0) {
    return "Unknown Participants";
  }

  if (participantNames.length <= 3) {
    return participantNames.join(", ");
  }

  return `${participantNames.slice(0, 3).join(", ")}...`;
}

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function createDM(data: InsertDMConversation & { participantIds: string[]; currentUserId: string }): Promise<SelectDMConversation> {
  const db = getDatabase();
  
  // Validar que todos os participant IDs existem
  const existingUsers = await db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable)
    .where(inArray(usersTable.id, data.participantIds));

  const existingUserIds = new Set(existingUsers.map((user) => user.id));
  const invalidParticipantIds = data.participantIds.filter(
    (id) => !existingUserIds.has(id),
  );

  if (invalidParticipantIds.length > 0) {
    throw new Error(
      `Invalid participant IDs: ${invalidParticipantIds.join(", ")}`,
    );
  }

  const conversationName = await generateDMTitle(
    data.participantIds,
    data.currentUserId,
  );

  // Usar transação síncrona conforme o padrão do service original
  return db.transaction((tx) => {
    // 1. Criar DM conversation
    const dmConversationResults = tx
      .insert(dmConversationsTable)
      .values({
        name: conversationName,
        description: data.description,
      })
      .returning()
      .all();

    const [dmConversation] = dmConversationResults;
    if (!dmConversation) {
      throw new Error("Failed to create DM conversation");
    }

    // 2. Adicionar participantes
    const participantValues = data.participantIds.map((participantId) => ({
      dmConversationId: dmConversation.id,
      participantId,
    }));

    tx
      .insert(dmParticipantsTable)
      .values(participantValues)
      .returning()
      .all();

    return dmConversation;
  });
}