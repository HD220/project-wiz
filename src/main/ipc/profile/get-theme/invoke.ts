import { z } from "zod";
import { getTheme } from "./queries";
import {
  GetThemeInputSchema,
  GetThemeOutputSchema,
  type GetThemeInput,
  type GetThemeOutput 
} from "@/shared/types/profile";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("profile.get-theme.controller");

export default async function(input: GetThemeInput): Promise<GetThemeOutput> {
  logger.debug("Getting user theme");

  // 1. Parse and validate input (void input)
  const parsedInput = GetThemeInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute core business logic using current user ID
  const result = await getTheme(currentUser.id);
  
  logger.debug("User theme retrieved", { theme: result.theme });
  
  // 4. Parse and return output
  return GetThemeOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Profile {
      getTheme: (input: GetThemeInput) => Promise<GetThemeOutput>
    }
  }
}