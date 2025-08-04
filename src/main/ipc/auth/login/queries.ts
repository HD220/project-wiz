import { z } from "zod";
import bcrypt from "bcryptjs";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable } from "@/main/database/schemas/user.schema";
import { accountsTable } from "@/main/database/schemas/auth.schema";
import { userSessionsTable } from "@/main/database/schemas/user-sessions.schema";
import { eq, and, gt, desc } from "drizzle-orm";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema baseado em LoginCredentials
export const LoginInputSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Output validation schema baseado em AuthResult
export const LoginOutputSchema = z.object({
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

export type LoginInput = z.infer<typeof LoginInputSchema>;
export type LoginOutput = z.infer<typeof LoginOutputSchema>;

export async function validateLoginData(params: LoginInput): Promise<LoginInput> {
  return LoginInputSchema.parse(params);
}

export async function authenticateUser(params: LoginInput): Promise<LoginOutput> {
  const db = getDatabase();
  
  // Find user by username - join with accounts and users tables
  const [result] = await db
    .select({
      user: usersTable,
      account: accountsTable,
    })
    .from(accountsTable)
    .innerJoin(usersTable, eq(accountsTable.userId, usersTable.id))
    .where(
      and(
        eq(accountsTable.username, params.username),
        eq(usersTable.type, "human"), // Only humans can login
        eq(usersTable.isActive, true)
      )
    )
    .limit(1);

  if (!result) {
    throw new Error("Invalid username or password");
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(params.password, result.account.passwordHash);
  if (!isValidPassword) {
    throw new Error("Invalid username or password");
  }

  // Create new session token
  const sessionToken = crypto.randomUUID();
  const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(userSessionsTable).values({
    userId: result.user.id,
    token: sessionToken,
    expiresAt,
  });

  return LoginOutputSchema.parse({ 
    user: result.user, 
    sessionToken 
  });
}