import { z } from "zod";

import { unarchiveProjectChannel } from "@/main/ipc/channel/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { ChannelSchema } from "@/shared/types/channel";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("channel.unarchive.invoke");

const UnarchiveChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
});

const UnarchiveChannelOutputSchema = ChannelSchema.extend({
  archivedAt: z.date().nullable(),
});

const handler = createIPCHandler({
  inputSchema: UnarchiveChannelInputSchema,
  outputSchema: UnarchiveChannelOutputSchema,
  handler: async (input) => {
    logger.debug("Unarchiving channel", { channelId: input.channelId });

    const currentUser = requireAuth();

    // Unarchive channel with ownership validation
    const dbChannel = await unarchiveProjectChannel(
      input.channelId,
      currentUser.id,
    );

    if (!dbChannel) {
      throw new Error("Failed to unarchive channel or access denied");
    }

    // Mapeamento: SelectChannel → Channel (dados puros da entidade)
    const apiChannel = {
      id: dbChannel.id,
      projectId: dbChannel.projectId,
      name: dbChannel.name,
      description: dbChannel.description,
      archivedAt: dbChannel.archivedAt ? new Date(dbChannel.archivedAt) : null,
      createdAt: new Date(dbChannel.createdAt),
      updatedAt: new Date(dbChannel.updatedAt),
      deactivatedAt: null,
    };

    logger.debug("Channel unarchived", { channelId: apiChannel.id });

    // Emit specific event for channel unarchive
    emit("channel:unarchived", { channelId: apiChannel.id });

    return apiChannel;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Channel {
      unarchive: InferHandler<typeof handler>;
    }
  }
}
