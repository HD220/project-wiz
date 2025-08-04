import { z } from "zod";
import { addParticipant } from "./queries";
import {
  AddParticipantInputSchema,
  AddParticipantOutputSchema,
  type AddParticipantInput,
  type AddParticipantOutput 
} from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("dm.add-participant.invoke");

export default async function(input: AddParticipantInput): Promise<AddParticipantOutput> {
  logger.debug("Adding participant to DM", { dmId: input.dmId, participantId: input.participantId });

  // 1. Parse and validate input
  const parsedInput = AddParticipantInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute core business logic
  const result = await addParticipant(parsedInput);
  
  // 4. Emit specific event for this operation
  eventBus.emit("dm:participant-added", { dmId: input.dmId, participantId: input.participantId });
  
  logger.debug("Participant added to DM", { dmId: input.dmId, participantId: input.participantId, success: result.success });
  
  // 5. Parse and return output
  return AddParticipantOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Dm {
      addParticipant: (input: AddParticipantInput) => Promise<AddParticipantOutput>
    }
  }
}
