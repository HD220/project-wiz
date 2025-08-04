import { z } from "zod";
import { sessionRegistry } from "@/main/utils/session-registry";
import { UserSchema } from "@/shared/types";

const GetCurrentUserOutputSchema = UserSchema.nullable();

type GetCurrentUserOutput = z.infer<typeof GetCurrentUserOutputSchema>;

export default async function(): Promise<GetCurrentUserOutput> {
  // Simply return from session registry cache - no database access needed
  const dbUser = sessionRegistry.getCurrentUser();
  
  if (!dbUser) {
    return null;
  }
  
  // Map to API format (sem campos técnicos)
  const apiUser = {
    id: dbUser.id,
    name: dbUser.name,
    avatar: dbUser.avatar,
    type: dbUser.type,
    createdAt: new Date(dbUser.createdAt),
    updatedAt: new Date(dbUser.updatedAt),
  };
  
  return GetCurrentUserOutputSchema.parse(apiUser);
}

declare global {
  namespace WindowAPI {
    interface Auth {
      getCurrentUser: () => Promise<GetCurrentUserOutput>
    }
  }
}