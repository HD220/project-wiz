import { 
  updateTheme,
  type UpdateThemeInput,
  type UpdateThemeOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/main/core/event-bus";

const logger = getLogger("profile.update-theme.controller");

export default async function(input: UpdateThemeInput): Promise<UpdateThemeOutput> {
  logger.debug("Updating user theme", { theme: input.theme });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic using current user ID
  const result = await updateTheme(currentUser.id, input);
  
  // 3. Emit specific event for this operation
  eventBus.emit("profile:theme-updated", { userId: currentUser.id, theme: input.theme });
  
  logger.debug("User theme updated", { theme: result.theme });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Profile {
      updateTheme: (input: UpdateThemeInput) => Promise<UpdateThemeOutput>
    }
  }
}