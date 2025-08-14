import { z } from "zod";

import { removeDMParticipant } from "@/main/ipc/dm/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("dm.remove-participant.invoke");

const RemoveParticipantInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  participantId: z.string().min(1, "Participant ID is required"),
});

const RemoveParticipantOutputSchema = z.void();

const handler = createIPCHandler({
  inputSchema: RemoveParticipantInputSchema,
  outputSchema: RemoveParticipantOutputSchema,
  handler: async (input) => {
    logger.debug("Removing participant from DM", {
      dmId: input.dmId,
      participantId: input.participantId,
    });

    const currentUser = requireAuth();

    // Execute query
    const success = await removeDMParticipant(
      input.dmId,
      input.participantId,
      currentUser.id,
    );

    if (!success) {
      throw new Error("Failed to remove participant from DM");
    }

    logger.debug("Participant removed from DM", {
      dmId: input.dmId,
      participantId: input.participantId,
    });

    // Emit specific event for this operation
    emit("dm:participant-removed", {
      dmId: input.dmId,
      participantId: input.participantId,
    });

    return undefined;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Dm {
      removeParticipant: InferHandler<typeof handler>;
    }
  }
}
