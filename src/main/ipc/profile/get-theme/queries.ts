import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import {
  userPreferencesTable,
  type Theme,
} from "@/main/database/schemas/user-preferences.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema (sem parâmetros - usa sessão atual)
export const GetThemeInputSchema = z.void();

// Output validation schema
export const GetThemeOutputSchema = z.object({
  theme: z.enum(["light", "dark", "system"])
});

export type GetThemeInput = z.infer<typeof GetThemeInputSchema>;
export type GetThemeOutput = z.infer<typeof GetThemeOutputSchema>;

export async function getTheme(userId: string): Promise<GetThemeOutput> {
  const db = getDatabase();

  const [preferences] = await db
    .select({ theme: userPreferencesTable.theme })
    .from(userPreferencesTable)
    .where(eq(userPreferencesTable.userId, userId))
    .limit(1);

  const theme = preferences?.theme ?? "system";

  return GetThemeOutputSchema.parse({ theme });
}