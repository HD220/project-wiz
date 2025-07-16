import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { publishEvent } from "../../../infrastructure/events";
import { getLogger } from "../../../infrastructure/logger";
import { users } from "../../../persistence/schemas";
import { User, UserPreferences } from "../entities";
import { UserIdentity, UserSettings } from "../value-objects";

const logger = getLogger("users.functions");

export async function createUser(userData: {
  name: string;
  email?: string;
  avatar?: string;
}): Promise<User> {
  logger.info("Creating new user", { name: userData.name });

  const createUserData = {
    name: userData.name,
    email: userData.email,
    avatar: userData.avatar,
  };

  const database = getDatabase();
  const [insertedUser] = await database
    .insert(users)
    .values(createUserData)
    .returning();

  const user = buildUserFromData(insertedUser);

  publishEvent({
    type: "user.created",
    data: {
      userId: insertedUser.id,
      name: insertedUser.name,
    },
  });

  return user;
}

function buildUserFromData(userData: any): User {
  const userIdentity = new UserIdentity(userData.id);
  const userSettings = new UserSettings(
    userData.settings as Record<string, unknown>,
  );
  return new User(userIdentity, userSettings);
}

export async function findUserById(userId: string): Promise<User | null> {
  const database = getDatabase();
  const [userRecord] = await database
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRecord) {
    return null;
  }

  return buildUserFromData(userRecord);
}

export async function deleteUser(userId: string): Promise<void> {
  logger.info("Deleting user", { userId });

  const database = getDatabase();
  await database.delete(users).where(eq(users.id, userId));

  publishEvent({
    type: "user.deleted",
    data: { userId },
  });
}