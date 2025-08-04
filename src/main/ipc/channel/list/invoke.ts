import { z } from "zod";
import { getProjectChannels } from "./queries";
import { 
  GetProjectChannelsInputSchema,
  GetProjectChannelsOutputSchema,
  type GetProjectChannelsInput,
  type GetProjectChannelsOutput 
} from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("channel.get-project-channels.invoke");

export default async function(input: unknown): Promise<GetProjectChannelsOutput> {
  // Parse and validate input
  const validatedInput = GetProjectChannelsInputSchema.parse(input);
  
  logger.debug("Getting project channels", { projectId: validatedInput.projectId });

  // 1. Check authentication (replicando a lógica do controller original)
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await getProjectChannels(validatedInput);
  
  logger.debug("Retrieved project channels", { count: result.length, projectId: validatedInput.projectId });
  
  // Note: No event emission for GET operations
  
  // Parse and return output
  return GetProjectChannelsOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      getProjectChannels: (input: GetProjectChannelsInput) => Promise<GetProjectChannelsOutput>
    }
  }
}