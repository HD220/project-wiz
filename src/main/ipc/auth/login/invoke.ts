import { 
  validateLoginData, 
  authenticateUser,
  type LoginInput,
  type LoginOutput 
} from "./queries";
import { eventBus } from "@/shared/events/event-bus";
import { sessionRegistry } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("auth.login");

export default async function(params: LoginInput): Promise<LoginOutput> {
  logger.info("Authenticating user", { username: params.username });

  // 1. Validation using Zod
  const validatedInput = await validateLoginData(params);
  
  // 2. Execute core business logic
  const result = await authenticateUser(validatedInput);
  
  // 3. Set session in registry (with proper expiry)
  sessionRegistry.setSession(result.user, result.sessionToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  
  // 4. Emit user login event
  eventBus.emit("user:logged-in", {
    userId: result.user.id,
    username: result.user.name,
    timestamp: new Date(),
  });
  
  logger.info("User authenticated successfully", { 
    userId: result.user.id, 
    username: params.username 
  });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Auth {
      login: (params: LoginInput) => Promise<LoginOutput>
    }
  }
}