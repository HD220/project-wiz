import { z } from "zod";
import { authenticateUser } from "@/main/ipc/auth/queries";
import { UserSchema } from "@/shared/types";
import { eventBus } from "@/shared/services/events/event-bus";
import { sessionRegistry } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("auth.login");

const LoginInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const LoginOutputSchema = z.object({
  user: UserSchema,
  token: z.string(),
});

type LoginInput = z.infer<typeof LoginInputSchema>;
type LoginOutput = z.infer<typeof LoginOutputSchema>;

export default async function(input: LoginInput): Promise<LoginOutput> {
  logger.info("Authenticating user", { username: input.username });

  // 1. Validate input
  const validatedInput = LoginInputSchema.parse(input);
  
  // 2. Query recebe dados e gerencia campos técnicos internamente
  const dbResult = await authenticateUser(validatedInput);
  
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
  const apiResponse = {
    user: apiUser,
    token: dbResult.sessionToken,
  };
  
  // 6. Validate output
  const result = LoginOutputSchema.parse(apiResponse);
  
  // 7. Emit user login event
  eventBus.emit("user:logged-in", {
    userId: result.user.id,
    username: result.user.name,
    timestamp: new Date(),
  });
  
  logger.info("User authenticated successfully", { 
    userId: result.user.id, 
    username: input.username 
  });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Auth {
      login: (input: LoginInput) => Promise<LoginOutput>
    }
  }
}