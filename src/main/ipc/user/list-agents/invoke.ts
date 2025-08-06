import { z } from "zod";
import { listAgents } from "@/main/ipc/user/queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("user.list-agents.invoke");

const InputSchema = z.object({
  ownerId: z.string().optional(),
  showInactive: z.boolean().optional()
}).optional();

const OutputSchema = z.array(UserSchema);

type Input = z.infer<typeof InputSchema>;
type Output = z.infer<typeof OutputSchema>;

export default async function(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  
  logger.debug("Listing agent users", { filters: validatedInput });

  // 1. Check authentication
  requireAuth();
  
  // 2. Execute core business logic
  const users = await listAgents(validatedInput || {});
  
  // 3. Map to clean domain objects without technical fields
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
    filters: validatedInput 
  });
  
  return OutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface User {
      listAgents: (input: Input) => Promise<Output>
    }
  }
}