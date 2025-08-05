import { z } from "zod";
import { updateUserPreferences } from "@/main/ipc/profile/queries";
import {
  UpdateThemeInputSchema,
  UpdateThemeOutputSchema,
  type UpdateThemeInput,
  type UpdateThemeOutput 
} from "@/shared/types/profile";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("profile.update.controller");

export default async function(input: UpdateThemeInput): Promise<UpdateThemeOutput> {
  logger.debug("Updating user profile preferences", { input });

  // 1. Parse and validate input
  const parsedInput = UpdateThemeInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Update user preferences with ownership validation
  const result = await updateUserPreferences({
    ownerId: currentUser.id,
    theme: parsedInput.theme,
  });

  if (!result) {
    throw new Error("Failed to update user preferences");
  }
  
  logger.debug("User profile preferences updated", { theme: result.theme });
  
  // 4. Parse and return output
  return UpdateThemeOutputSchema.parse({ theme: result.theme });
}

declare global {
  namespace WindowAPI {
    interface Profile {
      update: (input: UpdateThemeInput) => Promise<UpdateThemeOutput>
    }
  }
}