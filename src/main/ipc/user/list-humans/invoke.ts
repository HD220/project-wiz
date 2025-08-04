import { z } from "zod";
import { getHumans } from "./queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("user.list-humans.invoke");

const InputSchema = z.object({
  showInactive: z.boolean().optional()
}).optional();

const OutputSchema = z.array(UserSchema);

type Input = z.infer<typeof InputSchema>;
type Output = z.infer<typeof OutputSchema>;

export default async function(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  
  logger.debug("Listing human users", { showInactive: validatedInput?.showInactive });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const users = await getHumans({ showInactive: validatedInput?.showInactive });
  
  // 3. Map to clean domain objects (removing technical fields)
  const result = users.map(user => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    type: user.type,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt)
  }));
  
  logger.debug("Human users listed", { 
    userCount: result.length, 
    showInactive: validatedInput?.showInactive 
  });
  
  return OutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface User {
      listHumans: (input: Input) => Promise<Output>
    }
  }
}