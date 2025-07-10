import { eq, and } from "drizzle-orm";
import { ApplicationError } from "@/main/errors/application.error";

import { UserSetting } from "@/main/modules/user-settings/domain/user-setting.entity";
import type { IUserSettingsRepository } from "@/main/modules/user-settings/domain/user-settings.repository";
import { userSettings } from "@/main/persistence/schema";
import { BaseRepository } from "@/main/persistence/base.repository";
import type { NodeSQLiteDatabase } from 'drizzle-orm/node-sqlite';
import type { InferSelectModel } from 'drizzle-orm/sqlite-core';

export class DrizzleUserSettingsRepository extends BaseRepository<UserSetting, typeof userSettings> implements IUserSettingsRepository {
  constructor(db: NodeSQLiteDatabase<any>) {
    super(db, userSettings);
  }

  protected mapToDomainEntity(row: InferSelectModel<typeof userSettings>): UserSetting {
    return UserSetting.fromPersistence(row);
  }

  async findByUserIdAndKey(
    userId: string,
    key: string,
  ): Promise<UserSetting | undefined> {
    try {
      const [result] = await this.db
        .select()
        .from(userSettings)
        .where(and(eq(userSettings.userId, userId), eq(userSettings.key, key)))
        .limit(1);

      return result ? this.mapToDomainEntity(result) : undefined;
    } catch (error: unknown) {
      console.error(
        `Failed to find user setting by user ID ${userId} and key ${key}:`,
        error,
      );
      throw new ApplicationError(
        `Failed to find user setting by user ID and key: ${(error as Error).message}`,
      );
    }
  }

  async findByUserId(userId: string): Promise<UserSetting[]> {
    try {
      const results = await this.db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId));
      return results.map((data) => this.mapToDomainEntity(data));
    } catch (error: unknown) {
      console.error(
        `Failed to find user settings by user ID ${userId}:`,
        error,
      );
      throw new ApplicationError(
        `Failed to find user settings by user ID: ${(error as Error).message}`,
      );
    }
  }
}
