import { eq } from "drizzle-orm";

import { createDatabaseConnection } from "@/shared/database/config";

const { getDatabase } = createDatabaseConnection(true);
import {
  userPreferencesTable,
  type Theme,
} from "@/main/features/user/profile.model";

export class ProfileService {
  /**
   * Get user's current theme preference
   */
  static async getTheme(userId: string): Promise<Theme> {
    const db = getDatabase();

    const [preferences] = await db
      .select({ theme: userPreferencesTable.theme })
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.userId, userId))
      .limit(1);

    return preferences?.theme || "system";
  }

  /**
   * Update user's theme preference
   */
  static async updateTheme(userId: string, theme: Theme): Promise<void> {
    const db = getDatabase();

    await db
      .update(userPreferencesTable)
      .set({ theme, updatedAt: new Date() })
      .where(eq(userPreferencesTable.userId, userId));
  }
}
