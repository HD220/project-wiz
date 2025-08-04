import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmParticipantsTable
} from "@/main/database/schemas/dm-conversation.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const RemoveParticipantInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  participantId: z.string().min(1, "Participant ID is required"),
  removedBy: z.string().min(1, "Removed by user ID is required"),
});

// Output validation schema
export const RemoveParticipantOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type RemoveParticipantInput = z.infer<typeof RemoveParticipantInputSchema>;
export type RemoveParticipantOutput = z.infer<typeof RemoveParticipantOutputSchema>;

export async function removeParticipant(input: RemoveParticipantInput): Promise<RemoveParticipantOutput> {
  const db = getDatabase();
  
  const validatedInput = RemoveParticipantInputSchema.parse(input);

  // Remover participante da DM (soft delete - replicando dmConversationService.removeParticipant)
  const [updated] = await db
    .update(dmParticipantsTable)
    .set({
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy: validatedInput.removedBy,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(dmParticipantsTable.dmConversationId, validatedInput.dmId),
        eq(dmParticipantsTable.participantId, validatedInput.participantId),
        eq(dmParticipantsTable.isActive, true),
      ),
    )
    .returning();

  if (!updated) {
    throw new Error(
      "Participant not found in DM conversation or already removed",
    );
  }

  return RemoveParticipantOutputSchema.parse({
    success: true,
    message: "Participant removed from DM conversation successfully",
  });
}