import { eq } from "drizzle-orm";
import { getDatabase } from "../../database/connection";
import { users } from "../authentication/users.schema";
import { z } from "zod";

// Simple validation schemas
const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  preferences: z.record(z.any()).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<any | null> {
  const db = getDatabase();

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return null;

  // Remove sensitive data
  const { passwordHash, ...userProfile } = user;

  return {
    ...userProfile,
    preferences: user.preferences ? JSON.parse(user.preferences) : {},
  };
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<any> {
  // 1. Validate input
  const validated = UpdateProfileSchema.parse(input);

  // 2. Update user
  const db = getDatabase();
  const updateData = {
    ...validated,
    preferences: validated.preferences
      ? JSON.stringify(validated.preferences)
      : undefined,
    updatedAt: new Date(),
  };

  await db.update(users).set(updateData).where(eq(users.id, userId));

  // 3. Return updated profile
  return await getUserProfile(userId);
}

/**
 * Update user avatar
 */
export async function updateUserAvatar(
  userId: string,
  avatarUrl: string,
): Promise<any> {
  const db = getDatabase();

  await db
    .update(users)
    .set({
      avatarUrl,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return await getUserProfile(userId);
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Record<string, any>,
): Promise<any> {
  const db = getDatabase();

  await db
    .update(users)
    .set({
      preferences: JSON.stringify(preferences),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return await getUserProfile(userId);
}

/**
 * Get user activity stats
 */
export async function getUserActivityStats(userId: string): Promise<any> {
  const db = getDatabase();

  // Get basic user info
  const user = await getUserProfile(userId);
  if (!user) return null;

  // TODO: Implement stats queries when other modules are connected
  // For now, return basic stats
  return {
    userId,
    totalProjects: 0,
    totalMessages: 0,
    totalAgents: 0,
    joinedAt: user.createdAt,
    lastActive: user.lastLoginAt,
  };
}
