import { z } from "zod";
import { listProjectChannels } from "@/main/ipc/channel/queries";
import { 
  GetProjectChannelsInputSchema,
  GetProjectChannelsOutputSchema,
  type GetProjectChannelsInput,
  type GetProjectChannelsOutput 
} from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("channel.get-project-channels.invoke");

export default async function(input: unknown): Promise<GetProjectChannelsOutput> {
  // Parse and validate input
  const validatedInput = GetProjectChannelsInputSchema.parse(input);
  
  logger.debug("Getting project channels", { projectId: validatedInput.projectId });

  // 1. Check authentication (replicando a lógica do controller original)
  const currentUser = requireAuth();
  
  // 2. List channels with ownership validation
  const dbChannels = await listProjectChannels({
    ...validatedInput,
    ownerId: currentUser.id
  });
  
  // 3. Map database results to shared types
  const result = dbChannels.map(channel => ({
    id: channel.id,
    projectId: channel.projectId,
    name: channel.name,
    description: channel.description,
    isArchived: !!channel.archivedAt,
    isActive: channel.isActive,
    deactivatedAt: channel.deactivatedAt,
    deactivatedBy: channel.deactivatedBy,
    createdAt: channel.createdAt,
    updatedAt: channel.updatedAt,
    lastMessage: channel.lastMessage
  }));
  
  logger.debug("Retrieved project channels", { count: result.length, projectId: validatedInput.projectId });
  
  // Note: No event emission for GET operations
  
  // 4. Validate and return output
  return GetProjectChannelsOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      getProjectChannels: (input: GetProjectChannelsInput) => Promise<GetProjectChannelsOutput>
    }
  }
}