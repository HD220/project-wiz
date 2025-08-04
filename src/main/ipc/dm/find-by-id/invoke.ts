import { z } from "zod";
import { findDMById } from "./queries";
import {
  FindDMByIdInputSchema,
  FindDMByIdOutputSchema,
  type FindDMByIdInput,
  type FindDMByIdOutput 
} from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("dm.find-by-id.invoke");

export default async function(input: FindDMByIdInput): Promise<FindDMByIdOutput> {
  logger.debug("Finding DM by ID", { dmId: input.id });

  // 1. Parse and validate input
  const parsedInput = FindDMByIdInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute core business logic (no event emission for queries)
  const result = await findDMById(parsedInput);
  
  logger.debug("DM found", { found: !!result, dmId: input.id });
  
  // 4. Parse and return output
  return FindDMByIdOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Dm {
      findById: (input: FindDMByIdInput) => Promise<FindDMByIdOutput>
    }
  }
}