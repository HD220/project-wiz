import { eq } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import {
  usersTable,
  type Theme,
} from "@/main/user/authentication/users.schema";

export class ProfileService {
  /**
   * Get user's current theme preference
   */
  static async getTheme(userId: string): Promise<Theme> {
    const db = getDatabase();

    const [user] = await db
      .select({ theme: usersTable.theme })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    return user.theme;
  }

  /**
   * Update user's theme preference
   */
  static async updateTheme(userId: string, theme: Theme): Promise<Theme> {
    const db = getDatabase();

    // Verify user exists
    const [existingUser] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Update theme
    await db
      .update(usersTable)
      .set({
        theme,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));

    return theme;
  }
}
