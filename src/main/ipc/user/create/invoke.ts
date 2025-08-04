import { z } from "zod";
import { createUser } from "./queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("user.create.invoke");

// Input schema - apenas campos de negócio
const CreateUserInputSchema = UserSchema.pick({
  name: true,
  avatar: true,
  type: true
});

// Output schema
const CreateUserOutputSchema = UserSchema;

type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
type CreateUserOutput = z.infer<typeof CreateUserOutputSchema>;

export default async function(input: CreateUserInput): Promise<CreateUserOutput> {
  logger.debug("Creating user", { userName: input.name, userType: input.type });

  // 1. Validate input
  const validatedInput = CreateUserInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Query recebe dados e gerencia campos técnicos internamente
  const dbUser = await createUser(validatedInput);
  
  // 4. Mapeamento: SelectUser → User (sem campos técnicos)
  const apiUser = {
    id: dbUser.id,
    name: dbUser.name,
    avatar: dbUser.avatar,
    type: dbUser.type,
    createdAt: new Date(dbUser.createdAt),
    updatedAt: new Date(dbUser.updatedAt),
  };
  
  // 5. Validate output
  const result = CreateUserOutputSchema.parse(apiUser);
  
  logger.debug("User created", { 
    userId: result.id, 
    name: result.name,
    type: result.type
  });
  
  // 6. Emit specific event for creation
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