import { z } from "zod";
import { findDMById } from "@/main/ipc/dm/queries";
import {
  GetDMInputSchema,
  GetDMOutputSchema,
  type GetDMInput,
  type GetDMOutput 
} from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("dm.get.invoke");

export default async function(dmId: GetDMInput): Promise<GetDMOutput> {
  logger.debug("Getting DM by ID", { dmId });

  // 1. Parse and validate input
  const parsedDmId = GetDMInputSchema.parse(dmId);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute core business logic (no event emission for queries)
  // Convert simple string to query object for existing function
  const result = await findDMById({ id: parsedDmId, includeInactive: false });
  
  logger.debug("DM found", { found: !!result, dmId: parsedDmId });
  
  // 4. Parse and return output
  return GetDMOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Dm {
      get: (dmId: GetDMInput) => Promise<GetDMOutput>
    }
  }
}