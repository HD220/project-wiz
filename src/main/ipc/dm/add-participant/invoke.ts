import { z } from "zod";
import { 
  addParticipant,
  type AddParticipantInput,
  type AddParticipantOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("dm.add-participant.invoke");

export default async function(input: AddParticipantInput): Promise<AddParticipantOutput> {
  logger.debug("Adding participant to DM", { dmId: input.dmId, participantId: input.participantId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await addParticipant(input);
  
  // 3. Emit specific event for this operation
  eventBus.emit("dm:participant-added", { dmId: input.dmId, participantId: input.participantId });
  
  logger.debug("Participant added to DM", { dmId: input.dmId, participantId: input.participantId, success: result.success });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      addParticipant: (input: AddParticipantInput) => Promise<AddParticipantOutput>
    }
  }
}
