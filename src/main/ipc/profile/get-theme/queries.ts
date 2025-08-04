import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import {
  userPreferencesTable,
  type Theme,
} from "@/main/database/schemas/user-preferences.schema";
import type { GetThemeInput, GetThemeOutput } from "@/shared/types/profile";

const { getDatabase } = createDatabaseConnection(true);

export async function getTheme(userId: string): Promise<GetThemeOutput> {
  const db = getDatabase();

  const [preferences] = await db
    .select({ theme: userPreferencesTable.theme })
    .from(userPreferencesTable)
    .where(eq(userPreferencesTable.userId, userId))
    .limit(1);

  const theme = preferences?.theme ?? "system";

  return { theme };
}