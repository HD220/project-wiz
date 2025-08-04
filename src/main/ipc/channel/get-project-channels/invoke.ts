import { z } from "zod";
import { 
  getProjectChannels,
  type GetProjectChannelsInput,
  type GetProjectChannelsOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("channel.get-project-channels.invoke");

export default async function(input: GetProjectChannelsInput): Promise<GetProjectChannelsOutput> {
  logger.debug("Getting project channels", { projectId: input.projectId });

  // 1. Check authentication (replicando a lógica do controller original)
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await getProjectChannels(input);
  
  logger.debug("Retrieved project channels", { count: result.length, projectId: input.projectId });
  
  // Note: No event emission for GET operations
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      getProjectChannels: (input: GetProjectChannelsInput) => Promise<GetProjectChannelsOutput>
    }
  }
}