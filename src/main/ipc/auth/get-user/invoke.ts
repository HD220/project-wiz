import { z } from "zod";
import { getUserById } from "@/main/ipc/auth/queries";
import { UserSchema } from "@/shared/types";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const GetUserByIdInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

const GetUserByIdOutputSchema = UserSchema.nullable();

const handler = createIPCHandler({
  inputSchema: GetUserByIdInputSchema,
  outputSchema: GetUserByIdOutputSchema,
  handler: async (input) => {
    // 1. Query database
    const dbUser = await getUserById(input.userId);
    
    // 2. Mapeamento: SelectUser → User (sem campos técnicos)
    const apiUser = dbUser ? {
      id: dbUser.id,
      name: dbUser.name,
      avatar: dbUser.avatar,
      type: dbUser.type,
      createdAt: new Date(dbUser.createdAt),
      updatedAt: new Date(dbUser.updatedAt),
    } : null;
    
    return apiUser;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Auth {
      getUser: InferHandler<typeof handler>
    }
  }
}