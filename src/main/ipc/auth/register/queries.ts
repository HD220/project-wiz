import { z } from "zod";
import bcrypt from "bcryptjs";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable } from "@/main/database/schemas/user.schema";
import { accountsTable } from "@/main/database/schemas/auth.schema";
import { userPreferencesTable } from "@/main/database/schemas/user-preferences.schema";
import { userSessionsTable } from "@/main/database/schemas/user-sessions.schema";
import { eq } from "drizzle-orm";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema baseado em RegisterUserInput
export const RegisterInputSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  avatar: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Output validation schema baseado em AuthResult
export const RegisterOutputSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
    type: z.enum(["human", "agent"]),
    isActive: z.boolean(),
    deactivatedAt: z.date().nullable(),
    deactivatedBy: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  sessionToken: z.string(),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type RegisterOutput = z.infer<typeof RegisterOutputSchema>;

export async function validateRegisterData(params: RegisterInput): Promise<RegisterInput> {
  return RegisterInputSchema.parse(params);
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const db = getDatabase();
  const [existingAccount] = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.username, username))
    .limit(1);
  
  return !!existingAccount;
}

export async function createUserAccount(params: RegisterInput): Promise<RegisterOutput> {
  const db = getDatabase();
  
  // 1. Create user
  const [user] = await db
    .insert(usersTable)
    .values({
      name: params.name,
      avatar: params.avatar,
      type: "human",
    })
    .returning();

  if (!user) {
    throw new Error("Failed to create user");
  }

  // 2. Create account with hashed password
  const passwordHash = await bcrypt.hash(params.password, 12);
  const [account] = await db
    .insert(accountsTable)
    .values({
      userId: user.id,
      username: params.username,
      passwordHash,
    })
    .returning();

  if (!account) {
    throw new Error("Failed to create account");
  }

  // 3. Create preferences
  await db.insert(userPreferencesTable).values({
    userId: user.id,
    theme: "system",
  });

  // 4. Create session token
  const sessionToken = crypto.randomUUID();
  const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(userSessionsTable).values({
    userId: user.id,
    token: sessionToken,
    expiresAt,
  });

  return RegisterOutputSchema.parse({ user, sessionToken });
}