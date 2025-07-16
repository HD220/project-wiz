import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { users } from "../../../persistence/schemas";
import {
  UpdateUserProfileData,
  UpdateUserProfileSchema,
  UpdateUserSettingsData,
  UpdateUserSettingsSchema,
} from "./user-schemas";

export async function updateUserProfile(
  id: string,
  data: UpdateUserProfileData,
): Promise<void> {
  const validated = UpdateUserProfileSchema.parse(data);
  const db = getDatabase();

  await db
    .update(users)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));
}

export async function updateUserSettings(
  id: string,
  settings: UpdateUserSettingsData,
): Promise<void> {
  const validated = UpdateUserSettingsSchema.parse(settings);
  const db = getDatabase();

  await db
    .update(users)
    .set({
      settings: validated,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));
}
