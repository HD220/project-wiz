import { z } from "zod";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmParticipantsTable,
  type SelectDMParticipant 
} from "@/main/database/schemas/dm-conversation.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const AddParticipantInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  participantId: z.string().min(1, "Participant ID is required"),
});

// Output validation schema
export const AddParticipantOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  participant: z.object({
    id: z.string(),
    dmConversationId: z.string(),
    participantId: z.string(),
    isActive: z.boolean(),
    deactivatedAt: z.number().nullable(),
    deactivatedBy: z.string().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
  }),
});

export type AddParticipantInput = z.infer<typeof AddParticipantInputSchema>;
export type AddParticipantOutput = z.infer<typeof AddParticipantOutputSchema>;

export async function addParticipant(input: AddParticipantInput): Promise<AddParticipantOutput> {
  const db = getDatabase();
  
  const validatedInput = AddParticipantInputSchema.parse(input);

  // Adicionar participante à DM (replicando dmConversationService.addParticipant)
  const [participant] = await db
    .insert(dmParticipantsTable)
    .values({
      dmConversationId: validatedInput.dmId,
      participantId: validatedInput.participantId,
    })
    .returning();

  if (!participant) {
    throw new Error("Failed to add participant to DM conversation");
  }

  return AddParticipantOutputSchema.parse({
    success: true,
    message: "Participant added to DM conversation successfully",
    participant,
  });
}