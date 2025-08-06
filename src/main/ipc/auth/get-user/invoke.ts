import { z } from "zod";
import { getUserById } from "@/main/ipc/auth/queries";
import { UserSchema } from "@/shared/types";

// Input schema - object wrapper para consistência
const GetUserByIdInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Output schema
const GetUserByIdOutputSchema = UserSchema.nullable();

type GetUserByIdInput = z.infer<typeof GetUserByIdInputSchema>;
type GetUserByIdOutput = z.infer<typeof GetUserByIdOutputSchema>;

export default async function(input: GetUserByIdInput): Promise<GetUserByIdOutput> {
  // 1. Validate input
  const validatedInput = GetUserByIdInputSchema.parse(input);
  
  // 2. Query database
  const dbUser = await getUserById(validatedInput.userId);
  
  // 3. Mapeamento: SelectUser → User (sem campos técnicos)
  const apiUser = dbUser ? {
    id: dbUser.id,
    name: dbUser.name,
    avatar: dbUser.avatar,
    type: dbUser.type,
    createdAt: new Date(dbUser.createdAt),
    updatedAt: new Date(dbUser.updatedAt),
  } : null;
  
  // 4. Validate output
  const result = GetUserByIdOutputSchema.parse(apiUser);
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Auth {
      getUser: (input: GetUserByIdInput) => Promise<GetUserByIdOutput>
    }
  }
}