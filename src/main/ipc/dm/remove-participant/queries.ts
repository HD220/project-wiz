import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmParticipantsTable
} from "@/main/database/schemas/dm-conversation.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function removeParticipant(input: {
  dmId: string;
  participantId: string;
  removedBy: string;
}): Promise<{ success: boolean; message: string }> {
  const db = getDatabase();

  // Remover participante da DM (soft delete - replicando dmConversationService.removeParticipant)
  const [updated] = await db
    .update(dmParticipantsTable)
    .set({
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy: input.removedBy,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(dmParticipantsTable.dmConversationId, input.dmId),
        eq(dmParticipantsTable.participantId, input.participantId),
        eq(dmParticipantsTable.isActive, true),
      ),
    )
    .returning();

  if (!updated) {
    throw new Error(
      "Participant not found in DM conversation or already removed",
    );
  }

  return {
    success: true,
    message: "Participant removed from DM conversation successfully",
  };
}