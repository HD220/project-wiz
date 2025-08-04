import { z } from "zod";
import { 
  removeParticipant,
  type RemoveParticipantInput,
  type RemoveParticipantOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("dm.remove-participant.invoke");

// Input type para o invoke (sem removedBy que é adicionado automaticamente)
export type RemoveParticipantInvokeInput = Omit<RemoveParticipantInput, "removedBy">;

export default async function(input: RemoveParticipantInvokeInput): Promise<RemoveParticipantOutput> {
  logger.debug("Removing participant from DM", { dmId: input.dmId, participantId: input.participantId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Add removedBy from current user
  const removeData = {
    ...input,
    removedBy: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await removeParticipant(removeData);
  
  // 4. Emit specific event for this operation
  eventBus.emit("dm:participant-removed", { dmId: input.dmId, participantId: input.participantId });
  
  logger.debug("Participant removed from DM", { dmId: input.dmId, participantId: input.participantId, success: result.success });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      removeParticipant: (input: RemoveParticipantInvokeInput) => Promise<RemoveParticipantOutput>
    }
  }
}
