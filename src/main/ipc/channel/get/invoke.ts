import { z } from "zod";
import { findProjectChannel } from "@/main/ipc/channel/queries";
import { 
  FindChannelByIdInputSchema,
  FindChannelByIdOutputSchema,
  type FindChannelByIdInput,
  type FindChannelByIdOutput 
} from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("channel.find-by-id.invoke");

export default async function(input: unknown): Promise<FindChannelByIdOutput> {
  // Parse and validate input
  const validatedInput = FindChannelByIdInputSchema.parse(input);
  
  logger.debug("Finding channel by ID", { channelId: validatedInput.id });

  // 1. Check authentication (replicando a lógica do controller original)
  const currentUser = requireAuth();
  
  // 2. Find channel with ownership validation
  const dbChannel = await findProjectChannel(validatedInput.id, currentUser.id);
  
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
  
  logger.debug("Channel found", { found: !!result, channelId: validatedInput.id });
  
  // Note: No event emission for GET operations
  
  // 4. Validate and return output
  return FindChannelByIdOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      findById: (input: FindChannelByIdInput) => Promise<FindChannelByIdOutput>
    }
  }
}