import { z } from "zod";

import { createDMConversation } from "@/main/ipc/dm/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("dm.create.invoke");

const CreateDMInputSchema = z.object({
  participantIds: z
    .array(z.string())
    .min(1, "At least one participant is required"),
});

const CreateDMOutputSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
});

const handler = createIPCHandler({
  inputSchema: CreateDMInputSchema,
  outputSchema: CreateDMOutputSchema,
  handler: async (input) => {
    logger.debug("Creating DM conversation", {
      participantCount: input.participantIds.length,
    });

    const currentUser = requireAuth();

    // Create DM conversation with participants
    const dbDMConversation = await createDMConversation({
      ownerId: currentUser.id,
      participantIds: input.participantIds,
    });

    // Mapeamento simplificado: apenas id, name, description
    const apiDMConversation = {
      id: dbDMConversation.id,
      name: dbDMConversation.name,
      description: dbDMConversation.description,
    };

    logger.debug("DM conversation created", {
      dmId: apiDMConversation.id,
      name: apiDMConversation.name,
    });

    // Emit event
    emit("dm:created", { dmId: apiDMConversation.id });

    return apiDMConversation;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Dm {
      create: InferHandler<typeof handler>;
    }
  }
}
