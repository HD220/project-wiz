import { z } from "zod";
import { checkUsernameExists, createUserAccount } from "@/main/ipc/auth/queries";
import { UserSchema } from "@/shared/types";
import { eventBus } from "@/shared/services/events/event-bus";
import { sessionRegistry } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("auth.register");

// Input schema
const RegisterInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  name: z.string().min(1),
  avatar: z.string().optional(),
});

// Output schema  
const RegisterOutputSchema = z.object({
  success: z.boolean(),
  user: UserSchema.optional(),
  token: z.string().optional(),
  error: z.string().optional(),
});

type RegisterInput = z.infer<typeof RegisterInputSchema>;
type RegisterOutput = z.infer<typeof RegisterOutputSchema>;

export default async function(input: RegisterInput): Promise<RegisterOutput> {
  logger.info("Registering new user", { username: input.username });

  try {
    // 1. Validate input
    const validatedInput = RegisterInputSchema.parse(input);
    
    // 2. Check business rules
    const usernameExists = await checkUsernameExists(validatedInput.username);
    if (usernameExists) {
      return RegisterOutputSchema.parse({
        success: false,
        error: "Username already exists",
      });
    }
    
    // 3. Query recebe dados e gerencia campos técnicos internamente
    const dbResult = await createUserAccount(validatedInput);
    
    // 4. Usar dbResult.user diretamente - já é AuthenticatedUser (SelectUser)
    const authenticatedUser = dbResult.user;
    
    // 5. Set session in registry (with proper expiry)
    sessionRegistry.setSession(authenticatedUser, dbResult.sessionToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    
    // 6. Mapeamento: AuthenticatedUser → User (API clean type)
    const apiUser = {
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      avatar: authenticatedUser.avatar,
      type: authenticatedUser.type,
      createdAt: new Date(authenticatedUser.createdAt),
      updatedAt: new Date(authenticatedUser.updatedAt),
    };
    
    // 7. Validate output
    const result = RegisterOutputSchema.parse({
      success: true,
      user: apiUser,
      token: dbResult.sessionToken,
    });
    
    // 8. Emit user registration event
    eventBus.emit("user:registered", {
      userId: result.user!.id,
      username: result.user!.name,
      timestamp: new Date(),
    });
    
    logger.info("User registered successfully", { 
      userId: result.user!.id, 
      username: input.username 
    });
    
    return result;
  } catch (error) {
    logger.error("Registration failed", { error: error instanceof Error ? error.message : String(error) });
    
    return RegisterOutputSchema.parse({
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    });
  }
}

declare global {
  namespace WindowAPI {
    interface Auth {
      register: (input: RegisterInput) => Promise<RegisterOutput>
    }
  }
}