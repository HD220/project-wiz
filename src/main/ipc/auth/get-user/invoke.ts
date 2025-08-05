import { z } from "zod";
import { getUserById } from "@/main/ipc/auth/queries";
import { UserSchema } from "@/shared/types";

// Input schema
const GetUserByIdInputSchema = z.string().min(1);

// Output schema
const GetUserByIdOutputSchema = UserSchema.nullable();

type GetUserByIdInput = z.infer<typeof GetUserByIdInputSchema>;
type GetUserByIdOutput = z.infer<typeof GetUserByIdOutputSchema>;

export default async function(input: GetUserByIdInput): Promise<GetUserByIdOutput> {
  // 1. Validate input
  const validatedUserId = GetUserByIdInputSchema.parse(input);
  
  // 2. Query database
  const dbUser = await getUserById(validatedUserId);
  
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