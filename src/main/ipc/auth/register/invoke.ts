import { 
  validateRegisterData, 
  checkUsernameExists, 
  createUserAccount,
  type RegisterInput,
  type RegisterOutput 
} from "./queries";
import { eventBus } from "@/shared/events/event-bus";
import { sessionRegistry } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("auth.register");

export default async function(params: RegisterInput): Promise<RegisterOutput> {
  logger.info("Registering new user", { username: params.username });

  // 1. Validation using Zod
  const validatedInput = await validateRegisterData(params);
  
  // 2. Check business rules
  const usernameExists = await checkUsernameExists(validatedInput.username);
  if (usernameExists) {
    throw new Error("Username already exists");
  }
  
  // 3. Execute core business logic
  const result = await createUserAccount(validatedInput);
  
  // 4. Set session in registry (with proper expiry)
  sessionRegistry.setSession(result.user, result.sessionToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  
  // 5. Emit user registration event
  eventBus.emit("user:registered", {
    userId: result.user.id,
    username: result.user.name,
    timestamp: new Date(),
  });
  
  logger.info("User registered successfully", { 
    userId: result.user.id, 
    username: params.username 
  });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Auth {
      register: (params: RegisterInput) => Promise<RegisterOutput>
    }
  }
}