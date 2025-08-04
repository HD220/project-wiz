import { z } from "zod";
import { findChannelById } from "./queries";
import { 
  FindChannelByIdInputSchema,
  FindChannelByIdOutputSchema,
  type FindChannelByIdInput,
  type FindChannelByIdOutput 
} from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("channel.find-by-id.invoke");

export default async function(input: unknown): Promise<FindChannelByIdOutput> {
  // Parse and validate input
  const validatedInput = FindChannelByIdInputSchema.parse(input);
  
  logger.debug("Finding channel by ID", { channelId: validatedInput.id });

  // 1. Check authentication (replicando a lógica do controller original)
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await findChannelById(validatedInput);
  
  logger.debug("Channel found", { found: !!result, channelId: validatedInput.id });
  
  // Note: No event emission for GET operations
  
  // Parse and return output
  return FindChannelByIdOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      findById: (input: FindChannelByIdInput) => Promise<FindChannelByIdOutput>
    }
  }
}