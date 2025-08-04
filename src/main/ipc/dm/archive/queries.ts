import { eq, and, isNull } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmConversationsTable,
  type SelectDMConversation
} from "@/main/database/schemas/dm-conversation.schema";
import type { ArchiveDMInput, ArchiveDMOutput } from "@/shared/types/dm-conversation";

const { getDatabase } = createDatabaseConnection(true);

export async function archiveDM(input: ArchiveDMInput): Promise<ArchiveDMOutput> {
  const db = getDatabase();
  
  const { dmId, archivedBy } = input;

  // 1. Verificar se a DM conversation existe e pode ser arquivada
  const [dmConversation] = await db
    .select()
    .from(dmConversationsTable)
    .where(
      and(
        eq(dmConversationsTable.id, dmId),
        eq(dmConversationsTable.isActive, true),
        isNull(dmConversationsTable.archivedAt),
      ),
    )
    .limit(1);

  if (!dmConversation) {
    throw new Error(
      "DM conversation not found, inactive, or already archived",
    );
  }

  // 2. Arquivar a conversation
  const [updated] = await db
    .update(dmConversationsTable)
    .set({
      archivedAt: new Date(),
      archivedBy,
      updatedAt: new Date(),
    })
    .where(eq(dmConversationsTable.id, dmId))
    .returning();

  if (!updated) {
    throw new Error("Failed to archive DM conversation");
  }

  return {
    success: true,
    message: "DM conversation archived successfully"
  };
}