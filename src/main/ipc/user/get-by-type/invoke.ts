import { z } from "zod";
import { findUserByIdAndType } from "@/main/ipc/user/queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("user.find-by-id-and-type.invoke");

// Input schema
const FindUserByIdAndTypeInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.enum(["human", "agent"]),
  includeInactive: z.boolean().optional().default(false)
});

// Output schema (nullable - user might not be found)
const FindUserByIdAndTypeOutputSchema = UserSchema.nullable();

type FindUserByIdAndTypeInput = z.infer<typeof FindUserByIdAndTypeInputSchema>;
type FindUserByIdAndTypeOutput = z.infer<typeof FindUserByIdAndTypeOutputSchema>;

export default async function(input: FindUserByIdAndTypeInput): Promise<FindUserByIdAndTypeOutput> {
  logger.debug("Finding user by ID and type", { 
    userId: input.userId, 
    type: input.type,
    includeInactive: input.includeInactive 
  });

  // 1. Validate input
  const validatedInput = FindUserByIdAndTypeInputSchema.parse(input);

  // 2. Check authentication
  requireAuth();
  
  // 3. Execute query
  const dbResult = await findUserByIdAndType(validatedInput);
  
  // 4. Map SelectUser → User (remove technical fields)
  let apiResult = null;
  if (dbResult) {
    apiResult = {
      id: dbResult.id,
      name: dbResult.name,
      avatar: dbResult.avatar,
      type: dbResult.type,
      createdAt: new Date(dbResult.createdAt),
      updatedAt: new Date(dbResult.updatedAt),
    };
  }
  
  // 5. Validate output
  const result = FindUserByIdAndTypeOutputSchema.parse(apiResult);
  
  logger.debug("User find by ID and type result", { 
    userId: input.userId, 
    type: input.type,
    found: result !== null
  });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      getByType: (input: FindUserByIdAndTypeInput) => Promise<FindUserByIdAndTypeOutput>
    }
  }
}