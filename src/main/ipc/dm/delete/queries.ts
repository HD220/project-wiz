import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmConversationsTable,
  dmParticipantsTable
} from "@/main/database/schemas/dm-conversation.schema";
import { messagesTable } from "@/main/database/schemas/message.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const DeleteDMInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  deletedBy: z.string().min(1, "Deleted by user ID is required"),
});

// Output validation schema
export const DeleteDMOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type DeleteDMInput = z.infer<typeof DeleteDMInputSchema>;
export type DeleteDMOutput = z.infer<typeof DeleteDMOutputSchema>;

export async function deleteDM(input: DeleteDMInput): Promise<DeleteDMOutput> {
  const db = getDatabase();
  
  const validatedInput = DeleteDMInputSchema.parse(input);
  const { dmId, deletedBy } = validatedInput;

  // Soft delete da DM conversation (replicando dmConversationService.softDelete)
  const result = db.transaction((tx) => {
    // 1. Verificar se a DM conversation existe e está ativa
    const dmConversationResults = tx
      .select()
      .from(dmConversationsTable)
      .where(
        and(
          eq(dmConversationsTable.id, dmId),
          eq(dmConversationsTable.isActive, true),
        ),
      )
      .limit(1)
      .all();

    const [dmConversation] = dmConversationResults;

    if (!dmConversation) {
      throw new Error("DM conversation not found or already inactive");
    }

    // 2. Soft delete da conversation
    tx.update(dmConversationsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: deletedBy,
        updatedAt: new Date(),
      })
      .where(eq(dmConversationsTable.id, dmId))
      .run();

    // 3. Soft delete dos participantes
    tx.update(dmParticipantsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: deletedBy,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(dmParticipantsTable.dmConversationId, dmId),
          eq(dmParticipantsTable.isActive, true),
        ),
      )
      .run();

    // 4. Soft delete das mensagens
    tx.update(messagesTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: deletedBy,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(messagesTable.sourceId, dmId),
          eq(messagesTable.sourceType, "dm"),
          eq(messagesTable.isActive, true),
        ),
      )
      .run();

    return true;
  });

  return DeleteDMOutputSchema.parse({
    success: result,
    message: "DM conversation deleted successfully"
  });
}