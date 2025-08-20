import { z } from "zod";

import { addDMParticipant } from "@/main/ipc/dm/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("dm.add-participant.invoke");

const AddParticipantInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  participantId: z.string().min(1, "Participant ID is required"),
});

const AddParticipantOutputSchema = z.object({
  id: z.string(),
  directMessageId: z.string(),
  participantId: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const handler = createIPCHandler({
  inputSchema: AddParticipantInputSchema,
  outputSchema: AddParticipantOutputSchema,
  handler: async (input) => {
    logger.debug("Adding participant to DM", {
      dmId: input.dmId,
      participantId: input.participantId,
    });

    const currentUser = requireAuth();

    // Execute business logic with ownership validation
    const dbParticipant = await addDMParticipant({
      ownerId: currentUser.id,
      directMessageId: input.dmId,
      participantId: input.participantId,
    });

    // Mapeamento: SelectDMParticipant → DMParticipant (dados puros da entidade)
    const apiParticipant = {
      id: dbParticipant.id!,
      directMessageId: dbParticipant.directMessageId,
      participantId: dbParticipant.participantId,
      isActive: !dbParticipant.deactivatedAt,
      createdAt: dbParticipant.createdAt,
      updatedAt: dbParticipant.updatedAt,
    };

    logger.debug("Participant added to DM", {
      dmId: apiParticipant.directMessageId,
      participantId: apiParticipant.participantId,
    });

    // Emit event
    emit("dm:participant-added", {
      dmId: apiParticipant.directMessageId,
      participantId: apiParticipant.participantId,
    });

    return apiParticipant;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Dm {
      addParticipant: InferHandler<typeof handler>;
    }
  }
}
