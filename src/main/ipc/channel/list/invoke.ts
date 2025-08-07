import { z } from "zod";

import { listProjectChannels } from "@/main/ipc/channel/queries";
import { requireAuth } from "@/main/services/session-registry";

import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { ChannelSchema } from "@/shared/types/channel";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("channel.get-project-channels.invoke");

const GetProjectChannelsInputSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  includeInactive: z.boolean().optional().default(false),
  includeArchived: z.boolean().optional().default(false),
});

const GetProjectChannelsOutputSchema = z.array(
  ChannelSchema.extend({
    isArchived: z.boolean(),
    isActive: z.boolean(),
    deactivatedAt: z.date().nullable(),
    lastMessage: z
      .object({
        id: z.string(),
        content: z.string(),
        authorId: z.string(),
        createdAt: z.number(),
        updatedAt: z.number(),
      })
      .optional(),
  }),
);

const handler = createIPCHandler({
  inputSchema: GetProjectChannelsInputSchema,
  outputSchema: GetProjectChannelsOutputSchema,
  handler: async (input) => {
    logger.debug("Getting project channels", { projectId: input.projectId });

    const currentUser = requireAuth();

    // List channels with ownership validation
    const dbChannels = await listProjectChannels({
      projectId: input.projectId,
      ownerId: currentUser.id,
      includeInactive: input.includeInactive,
      includeArchived: input.includeArchived,
    });

    // Map database results to API format
    const result = dbChannels.map((channel) => ({
      id: channel.id,
      projectId: channel.projectId,
      name: channel.name,
      description: channel.description,
      archivedAt: channel.archivedAt ? new Date(channel.archivedAt) : null,
      createdAt: new Date(channel.createdAt),
      updatedAt: new Date(channel.updatedAt),
      isArchived: !!channel.archivedAt,
      isActive: !channel.deactivatedAt,
      deactivatedAt: channel.deactivatedAt
        ? new Date(channel.deactivatedAt)
        : null,
      lastMessage: channel.lastMessage,
    }));

    logger.debug("Retrieved project channels", {
      count: result.length,
      projectId: input.projectId,
    });

    // Emit event
    eventBus.emit("channel:list", {
      projectId: input.projectId,
      channelCount: result.length,
    });

    return result;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Channel {
      list: InferHandler<typeof handler>;
    }
  }
}
