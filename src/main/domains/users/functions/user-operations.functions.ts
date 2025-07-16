import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { publishEvent } from "../../../infrastructure/events";
import { getLogger } from "../../../infrastructure/logger";
import { users } from "../../../persistence/schemas";
import { UserPreferences } from "../entities";
import { UserSettings } from "../value-objects";
import { findUserById } from "./user-crud.functions";

const logger = getLogger("users.operations");

export async function updateUserSettings(
  userId: string,
  settings: UserSettings,
): Promise<void> {
  logger.info("Updating user settings", { userId });

  const database = getDatabase();
  await database
    .update(users)
    .set({
      settings: settings.getValue(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  publishEvent({
    type: "user.settings.updated",
    data: {
      userId,
      settings: settings.getValue(),
    },
  });
}

export async function updateUserProfile(
  userId: string,
  profile: {
    name?: string;
    email?: string;
    avatar?: string;
  },
): Promise<void> {
  logger.info("Updating user profile", { userId });

  const database = getDatabase();
  await database
    .update(users)
    .set({
      ...profile,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  publishEvent({
    type: "user.profile.updated",
    data: {
      userId,
      profile,
    },
  });
}

export async function getUserPreferences(
  userId: string,
): Promise<UserPreferences | null> {
  const user = await findUserById(userId);
  if (!user) {
    return null;
  }

  return new UserPreferences(user.getId(), user.getSettings());
}