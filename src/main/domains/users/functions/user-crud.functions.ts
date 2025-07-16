import { getDatabase } from "../../../infrastructure/database";
import { usersTable } from "../../../persistence/schemas";
import { eq } from "drizzle-orm";
import { User } from "../entities/user.entity";
import { UserPreferences } from "../entities/user-preferences.entity";
import { UserIdentity } from "../value-objects/user-identity.vo";
import { UserSettings } from "../value-objects/user-settings.vo";
import { z } from "zod";

const CreateUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
  settings: z.object({
    theme: z.enum(["light", "dark"]),
    language: z.string(),
    notifications: z.object({
      enabled: z.boolean(),
      email: z.boolean(),
      desktop: z.boolean(),
    }),
  }),
});

const UpdateUserProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
});

const UpdateUserSettingsSchema = z.object({
  theme: z.enum(["light", "dark"]),
  language: z.string(),
  notifications: z.object({
    enabled: z.boolean(),
    email: z.boolean(),
    desktop: z.boolean(),
  }),
});

type CreateUserData = z.infer<typeof CreateUserSchema>;
type UpdateUserProfileData = z.infer<typeof UpdateUserProfileSchema>;
type UpdateUserSettingsData = z.infer<typeof UpdateUserSettingsSchema>;

export async function createUser(data: CreateUserData): Promise<User> {
  const validated = CreateUserSchema.parse(data);
  const db = getDatabase();

  await db.insert(usersTable).values({
    id: validated.id,
    name: validated.name,
    email: validated.email || null,
    avatar: validated.avatar || null,
    settings: validated.settings,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const identity = UserIdentity.create(validated.id);
  const settings = UserSettings.create(validated.settings);
  return User.create(identity, settings);
}

export async function findUserById(id: string): Promise<User | null> {
  const db = getDatabase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  if (!user) return null;

  const identity = UserIdentity.create(user.id);
  const settings = UserSettings.create(user.settings as UpdateUserSettingsData);
  return User.create(identity, settings);
}

export async function updateUserProfile(
  id: string,
  data: UpdateUserProfileData,
): Promise<void> {
  const validated = UpdateUserProfileSchema.parse(data);
  const db = getDatabase();

  await db
    .update(usersTable)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, id));
}

export async function updateUserSettings(
  id: string,
  settings: UpdateUserSettingsData,
): Promise<void> {
  const validated = UpdateUserSettingsSchema.parse(settings);
  const db = getDatabase();

  await db
    .update(usersTable)
    .set({
      settings: validated,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, id));
}

export async function getUserPreferences(
  userId: string,
): Promise<UserPreferences | null> {
  const user = await findUserById(userId);
  if (!user) return null;

  const identity = UserIdentity.create(userId);
  const settings = user.getSettings();
  return UserPreferences.create(identity, settings);
}

export async function deleteUser(id: string): Promise<void> {
  const db = getDatabase();
  await db.delete(usersTable).where(eq(usersTable.id, id));
}
