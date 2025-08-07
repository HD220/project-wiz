import { z } from "zod";

import { updateProjectChannel } from "@/main/ipc/channel/queries";
import { requireAuth } from "@/main/services/session-registry";

import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { ChannelSchema } from "@/shared/types/channel";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("channel.update.invoke");

const UpdateChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  name: z.string().min(1, "Channel name is required").optional(),
  description: z.string().optional(),
});

const UpdateChannelOutputSchema = ChannelSchema.extend({
  isArchived: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
});

const handler = createIPCHandler({
  inputSchema: UpdateChannelInputSchema,
  outputSchema: UpdateChannelOutputSchema,
  handler: async (input) => {
    logger.debug("Updating channel", { channelId: input.channelId });

    const currentUser = requireAuth();

    // Update channel with ownership validation
    const dbChannel = await updateProjectChannel({
      id: input.channelId,
      ownerId: currentUser.id,
      name: input.name,
      description: input.description,
    });

    if (!dbChannel) {
      throw new Error(
        `Failed to update channel or access denied: ${input.channelId}`,
      );
    }

    // Map database result to API format
    const result = {
      id: dbChannel.id,
      projectId: dbChannel.projectId,
      name: dbChannel.name,
      description: dbChannel.description,
      archivedAt: dbChannel.archivedAt ? new Date(dbChannel.archivedAt) : null,
      createdAt: new Date(dbChannel.createdAt),
      updatedAt: new Date(dbChannel.updatedAt),
      isArchived: !!dbChannel.archivedAt,
      isActive: !dbChannel.deactivatedAt,
      deactivatedAt: dbChannel.deactivatedAt
        ? new Date(dbChannel.deactivatedAt)
        : null,
    };

    logger.debug("Channel updated", {
      channelId: result.id,
      channelName: result.name,
    });

    // Emit specific event for channel update
    eventBus.emit("channel:updated", { channelId: result.id });

    return result;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Channel {
      update: InferHandler<typeof handler>;
    }
  }
}
