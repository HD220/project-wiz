import { z } from "zod";
import { getUserTheme } from "@/main/ipc/profile/queries";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("profile.get-theme.invoke");

// Input schema - void (sem parâmetros)
const GetThemeInputSchema = z.void();

// Output schema - theme type
const GetThemeOutputSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

type GetThemeInput = z.infer<typeof GetThemeInputSchema>;
type GetThemeOutput = z.infer<typeof GetThemeOutputSchema>;

export default async function(input: GetThemeInput): Promise<GetThemeOutput> {
  logger.debug("Getting user theme");

  // 1. Validate input
  GetThemeInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Get user theme with ownership validation
  const result = await getUserTheme(currentUser.id);
  
  logger.debug("User theme retrieved", { theme: result.theme });
  
  // 4. Emit event
  eventBus.emit("profile:theme-retrieved", { userId: currentUser.id, theme: result.theme });
  
  // 5. Return result
  return result;
}

declare global {
  namespace WindowAPI {
    interface Profile {
      getTheme: () => Promise<GetThemeOutput>
    }
  }
}