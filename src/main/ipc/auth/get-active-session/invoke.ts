import { z } from "zod";
import { initializeSessionFromDatabase, getCurrentUserFromCache } from "./queries";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("auth.get-active-session");

// Output schema baseado no return original: user ? { user } : null
const GetActiveSessionOutputSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
    type: z.enum(["human", "agent"]),
    isActive: z.boolean(),
    deactivatedAt: z.date().nullable(),
    deactivatedBy: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
}).nullable();

export type GetActiveSessionOutput = z.infer<typeof GetActiveSessionOutputSchema>;

export default async function(): Promise<GetActiveSessionOutput> {
  logger.debug("Getting active session");

  // 1. Initialize session from database if not already loaded (side effect)
  await initializeSessionFromDatabase();
  
  // 2. Get current user from cache
  const user = getCurrentUserFromCache();
  
  if (!user) {
    return null;
  }
  
  return GetActiveSessionOutputSchema.parse({ user });
}

declare global {
  namespace WindowAPI {
    interface Auth {
      getActiveSession: () => Promise<GetActiveSessionOutput>
    }
  }
}