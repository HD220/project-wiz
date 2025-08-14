import { z } from "zod";

import { archiveProjectChannel } from "@/main/ipc/channel/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { ChannelSchema } from "@/shared/types/channel";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("channel.archive.invoke");

const ArchiveChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
});

const ArchiveChannelOutputSchema = ChannelSchema.extend({
  archivedAt: z.date().nullable(),
});

const handler = createIPCHandler({
  inputSchema: ArchiveChannelInputSchema,
  outputSchema: ArchiveChannelOutputSchema,
  handler: async (input) => {
    logger.debug("Archiving channel", { channelId: input.channelId });

    const currentUser = requireAuth();

    // Archive channel with ownership validation
    const dbChannel = await archiveProjectChannel(
      input.channelId,
      currentUser.id,
    );

    if (!dbChannel) {
      throw new Error("Failed to archive channel or access denied");
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

    logger.debug("Channel archived", { channelId: apiChannel.id });

    // Emit specific event for channel archive
    emit("channel:archived", { channelId: apiChannel.id });

    return apiChannel;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Channel {
      archive: InferHandler<typeof handler>;
    }
  }
}
