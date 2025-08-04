import { z } from "zod";
import { getActiveAgentsCount } from "./queries";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.get-active-count.invoke");

// Output schema
const GetActiveCountOutputSchema = z.object({
  count: z.number(),
});

type GetActiveCountOutput = z.infer<typeof GetActiveCountOutputSchema>;

export default async function(): Promise<GetActiveCountOutput> {
  logger.debug("Getting active agents count");

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Query recebe dados e gerencia campos técnicos internamente
  const count = await getActiveAgentsCount(currentUser.id);
  
  // 3. Validate output
  const result = GetActiveCountOutputSchema.parse({ count });
  
  logger.debug("Got active agents count", { count: result.count });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      getActiveCount: () => Promise<GetActiveCountOutput>
    }
  }
}