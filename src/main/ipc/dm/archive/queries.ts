import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmConversationsTable
} from "@/main/database/schemas/dm-conversation.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const ArchiveDMInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  archivedBy: z.string().min(1, "Archived by user ID is required"),
});

// Output validation schema
export const ArchiveDMOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type ArchiveDMInput = z.infer<typeof ArchiveDMInputSchema>;
export type ArchiveDMOutput = z.infer<typeof ArchiveDMOutputSchema>;

export async function archiveDM(input: ArchiveDMInput): Promise<ArchiveDMOutput> {
  const db = getDatabase();
  
  const validatedInput = ArchiveDMInputSchema.parse(input);
  const { dmId, archivedBy } = validatedInput;

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

  return ArchiveDMOutputSchema.parse({
    success: true,
    message: "DM conversation archived successfully"
  });
}