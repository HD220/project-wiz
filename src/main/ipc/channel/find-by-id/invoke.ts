import { z } from "zod";
import { 
  findChannelById,
  type FindChannelByIdInput,
  type FindChannelByIdOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("channel.find-by-id.invoke");

export default async function(input: FindChannelByIdInput): Promise<FindChannelByIdOutput> {
  logger.debug("Finding channel by ID", { channelId: input.id });

  // 1. Check authentication (replicando a lógica do controller original)
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await findChannelById(input);
  
  logger.debug("Channel found", { found: !!result, channelId: input.id });
  
  // Note: No event emission for GET operations
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      findById: (input: FindChannelByIdInput) => Promise<FindChannelByIdOutput>
    }
  }
}