import { 
  getTheme,
  type GetThemeInput,
  type GetThemeOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("profile.get-theme.controller");

export default async function(input: GetThemeInput): Promise<GetThemeOutput> {
  logger.debug("Getting user theme");

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic using current user ID
  const result = await getTheme(currentUser.id);
  
  logger.debug("User theme retrieved", { theme: result.theme });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Profile {
      getTheme: (input: GetThemeInput) => Promise<GetThemeOutput>
    }
  }
}