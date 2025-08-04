import { z } from "zod";
import { updateTheme } from "./queries";
import {
  UpdateThemeInputSchema,
  UpdateThemeOutputSchema,
  type UpdateThemeInput,
  type UpdateThemeOutput
} from "@/shared/types/profile";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("profile.update-theme.controller");

export default async function(input: unknown): Promise<UpdateThemeOutput> {
  // Parse and validate input
  const validatedInput = UpdateThemeInputSchema.parse(input);
  
  logger.debug("Updating user theme", { theme: validatedInput.theme });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic using current user ID
  const result = await updateTheme(currentUser.id, validatedInput);
  
  // 3. Emit specific event for this operation
  eventBus.emit("profile:theme-updated", { userId: currentUser.id, theme: validatedInput.theme });
  
  logger.debug("User theme updated", { theme: result.theme });
  
  // Parse and return output
  return UpdateThemeOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Profile {
      updateTheme: (input: UpdateThemeInput) => Promise<UpdateThemeOutput>
    }
  }
}