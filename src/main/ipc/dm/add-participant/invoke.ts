import { z } from "zod";
import { addDMParticipant } from "@/main/ipc/dm/queries";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("dm.add-participant.invoke");

// Input schema - apenas dados de negócio (ownerId vem do currentUser)
const AddParticipantInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  participantId: z.string().min(1, "Participant ID is required"),
});

// Output schema - dados puros da entidade participant
const AddParticipantOutputSchema = z.object({
  id: z.string(),
  dmConversationId: z.string(),
  participantId: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type AddParticipantInput = z.infer<typeof AddParticipantInputSchema>;
type AddParticipantOutput = z.infer<typeof AddParticipantOutputSchema>;

export default async function(input: AddParticipantInput): Promise<AddParticipantOutput> {
  logger.debug("Adding participant to DM", { dmId: input.dmId, participantId: input.participantId });

  // 1. Validate input
  const validatedInput = AddParticipantInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute business logic with ownership validation
  const dbParticipant = await addDMParticipant({
    ownerId: currentUser.id,
    dmConversationId: validatedInput.dmId,
    participantId: validatedInput.participantId,
    isActive: true,
  });
  
  // 4. Map to API format
  const apiParticipant = {
    id: dbParticipant.id!,
    dmConversationId: dbParticipant.dmConversationId,
    participantId: dbParticipant.participantId,
    isActive: dbParticipant.isActive,
    createdAt: dbParticipant.createdAt,
    updatedAt: dbParticipant.updatedAt,
  };
  
  // 5. Validate output
  const result = AddParticipantOutputSchema.parse(apiParticipant);
  
  logger.debug("Participant added to DM", { dmId: result.dmConversationId, participantId: result.participantId });
  
  // 6. Emit event
  eventBus.emit("dm:participant-added", { dmId: result.dmConversationId, participantId: result.participantId });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      addParticipant: (input: AddParticipantInput) => Promise<AddParticipantOutput>
    }
  }
}
