import { eq } from "drizzle-orm";

import {
  userPreferencesTable,
  type Theme,
  type SelectUserPreferences,
  type InsertUserPreferences,
  type UpdateUserPreferences,
} from "@/main/schemas/user-preferences.schema";

import { createDatabaseConnection } from "@/shared/config/database";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Get user theme preference with ownership validation
 */
export async function getUserTheme(ownerId: string): Promise<{ theme: Theme }> {
  const db = getDatabase();

  const [preferences] = await db
    .select({ theme: userPreferencesTable.theme })
    .from(userPreferencesTable)
    .where(eq(userPreferencesTable.userId, ownerId))
    .limit(1);

  const theme = preferences?.theme ?? "system";

  return { theme };
}

/**
 * Find user preferences by owner ID
 */
export async function findUserPreferences(
  ownerId: string,
): Promise<SelectUserPreferences | null> {
  const db = getDatabase();

  const [preferences] = await db
    .select()
    .from(userPreferencesTable)
    .where(eq(userPreferencesTable.userId, ownerId))
    .limit(1);

  return preferences || null;
}

/**
 * Create user preferences
 */
export async function createUserPreferences(
  data: InsertUserPreferences,
): Promise<SelectUserPreferences> {
  const db = getDatabase();

  const [preferences] = await db
    .insert(userPreferencesTable)
    .values(data)
    .returning();

  if (!preferences) {
    throw new Error("Failed to create user preferences");
  }

  return preferences;
}

/**
 * Update user preferences with ownership validation
 */
export async function updateUserPreferences(
  data: UpdateUserPreferences & { userId: string },
): Promise<SelectUserPreferences | null> {
  const db = getDatabase();

  const { userId, ...updates } = data;

  const [preferences] = await db
    .update(userPreferencesTable)
    .set(updates)
    .where(eq(userPreferencesTable.userId, userId))
    .returning();

  return preferences || null;
}
