import { z } from "zod";
import { authenticateUser } from "./queries";
import { UserSchema } from "@/shared/types";
import { eventBus } from "@/shared/events/event-bus";
import { sessionRegistry } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("auth.login");

const LoginInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const LoginOutputSchema = z.object({
  success: z.boolean(),
  user: UserSchema.nullable(),
  token: z.string().optional(),
});

type LoginInput = z.infer<typeof LoginInputSchema>;
type LoginOutput = z.infer<typeof LoginOutputSchema>;

export default async function(input: LoginInput): Promise<LoginOutput> {
  logger.info("Authenticating user", { username: input.username });

  // 1. Validate input
  const validatedInput = LoginInputSchema.parse(input);
  
  // 2. Query recebe dados e gerencia campos técnicos internamente
  const dbResult = await authenticateUser(validatedInput);
  
  // 3. Mapeamento: SelectUser → User (sem campos técnicos)
  const apiUser = {
    id: dbResult.user.id,
    name: dbResult.user.name,
    avatar: dbResult.user.avatar,
    type: dbResult.user.type,
    createdAt: new Date(dbResult.user.createdAt),
    updatedAt: new Date(dbResult.user.updatedAt),
  };
  
  // 4. Set session in registry (with proper expiry)
  sessionRegistry.setSession(apiUser, dbResult.sessionToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  
  // 5. Prepare API response
  const apiResponse = {
    success: true,
    user: apiUser,
    token: dbResult.sessionToken,
  };
  
  // 6. Validate output
  const result = LoginOutputSchema.parse(apiResponse);
  
  // 7. Emit user login event
  eventBus.emit("user:logged-in", {
    userId: result.user!.id,
    username: result.user!.name,
    timestamp: new Date(),
  });
  
  logger.info("User authenticated successfully", { 
    userId: result.user!.id, 
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