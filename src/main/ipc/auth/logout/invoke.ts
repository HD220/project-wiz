import { z } from "zod";
import { clearUserSessions } from "@/main/ipc/auth/queries";
import { eventBus } from "@/shared/services/events/event-bus";
import { sessionRegistry } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("auth.logout");

const LogoutInputSchema = z.void();
const LogoutOutputSchema = z.void();

const handler = createIPCHandler({
  inputSchema: LogoutInputSchema,
  outputSchema: LogoutOutputSchema,
  handler: async () => {
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
    
    return undefined;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Auth {
      logout: InferHandler<typeof handler>
    }
  }
}