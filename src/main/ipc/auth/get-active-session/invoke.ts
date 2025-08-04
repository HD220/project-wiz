import { z } from "zod";
import { initializeSessionFromDatabase, getCurrentUserFromCache } from "./queries";
import { UserSchema } from "@/shared/types";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("auth.get-active-session");

// Output schema usando shared schema
const GetActiveSessionOutputSchema = z.object({
  user: UserSchema
}).nullable();

export type GetActiveSessionOutput = z.infer<typeof GetActiveSessionOutputSchema>;

export default async function(): Promise<GetActiveSessionOutput> {
  logger.debug("Getting active session");

  // 1. Initialize session from database if not already loaded (side effect)
  await initializeSessionFromDatabase();
  
  // 2. Get current user from cache
  const dbUser = getCurrentUserFromCache();
  
  if (!dbUser) {
    return null;
  }
  
  // 3. Map to API format (sem campos técnicos)
  const apiUser = {
    id: dbUser.id,
    name: dbUser.name,
    avatar: dbUser.avatar,
    type: dbUser.type,
    createdAt: new Date(dbUser.createdAt),
    updatedAt: new Date(dbUser.updatedAt),
  };
  
  return GetActiveSessionOutputSchema.parse({ user: apiUser });
}

declare global {
  namespace WindowAPI {
    interface Auth {
      getActiveSession: () => Promise<GetActiveSessionOutput>
    }
  }
}