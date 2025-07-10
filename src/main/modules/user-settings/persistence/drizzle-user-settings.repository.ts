import { eq, and } from "drizzle-orm";

import { db } from "@/main/persistence/db";
import { UserSetting } from "@/main/modules/user-settings/domain/user-setting.entity";
import { IUserSettingsRepository } from "@/main/modules/user-settings/domain/user-settings.repository";

import { userSettings } from "./schema";

export class DrizzleUserSettingsRepository implements IUserSettingsRepository {
  async save(setting: UserSetting): Promise<UserSetting> {
    try {
      await db
        .insert(userSettings)
        .values({
          id: setting.id,
          userId: setting.userId,
          key: setting.key,
          value: setting.value,
        })
        .onConflictDoUpdate({
          target: userSettings.id,
          set: { value: setting.value },
        });
      return setting;
    } catch (error: unknown) {
      console.error("Failed to save user setting:", error);
      throw new Error(
        `Failed to save user setting: ${(error as Error).message}`,
      );
    }
  }

  async findByUserIdAndKey(
    userId: string,
    key: string,
  ): Promise<UserSetting | undefined> {
    try {
      const result = await db
        .select()
        .from(userSettings)
        .where(and(eq(userSettings.userId, userId), eq(userSettings.key, key)))
        .limit(1);

      if (result.length === 0) {
        return undefined;
      }
      const settingData = result[0];
      return new UserSetting(settingData, settingData.id);
    } catch (error: unknown) {
      console.error(
        `Failed to find user setting by user ID ${userId} and key ${key}:`,
        error,
      );
      throw new Error(
        `Failed to find user setting by user ID and key: ${(error as Error).message}`,
      );
    }
  }

  async findByUserId(userId: string): Promise<UserSetting[]> {
    try {
      const results = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId));
      return results.map((data) => new UserSetting(data, data.id));
    } catch (error: unknown) {
      console.error(
        `Failed to find user settings by user ID ${userId}:`,
        error,
      );
      throw new Error(
        `Failed to find user settings by user ID: ${(error as Error).message}`,
      );
    }
  }
}
