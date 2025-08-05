import { z } from "zod";
import { findUser } from "@/main/ipc/user/queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("user.find-by-id.invoke");

// Input schema - campos necessários para busca
const FindUserByIdInputSchema = z.object({
  userId: z.string(),
  includeInactive: z.boolean().default(false),
});

// Output schema
const FindUserByIdOutputSchema = UserSchema.nullable();

type FindUserByIdInput = z.infer<typeof FindUserByIdInputSchema>;
type FindUserByIdOutput = z.infer<typeof FindUserByIdOutputSchema>;

export default async function(input: FindUserByIdInput): Promise<FindUserByIdOutput> {
  logger.debug("Finding user by ID");

  // 1. Validate input
  const validatedInput = FindUserByIdInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Query recebe dados e gerencia campos técnicos internamente
  const dbUser = await findUser(validatedInput.userId, validatedInput.includeInactive);
  
  // 4. Mapeamento: SelectUser → User (sem campos técnicos)
  const apiUser = dbUser ? {
    id: dbUser.id,
    name: dbUser.name,
    avatar: dbUser.avatar,
    type: dbUser.type,
    createdAt: new Date(dbUser.createdAt),
    updatedAt: new Date(dbUser.updatedAt),
  } : null;
  
  // 5. Validate output
  const result = FindUserByIdOutputSchema.parse(apiUser);
  
  logger.debug("User find by ID result", { found: result !== null });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      get: (input: FindUserByIdInput) => Promise<FindUserByIdOutput>
    }
  }
}