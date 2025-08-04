import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import {
  userPreferencesTable,
  type Theme,
} from "@/main/database/schemas/user-preferences.schema";
import type { UpdateThemeInput, UpdateThemeOutput } from "@/shared/types/profile";

const { getDatabase } = createDatabaseConnection(true);

export async function updateTheme(userId: string, input: UpdateThemeInput): Promise<UpdateThemeOutput> {
  const db = getDatabase();

  await db
    .update(userPreferencesTable)
    .set({ 
      theme: input.theme, 
      updatedAt: new Date() 
    })
    .where(eq(userPreferencesTable.userId, userId));

  return { theme: input.theme };
}