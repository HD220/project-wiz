import { createUser } from "@/main/ipc/user/queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("user.create.invoke");

const CreateUserInputSchema = UserSchema.pick({
  name: true,
  avatar: true,
  type: true
});

const CreateUserOutputSchema = UserSchema;

const handler = createIPCHandler({
  inputSchema: CreateUserInputSchema,
  outputSchema: CreateUserOutputSchema,
  handler: async (input) => {
    logger.debug("Creating user", { userName: input.name, userType: input.type });

    requireAuth();
    
    // Query recebe dados e gerencia campos técnicos internamente
    const dbUser = await createUser(input);
    
    // Mapeamento: SelectUser → User (sem campos técnicos)
    const apiUser = {
      id: dbUser.id,
      name: dbUser.name,
      avatar: dbUser.avatar,
      type: dbUser.type,
      createdAt: new Date(dbUser.createdAt),
      updatedAt: new Date(dbUser.updatedAt),
    };
    
    logger.debug("User created", { 
      userId: apiUser.id, 
      name: apiUser.name,
      type: apiUser.type
    });
    
    // Emit specific event for creation
    eventBus.emit("user:created", { userId: apiUser.id, type: apiUser.type });
    
    return apiUser;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface User {
      create: InferHandler<typeof handler>
    }
  }
}