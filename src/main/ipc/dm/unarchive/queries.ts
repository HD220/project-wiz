import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmConversationsTable,
  type SelectDMConversation
} from "@/main/database/schemas/dm-conversation.schema";
import type { UnarchiveDMInput, UnarchiveDMOutput } from "@/shared/types/dm-conversation";

const { getDatabase } = createDatabaseConnection(true);

export async function unarchiveDM(dmId: UnarchiveDMInput): Promise<UnarchiveDMOutput> {
  const db = getDatabase();

  // 1. Verificar se a DM conversation existe e está arquivada
  const [dmConversation] = await db
    .select()
    .from(dmConversationsTable)
    .where(
      and(
        eq(dmConversationsTable.id, dmId),
        eq(dmConversationsTable.isActive, true),
      ),
    )
    .limit(1);

  if (!dmConversation) {
    throw new Error("DM conversation not found or inactive");
  }

  if (!dmConversation.archivedAt) {
    throw new Error("DM conversation is not archived");
  }

  // 2. Desarquivar a conversation
  const [updated] = await db
    .update(dmConversationsTable)
    .set({
      archivedAt: null,
      archivedBy: null,
      updatedAt: new Date(),
    })
    .where(eq(dmConversationsTable.id, dmId))
    .returning();

  if (!updated) {
    throw new Error("Failed to unarchive DM conversation");
  }

  return {
    success: true,
    message: "DM conversation unarchived successfully"
  };
}