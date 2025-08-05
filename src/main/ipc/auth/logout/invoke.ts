import { z } from "zod";
import { clearUserSessions } from "@/main/ipc/auth/queries";
import { eventBus } from "@/shared/services/events/event-bus";
import { sessionRegistry } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("auth.logout");

// Output schema baseado no return original: { message: "Logged out successfully" }
const LogoutOutputSchema = z.object({
  message: z.string(),
});

export type LogoutOutput = z.infer<typeof LogoutOutputSchema>;

export default async function(): Promise<LogoutOutput> {
  logger.info("Logging out user");

  // 1. Clear user sessions in database
  await clearUserSessions();
  
  // 2. Clear session registry
  sessionRegistry.clearSession();
  
  // 3. Emit logout event  
  eventBus.emit("user:logged-out", {
    timestamp: new Date(),
  });
  
  logger.info("User logged out successfully");
  
  return LogoutOutputSchema.parse({ 
    message: "Logged out successfully" 
  });
}

declare global {
  namespace WindowAPI {
    interface Auth {
      logout: () => Promise<LogoutOutput>
    }
  }
}