import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmConversationsTable
} from "@/main/database/schemas/dm-conversation.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const UnarchiveDMInputSchema = z.string().min(1, "DM ID is required");

// Output validation schema
export const UnarchiveDMOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type UnarchiveDMInput = z.infer<typeof UnarchiveDMInputSchema>;
export type UnarchiveDMOutput = z.infer<typeof UnarchiveDMOutputSchema>;

export async function unarchiveDM(dmId: UnarchiveDMInput): Promise<UnarchiveDMOutput> {
  const db = getDatabase();
  
  const validatedDmId = UnarchiveDMInputSchema.parse(dmId);

  // 1. Verificar se a DM conversation existe e está arquivada
  const [dmConversation] = await db
    .select()
    .from(dmConversationsTable)
    .where(
      and(
        eq(dmConversationsTable.id, validatedDmId),
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
    .where(eq(dmConversationsTable.id, validatedDmId))
    .returning();

  if (!updated) {
    throw new Error("Failed to unarchive DM conversation");
  }

  return UnarchiveDMOutputSchema.parse({
    success: true,
    message: "DM conversation unarchived successfully"
  });
}