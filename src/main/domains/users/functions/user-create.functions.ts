import { getDatabase } from "../../../infrastructure/database";
import { users } from "../../../persistence/schemas";
import { User } from "../entities/user.entity";
import { UserIdentity } from "../value-objects/user-identity.vo";
import { UserSettings } from "../value-objects/user-settings.vo";
import { CreateUserData, CreateUserSchema } from "./user-schemas";

export async function createUser(data: CreateUserData): Promise<User> {
  const validated = CreateUserSchema.parse(data);
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

  const identity = UserIdentity.create(validated.id);
  const settings = new UserSettings(validated.settings);
  return new User(identity, settings);
}
