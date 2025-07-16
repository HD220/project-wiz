import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { users } from "../../../persistence/schemas";
import { UserPreferences } from "../entities/user-preferences.entity";
import { User } from "../entities/user.entity";
import { UserIdentity } from "../value-objects/user-identity.vo";
import { UserSettings } from "../value-objects/user-settings.vo";
import { UpdateUserSettingsData } from "./user-schemas";

export async function findUserById(id: string): Promise<User | null> {
  const db = getDatabase();
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

  if (!user) return null;

  const identity = UserIdentity.create(user.id);
  const settings = new UserSettings(user.settings as UpdateUserSettingsData);
  return new User(identity, settings);
}

export async function getUserPreferences(
  userId: string,
): Promise<UserPreferences | null> {
  const user = await findUserById(userId);
  if (!user) return null;

  const identity = UserIdentity.create(userId);
  const settings = user.getSettings();
  return new UserPreferences(identity, settings);
}
