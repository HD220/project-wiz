import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { users } from "../../../persistence/schemas";
import { User } from "../entities/user.entity";
import { UserPreferences } from "../entities/user-preferences.entity";
import { UserIdentity } from "../value-objects/user-identity.vo";
import { UserSettings } from "../value-objects/user-settings.vo";
import {
  CreateUserData,
  CreateUserSchema,
  UpdateUserData,
  UpdateUserSchema,
  UpdateUserSettingsData,
} from "./user-schemas";

const logger = getLogger("users.crud");

// Create Operations
export async function createUser(data: CreateUserData): Promise<User> {
  const validated = CreateUserSchema.parse(data);

  const existingUser = await findUserById(validated.id);
  if (existingUser) {
    throw new Error(`User with id '${validated.id}' already exists`);
  }

  const db = getDatabase();
  await db.insert(users).values({
    id: validated.id,
    name: validated.name,
    email: validated.email || null,
    avatar: validated.avatar || null,
    settings: validated.settings,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  logger.info("User created", {
    userId: validated.id,
    name: validated.name,
  });

  const identity = UserIdentity.create(validated.id);
  const settings = new UserSettings(validated.settings);
  return new User(identity, settings);
}

// Read Operations
export async function findUserById(id: string): Promise<User | null> {
  const db = getDatabase();
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

  if (!user) return null;

  const identity = UserIdentity.create(user.id);
  const settings = new UserSettings(user.settings as UpdateUserSettingsData);
  return new User(identity, settings);
}

export async function findAllUsers(): Promise<User[]> {
  const db = getDatabase();
  const allUsers = await db.select().from(users);

  return allUsers.map((user) => {
    const identity = UserIdentity.create(user.id);
    const settings = new UserSettings(user.settings as UpdateUserSettingsData);
    return new User(identity, settings);
  });
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

// Update Operations
export async function updateUser(
  id: string,
  data: UpdateUserData,
): Promise<User> {
  const validated = UpdateUserSchema.parse(data);

  const existingUser = await findUserById(id);
  if (!existingUser) {
    throw new Error(`User with id '${id}' not found`);
  }

  const db = getDatabase();
  await db
    .update(users)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));

  logger.info("User updated", {
    userId: id,
    updatedFields: Object.keys(validated),
  });

  return findUserById(id) as Promise<User>;
}

export async function updateUserSettings(
  userId: string,
  settingsData: UpdateUserSettingsData,
): Promise<User> {
  const existingUser = await findUserById(userId);
  if (!existingUser) {
    throw new Error(`User with id '${userId}' not found`);
  }

  const currentSettings = existingUser.getSettings();
  const newSettings = new UserSettings({
    ...currentSettings,
    ...settingsData,
  });

  const db = getDatabase();
  await db
    .update(users)
    .set({
      settings: newSettings,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  logger.info("User settings updated", {
    userId,
    settingsUpdated: Object.keys(settingsData),
  });

  return findUserById(userId) as Promise<User>;
}

// Delete Operations
export async function deleteUser(id: string): Promise<void> {
  const existingUser = await findUserById(id);
  if (!existingUser) {
    throw new Error(`User with id '${id}' not found`);
  }

  const db = getDatabase();
  await db.delete(users).where(eq(users.id, id));

  logger.info("User deleted", {
    userId: id,
  });
}
