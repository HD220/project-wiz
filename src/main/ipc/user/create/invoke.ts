import { 
  createUser,
  type CreateUserInput,
  type CreateUserOutput 
} from "./model";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/main/core/event-bus";

const logger = getLogger("user.create.invoke");

export default async function(input: CreateUserInput): Promise<CreateUserOutput> {
  logger.debug("Creating user", { name: input.name, type: input.type });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await createUser(input);
  
  logger.debug("User created", { 
    userId: result.id, 
    name: result.name,
    type: result.type
  });
  
  // 3. Emit specific event for creation
  eventBus.emit("user:created", { userId: result.id, type: result.type });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      create: (input: CreateUserInput) => Promise<CreateUserOutput>
    }
  }
}