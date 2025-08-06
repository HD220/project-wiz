import { z } from "zod";
import { findProjectChannel } from "@/main/ipc/channel/queries";
import { ChannelSchema } from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("channel.get.invoke");

// Input schema - apenas o channelId
const GetChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
});

// Output schema - extende ChannelSchema com campos adicionais para o GET
const GetChannelOutputSchema = ChannelSchema.extend({
  isArchived: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
}).nullable();

type GetChannelInput = z.infer<typeof GetChannelInputSchema>;
type GetChannelOutput = z.infer<typeof GetChannelOutputSchema>;

export default async function(input: GetChannelInput): Promise<GetChannelOutput> {
  // Parse and validate input
  const validatedInput = GetChannelInputSchema.parse(input);
  
  logger.debug("Getting channel by ID", { channelId: validatedInput.channelId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Find channel with ownership validation
  const dbChannel = await findProjectChannel(validatedInput.channelId, currentUser.id);
  
  // 3. Map database result to API format
  const result = dbChannel ? {
    id: dbChannel.id,
    projectId: dbChannel.projectId,
    name: dbChannel.name,
    description: dbChannel.description,
    archivedAt: dbChannel.archivedAt ? new Date(dbChannel.archivedAt) : null,
    archivedBy: dbChannel.archivedBy,
    createdAt: new Date(dbChannel.createdAt),
    updatedAt: new Date(dbChannel.updatedAt),
    isArchived: !!dbChannel.archivedAt,
    isActive: dbChannel.isActive,
    deactivatedAt: dbChannel.deactivatedAt,
    deactivatedBy: dbChannel.deactivatedBy,
  } : null;
  
  logger.debug("Channel found", { found: !!result, channelId: validatedInput.channelId });
  
  // 4. Emit event
  eventBus.emit("channel:get", { channelId: validatedInput.channelId, found: !!result });
  
  // 5. Validate and return output
  return GetChannelOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      get: (input: GetChannelInput) => Promise<GetChannelOutput>
    }
  }
}