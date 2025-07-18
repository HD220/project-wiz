import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { users } from '../../database/schema/users.schema';
import { generateId } from '../../utils/id-generator';

const JWT_SECRET = process.env.JWT_SECRET || 'project-wiz-dev-secret';
const SALT_ROUNDS = 12;

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email?: string;
  password: string;
  displayName: string;
}

export interface AuthResult {
  user: {
    id: string;
    username: string;
    displayName: string;
    email?: string;
    avatarUrl?: string;
    bio?: string;
  };
  token: string;
}

export class AuthService {
  static async login(input: LoginInput): Promise<AuthResult> {
    const db = getDatabase();
    
    // Find user by username
    const user = await db.query.users.findFirst({
      where: eq(users.username, input.username),
    });
    
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    if (!user.isActive) {
      throw new Error('Account is disabled');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }
    
    // Update last login
    await db.update(users)
      .set({ 
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
      token,
    };
  }
  
  static async register(input: RegisterInput): Promise<AuthResult> {
    const db = getDatabase();
    
    // Check if username already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, input.username),
    });
    
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // Check if email already exists (if provided)
    if (input.email) {
      const existingEmail = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
      
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    
    // Create user
    const userId = generateId();
    const now = new Date();
    
    await db.insert(users).values({
      id: userId,
      username: input.username,
      email: input.email,
      passwordHash,
      displayName: input.displayName,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    
    // Get created user
    const newUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (!newUser) {
      throw new Error('Failed to create user');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        bio: newUser.bio,
      },
      token,
    };
  }
  
  static async validateToken(token: string): Promise<{ userId: string; username: string }> {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      return {
        userId: payload.userId,
        username: payload.username,
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  
  static async getCurrentUser(userId: string) {
    const db = getDatabase();
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.isActive) {
      throw new Error('Account is disabled');
    }
    
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      preferences: user.preferences ? JSON.parse(user.preferences) : {},
    };
  }
  
  static async logout(userId: string): Promise<void> {
    // For now, just a simple implementation
    // In the future, we could maintain a token blacklist
    return;
  }
  
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const db = getDatabase();
    
    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update password
    await db.update(users)
      .set({ 
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }
}