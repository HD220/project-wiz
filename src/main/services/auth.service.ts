import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/connection';
import { users } from '../database/schema';
import { 
  LoginSchema, 
  RegisterSchema,
  type LoginInput,
  type RegisterInput
} from '../../shared/schemas/validation.schemas';
import { 
  ValidationError, 
  AuthenticationError,
  type User 
} from '../../shared/types/common';
import { generateUserId } from '../../shared/utils/id-generator';

const JWT_SECRET = process.env.JWT_SECRET || 'project-wiz-secret-key';

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  /**
   * Authenticate user with username/password
   */
  static async login(input: LoginInput): Promise<AuthResponse> {
    // Validate input
    const validated = LoginSchema.parse(input);
    const db = getDatabase();
    
    // Find user by username
    const user = await db.query.users.findFirst({
      where: eq(users.username, validated.username),
    });
    
    if (!user) {
      throw new AuthenticationError('Invalid username or password');
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid username or password');
    }
    
    // Update last login
    await db.update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    
    // Generate JWT token
    const token = this.generateToken(user.id);
    
    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user;
    
    return {
      user: {
        ...userWithoutPassword,
        preferences: user.preferences ? JSON.parse(user.preferences) : {},
      },
      token,
    };
  }
  
  /**
   * Register new user
   */
  static async register(input: RegisterInput): Promise<AuthResponse> {
    // Validate input
    const validated = RegisterSchema.parse(input);
    const db = getDatabase();
    
    // Check if username already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, validated.username),
    });
    
    if (existingUser) {
      throw new ValidationError('Username already exists');
    }
    
    // Check if email already exists (if provided)
    if (validated.email) {
      const existingEmail = await db.query.users.findFirst({
        where: eq(users.email, validated.email),
      });
      
      if (existingEmail) {
        throw new ValidationError('Email already exists');
      }
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 12);
    
    // Create user
    const userId = generateUserId();
    const now = new Date();
    
    const newUser = {
      id: userId,
      username: validated.username,
      email: validated.email,
      passwordHash,
      displayName: validated.displayName,
      preferences: JSON.stringify({
        theme: 'dark',
        notifications: true,
        language: 'en',
      }),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.insert(users).values(newUser);
    
    // Generate JWT token
    const token = this.generateToken(userId);
    
    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    
    return {
      user: {
        ...userWithoutPassword,
        preferences: JSON.parse(newUser.preferences),
      },
      token,
    };
  }
  
  /**
   * Validate JWT token and return user
   */
  static async validateToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const db = getDatabase();
      
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.userId),
      });
      
      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid token');
      }
      
      const { passwordHash, ...userWithoutPassword } = user;
      
      return {
        ...userWithoutPassword,
        preferences: user.preferences ? JSON.parse(user.preferences) : {},
      };
    } catch (error) {
      throw new AuthenticationError('Invalid token');
    }
  }
  
  /**
   * List all user accounts (for account switching)
   */
  static async listAccounts(): Promise<User[]> {
    const db = getDatabase();
    
    const allUsers = await db.query.users.findMany({
      where: eq(users.isActive, true),
      orderBy: [users.lastLoginAt, users.createdAt],
    });
    
    return allUsers.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        preferences: user.preferences ? JSON.parse(user.preferences) : {},
      };
    });
  }
  
  /**
   * Check if this is the first run (no users exist)
   */
  static async isFirstRun(): Promise<boolean> {
    const db = getDatabase();
    
    const userCount = await db.select({ count: users.id }).from(users);
    return userCount.length === 0;
  }
  
  /**
   * Create default account for first run
   */
  static async createDefaultAccount(): Promise<AuthResponse> {
    const isFirst = await this.isFirstRun();
    
    if (!isFirst) {
      throw new ValidationError('Default account can only be created on first run');
    }
    
    return this.register({
      username: 'admin',
      displayName: 'Administrator',
      password: 'admin123',
      email: 'admin@project-wiz.local',
    });
  }
  
  /**
   * Generate JWT token for user
   */
  private static generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
  
  /**
   * Extract user ID from JWT token
   */
  static extractUserIdFromToken(token: string): string | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded.userId;
    } catch {
      return null;
    }
  }
}