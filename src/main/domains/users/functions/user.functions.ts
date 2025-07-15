import { eq } from "drizzle-orm";
import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { publishEvent } from "../../../infrastructure/events";
import { users, type UserSchema, type CreateUserSchema } from "../../../persistence/schemas";
import { UserIdentity, UserSettings } from "../value-objects";
import { User, UserPreferences } from "../entities";

const logger = getLogger("users.functions");

export async function createUser(userData: {
  name: string;
  email?: string;
  avatar?: string;
}): Promise<User> {
  logger.info("Creating new user", { name: userData.name });
  
  const database = getDatabase();
  
  const createUserData: CreateUserSchema = {
    name: userData.name,
    email: userData.email,
    avatar: userData.avatar,
  };

  const [insertedUser] = await database
    .insert(users)
    .values(createUserData)
    .returning();

  const userIdentity = new UserIdentity(insertedUser.id);
  const userSettings = new UserSettings(insertedUser.settings as any);
  const user = new User(userIdentity, userSettings);

  publishEvent({
    type: "user.created",
    data: {
      userId: insertedUser.id,
      name: insertedUser.name,
    },
  });

  return user;
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

  const userIdentity = new UserIdentity(userRecord.id);
  const userSettings = new UserSettings(userRecord.settings as any);
  
  return new User(userIdentity, userSettings);
}

export async function updateUserSettings(
  userId: string,
  settings: UserSettings
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
  }
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

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const user = await findUserById(userId);
  
  if (!user) {
    return null;
  }

  return new UserPreferences(user.getId(), user.getSettings());
}

export async function deleteUser(userId: string): Promise<void> {
  logger.info("Deleting user", { userId });
  
  const database = getDatabase();
  
  await database
    .delete(users)
    .where(eq(users.id, userId));

  publishEvent({
    type: "user.deleted",
    data: { userId },
  });
}