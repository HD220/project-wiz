import { z } from "zod";
import { getUserTheme } from "@/main/ipc/profile/queries";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("profile.get-theme.invoke");

const GetThemeInputSchema = z.void();

const GetThemeOutputSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

const handler = createIPCHandler({
  inputSchema: GetThemeInputSchema,
  outputSchema: GetThemeOutputSchema,
  handler: async () => {
    logger.debug("Getting user theme");

    const currentUser = requireAuth();
    
    // Get user theme with ownership validation
    const result = await getUserTheme(currentUser.id);
    
    logger.debug("User theme retrieved", { theme: result.theme });
    
    // Emit event
    eventBus.emit("profile:theme-retrieved", { userId: currentUser.id, theme: result.theme });
    
    return result;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Profile {
      getTheme: InferHandler<typeof handler>
    }
  }
}