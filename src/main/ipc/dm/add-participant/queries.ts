import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmParticipantsTable,
  type SelectDMParticipant 
} from "@/main/database/schemas/dm-conversation.schema";
import type { AddParticipantInput, AddParticipantOutput } from "@/shared/types/dm-conversation";

const { getDatabase } = createDatabaseConnection(true);

export async function addParticipant(input: AddParticipantInput): Promise<AddParticipantOutput> {
  const db = getDatabase();
  
  const { dmId, participantId } = input;

  // Adicionar participante à DM (replicando dmConversationService.addParticipant)
  const [participant] = await db
    .insert(dmParticipantsTable)
    .values({
      dmConversationId: dmId,
      participantId: participantId,
    })
    .returning();

  if (!participant) {
    throw new Error("Failed to add participant to DM conversation");
  }

  return {
    success: true,
    message: "Participant added to DM conversation successfully",
    participant,
  };
}