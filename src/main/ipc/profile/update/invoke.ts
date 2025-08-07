import { z } from "zod";

import { updateUserPreferences } from "@/main/ipc/profile/queries";
import { requireAuth } from "@/main/services/session-registry";

import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("profile.update.invoke");

const UpdateThemeInputSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

const UpdateThemeOutputSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

const handler = createIPCHandler({
  inputSchema: UpdateThemeInputSchema,
  outputSchema: UpdateThemeOutputSchema,
  handler: async (input) => {
    logger.debug("Updating user profile preferences", { theme: input.theme });

    const currentUser = requireAuth();

    // Update user preferences with ownership validation
    const result = await updateUserPreferences({
      id: currentUser.id, // Use user id as preference id
      userId: currentUser.id,
      theme: input.theme,
    });

    if (!result) {
      throw new Error("Failed to update user preferences");
    }

    logger.debug("User profile preferences updated", { theme: result.theme });

    // Emit event
    eventBus.emit("profile:theme-updated", {
      userId: currentUser.id,
      theme: result.theme,
    });

    return { theme: result.theme };
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Profile {
      update: InferHandler<typeof handler>;
    }
  }
}
