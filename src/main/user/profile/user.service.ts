import { eq } from 'drizzle-orm';
import { getDatabase } from '../../database';
import { users } from '../../database/schema';
import { getLogger } from '../../utils/logger';
import { publishEvent } from '../../utils/events';
import { 
  UpdateUserSchema, 
  type UpdateUserInput, 
  type User 
} from '../../../shared/types/auth.types';

const logger = getLogger('user');

/**
 * Update user profile
 */
export async function updateProfile(userId: string, input: UpdateUserInput): Promise<User> {
  // 1. Validate input
  const validated = UpdateUserSchema.parse(input);
  
  const db = getDatabase();
  
  // 2. Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  
  if (!existingUser) {
    throw new Error(`User ${userId} not found`);
  }
  
  // 3. Check username uniqueness if changed
  if (validated.username && validated.username !== existingUser.username) {
    const usernameExists = await db.query.users.findFirst({
      where: eq(users.username, validated.username),
    });
    
    if (usernameExists) {
      throw new Error('Username already exists');
    }
  }
  
  // 4. Check email uniqueness if changed
  if (validated.email && validated.email !== existingUser.email) {
    const emailExists = await db.query.users.findFirst({
      where: eq(users.email, validated.email),
    });
    
    if (emailExists) {
      throw new Error('Email already exists');
    }
  }
  
  // 5. Update user
  const updateData = {
    ...validated,
    updatedAt: new Date(),
  };
  
  await db.update(users)
    .set(updateData)
    .where(eq(users.id, userId));
  
  // 6. Fetch updated user
  const updatedUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  
  if (!updatedUser) {
    throw new Error('Failed to fetch updated user');
  }
  
  // 7. Publish event
  publishEvent('user.updated', { userId });
  
  logger.info({ userId }, 'User profile updated');
  
  // 8. Return user without sensitive data
  const { passwordHash, ...userResponse } = updatedUser;
  return {
    ...userResponse,
    preferences: updatedUser.preferences ? JSON.parse(updatedUser.preferences) : {},
    email: updatedUser.email || undefined
  };
}

/**
 * Update user preferences
 */
export async function updatePreferences(
  userId: string, 
  preferences: Record<string, any>
): Promise<void> {
  const db = getDatabase();
  
  await db.update(users)
    .set({
      preferences: JSON.stringify(preferences),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  
  publishEvent('user.preferences.updated', { userId, preferences });
  
  logger.info({ userId }, 'User preferences updated');
}

/**
 * Find user by ID
 */
export async function findById(userId: string): Promise<User | null> {
  const db = getDatabase();
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  
  if (!user) {
    return null;
  }
  
  // Return user without sensitive data
  const { passwordHash, ...userResponse } = user;
  return {
    ...userResponse,
    preferences: user.preferences ? JSON.parse(user.preferences) : {},
    email: user.email || undefined
  };
}

/**
 * Deactivate user account
 */
export async function deactivateAccount(userId: string): Promise<void> {
  const db = getDatabase();
  
  await db.update(users)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  
  publishEvent('user.deactivated', { userId });
  
  logger.info({ userId }, 'User account deactivated');
}