import { z } from "zod";
import { findProjectChannel } from "@/main/ipc/channel/queries";
import { 
  GetChannelInputSchema,
  GetChannelOutputSchema,
  type GetChannelInput,
  type GetChannelOutput 
} from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("channel.get.invoke");

export default async function(channelId: GetChannelInput): Promise<GetChannelOutput> {
  // Parse and validate input
  const validatedChannelId = GetChannelInputSchema.parse(channelId);
  
  logger.debug("Getting channel by ID", { channelId: validatedChannelId });

  // 1. Check authentication (replicando a lógica do controller original)
  const currentUser = requireAuth();
  
  // 2. Find channel with ownership validation
  const dbChannel = await findProjectChannel(validatedChannelId, currentUser.id);
  
  // 3. Map database result to shared type
  const result = dbChannel ? {
    id: dbChannel.id,
    projectId: dbChannel.projectId,
    name: dbChannel.name,
    description: dbChannel.description,
    isArchived: !!dbChannel.archivedAt,
    isActive: dbChannel.isActive,
    deactivatedAt: dbChannel.deactivatedAt,
    deactivatedBy: dbChannel.deactivatedBy,
    createdAt: dbChannel.createdAt,
    updatedAt: dbChannel.updatedAt,
  } : null;
  
  logger.debug("Channel found", { found: !!result, channelId: validatedChannelId });
  
  // Note: No event emission for GET operations
  
  // 4. Validate and return output
  return GetChannelOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      get: (channelId: GetChannelInput) => Promise<GetChannelOutput>
    }
  }
}