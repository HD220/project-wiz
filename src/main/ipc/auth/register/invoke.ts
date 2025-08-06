import { z } from "zod";
import { checkUsernameExists, createUserAccount } from "@/main/ipc/auth/queries";
import { UserSchema } from "@/shared/types";
import { eventBus } from "@/shared/services/events/event-bus";
import { sessionRegistry } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("auth.register");

const RegisterInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  name: z.string().min(1),
  avatar: z.string().optional(),
});

const RegisterOutputSchema = z.object({
  user: UserSchema,
  token: z.string(),
});

const handler = createIPCHandler({
  inputSchema: RegisterInputSchema,
  outputSchema: RegisterOutputSchema,
  handler: async (input) => {
    logger.info("Registering new user", { username: input.username });
    
    // 1. Check business rules
    const usernameExists = await checkUsernameExists(input.username);
    if (usernameExists) {
      throw new Error("Username already exists");
    }
    
    // 2. Query recebe dados e gerencia campos técnicos internamente
    const dbResult = await createUserAccount(input);
    
    // 3. Usar dbResult.user diretamente - já é AuthenticatedUser (SelectUser)
    const authenticatedUser = dbResult.user;
    
    // 4. Set session in registry (with proper expiry)
    sessionRegistry.setSession(authenticatedUser, dbResult.sessionToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    
    // 5. Mapeamento: AuthenticatedUser → User (API clean type)
    const apiUser = {
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      avatar: authenticatedUser.avatar,
      type: authenticatedUser.type,
      createdAt: new Date(authenticatedUser.createdAt),
      updatedAt: new Date(authenticatedUser.updatedAt),
    };
    
    // 6. Prepare API response
    const result = {
      user: apiUser,
      token: dbResult.sessionToken,
    };
    
    // 7. Emit user registration event
    eventBus.emit("user:registered", {
      userId: result.user.id,
      username: result.user.name,
      timestamp: new Date(),
    });
    
    logger.info("User registered successfully", { 
      userId: result.user.id, 
      username: input.username 
    });
    
    return result;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Auth {
      register: InferHandler<typeof handler>
    }
  }
}