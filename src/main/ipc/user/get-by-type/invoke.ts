import { z } from "zod";
import { findUserByIdAndType } from "@/main/ipc/user/queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("user.find-by-id-and-type.invoke");

const FindUserByIdAndTypeInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.enum(["human", "agent"]),
  includeInactive: z.boolean().optional().default(false)
});

const FindUserByIdAndTypeOutputSchema = UserSchema.nullable();

const handler = createIPCHandler({
  inputSchema: FindUserByIdAndTypeInputSchema,
  outputSchema: FindUserByIdAndTypeOutputSchema,
  handler: async (input) => {
    logger.debug("Finding user by ID and type", { 
      userId: input.userId, 
      type: input.type,
      includeInactive: input.includeInactive 
    });

    requireAuth();
    
    // Execute query
    const dbResult = await findUserByIdAndType(input);
    
    // Map SelectUser → User (remove technical fields)
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
    
    logger.debug("User find by ID and type result", { 
      userId: input.userId, 
      type: input.type,
      found: apiResult !== null
    });
    
    return apiResult;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface User {
      getByType: InferHandler<typeof handler>
    }
  }
}