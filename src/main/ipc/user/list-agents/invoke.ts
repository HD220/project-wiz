import { z } from "zod";
import { listAgents } from "@/main/ipc/user/queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("user.list-agents.invoke");

const ListAgentsInputSchema = z.object({
  ownerId: z.string().optional(),
  showInactive: z.boolean().optional()
}).optional();

const ListAgentsOutputSchema = z.array(UserSchema);

const handler = createIPCHandler({
  inputSchema: ListAgentsInputSchema,
  outputSchema: ListAgentsOutputSchema,
  handler: async (input) => {
    logger.debug("Listing agent users", { filters: input });

    requireAuth();
    
    // Execute core business logic
    const users = await listAgents(input || {});
    
    // Map to clean domain objects without technical fields
    const result = users.map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      type: user.type,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    }));
    
    logger.debug("Agent users listed", { 
      userCount: result.length, 
      filters: input 
    });
    
    return result;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface User {
      listAgents: InferHandler<typeof handler>
    }
  }
}