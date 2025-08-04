import { z } from "zod";
import { 
  findDMById,
  type FindDMByIdInput,
  type FindDMByIdOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("dm.find-by-id.invoke");

export default async function(input: FindDMByIdInput): Promise<FindDMByIdOutput> {
  logger.debug("Finding DM by ID", { dmId: input.id });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic (no event emission for queries)
  const result = await findDMById(input);
  
  logger.debug("DM found", { found: !!result, dmId: input.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      findById: (input: FindDMByIdInput) => Promise<FindDMByIdOutput>
    }
  }
}