import { z } from "zod";
import { removeParticipant } from "./queries";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("dm.remove-participant.invoke");

// Input schema (without removedBy that is added automatically)
const RemoveParticipantInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  participantId: z.string().min(1, "Participant ID is required"),
});

// Output schema
const RemoveParticipantOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

type RemoveParticipantInput = z.infer<typeof RemoveParticipantInputSchema>;
type RemoveParticipantOutput = z.infer<typeof RemoveParticipantOutputSchema>;

export default async function(input: RemoveParticipantInput): Promise<RemoveParticipantOutput> {
  logger.debug("Removing participant from DM", { dmId: input.dmId, participantId: input.participantId });

  // 1. Validate input
  const validatedInput = RemoveParticipantInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute query
  const dbResult = await removeParticipant({
    ...validatedInput,
    removedBy: currentUser.id
  });
  
  // 4. Validate output
  const result = RemoveParticipantOutputSchema.parse(dbResult);
  
  // 5. Emit specific event for this operation
  eventBus.emit("dm:participant-removed", { dmId: input.dmId, participantId: input.participantId });
  
  logger.debug("Participant removed from DM", { dmId: input.dmId, participantId: input.participantId, success: result.success });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      removeParticipant: (input: RemoveParticipantInput) => Promise<RemoveParticipantOutput>
    }
  }
}
