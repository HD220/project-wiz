import { z } from "zod";
import { removeDMParticipant } from "@/main/ipc/dm/queries";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("dm.remove-participant.invoke");

// Input schema (without removedBy that is added automatically)
const RemoveParticipantInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  participantId: z.string().min(1, "Participant ID is required"),
});

// Output schema - void para operações de remoção
const RemoveParticipantOutputSchema = z.void();

type RemoveParticipantInput = z.infer<typeof RemoveParticipantInputSchema>;
type RemoveParticipantOutput = z.infer<typeof RemoveParticipantOutputSchema>;

export default async function(input: RemoveParticipantInput): Promise<RemoveParticipantOutput> {
  logger.debug("Removing participant from DM", { dmId: input.dmId, participantId: input.participantId });

  // 1. Validate input
  const validatedInput = RemoveParticipantInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute query
  const success = await removeDMParticipant(
    validatedInput.dmId,
    validatedInput.participantId,
    currentUser.id
  );
  
  if (!success) {
    throw new Error("Failed to remove participant from DM");
  }
  
  logger.debug("Participant removed from DM", { dmId: input.dmId, participantId: input.participantId });
  
  // 4. Emit specific event for this operation
  eventBus.emit("dm:participant-removed", { dmId: input.dmId, participantId: input.participantId });
  
  return undefined;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      removeParticipant: (input: RemoveParticipantInput) => Promise<RemoveParticipantOutput>
    }
  }
}
