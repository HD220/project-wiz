import { z } from "zod";
import { updateUserPreferences } from "@/main/ipc/profile/queries";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("profile.update.invoke");

// Input schema - apenas theme
const UpdateThemeInputSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

// Output schema - theme atualizado
const UpdateThemeOutputSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

type UpdateThemeInput = z.infer<typeof UpdateThemeInputSchema>;
type UpdateThemeOutput = z.infer<typeof UpdateThemeOutputSchema>;

export default async function(input: UpdateThemeInput): Promise<UpdateThemeOutput> {
  logger.debug("Updating user profile preferences", { theme: input.theme });

  // 1. Validate input
  const validatedInput = UpdateThemeInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Update user preferences with ownership validation
  const result = await updateUserPreferences({
    userId: currentUser.id,
    theme: validatedInput.theme,
  });

  if (!result) {
    throw new Error("Failed to update user preferences");
  }
  
  logger.debug("User profile preferences updated", { theme: result.theme });
  
  // 4. Emit event
  eventBus.emit("profile:theme-updated", { userId: currentUser.id, theme: result.theme });
  
  // 5. Return result
  return { theme: result.theme };
}

declare global {
  namespace WindowAPI {
    interface Profile {
      update: (input: UpdateThemeInput) => Promise<UpdateThemeOutput>
    }
  }
}