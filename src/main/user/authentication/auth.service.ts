import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { getDatabase } from "../../database/connection";
import { users } from "./users.schema";
import {
  LoginSchema,
  RegisterSchema,
  type LoginInput,
  type RegisterInput,
} from "../../../shared/schemas/validation.schemas";
import {
  ValidationError,
  AuthenticationError,
  type User,
} from "../../../shared/types/common";
import { generateUserId } from "../../../shared/utils/id-generator";

const JWT_SECRET = process.env["JWT_SECRET"] || "project-wiz-secret-key";

export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Authenticate user with username/password
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  // 1. Validate input
  const validated = LoginSchema.parse(input);

  // 2. Find user by username
  const db = getDatabase();
  const user = await db.query.users.findFirst({
    where: eq(users.username, validated.username),
  });

  if (!user) {
    throw new AuthenticationError("Invalid username or password");
  }

  // 3. Check if user is active
  if (!user.isActive) {
    throw new AuthenticationError("Account is deactivated");
  }

  // 4. Verify password
  const isPasswordValid = await bcrypt.compare(
    validated.password,
    user.passwordHash,
  );
  if (!isPasswordValid) {
    throw new AuthenticationError("Invalid username or password");
  }

  // 5. Update last login
  await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  // 6. Generate JWT token
  const token = generateToken(user.id);

  // 7. Remove sensitive data
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
export async function register(input: RegisterInput): Promise<AuthResponse> {
  // 1. Validate input
  const validated = RegisterSchema.parse(input);

  // 2. Check if username already exists
  const db = getDatabase();
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, validated.username),
  });

  if (existingUser) {
    throw new ValidationError("Username already exists");
  }

  // 3. Check if email already exists (if provided)
  if (validated.email) {
    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, validated.email),
    });

    if (existingEmail) {
      throw new ValidationError("Email already exists");
    }
  }

  // 4. Hash password
  const passwordHash = await bcrypt.hash(validated.password, 12);

  // 5. Create user
  const userId = generateUserId();
  const now = new Date();

  const newUser = {
    id: userId,
    username: validated.username,
    email: validated.email,
    passwordHash,
    displayName: validated.displayName,
    avatarUrl: null,
    bio: null,
    preferences: JSON.stringify({
      theme: "dark",
      notifications: true,
      language: "en",
    }),
    isActive: true,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(users).values(newUser);

  // 6. Generate JWT token
  const token = generateToken(userId);

  // 7. Return user without password
  const { passwordHash: _, ...userWithoutPassword } = newUser;

  return {
    user: {
      ...userWithoutPassword,
      email: newUser.email || null,
      preferences: JSON.parse(newUser.preferences),
      avatarUrl: newUser.avatarUrl,
      bio: newUser.bio,
      lastLoginAt: newUser.lastLoginAt,
    },
    token,
  };
}

/**
 * Validate JWT token and return user
 */
export async function validateToken(token: string): Promise<User> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const db = getDatabase();

    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId),
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError("Invalid token");
    }

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      preferences: user.preferences ? JSON.parse(user.preferences) : {},
    };
  } catch (error) {
    throw new AuthenticationError("Invalid token");
  }
}

/**
 * List all user accounts (for account switching)
 */
export async function listAccounts(): Promise<User[]> {
  const db = getDatabase();

  const allUsers = await db.query.users.findMany({
    where: eq(users.isActive, true),
    orderBy: [users.lastLoginAt, users.createdAt],
  });

  return allUsers.map((user) => {
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
export async function isFirstRun(): Promise<boolean> {
  const db = getDatabase();

  const userCount = await db.select({ count: users.id }).from(users);
  return userCount.length === 0;
}

/**
 * Create default account for first run
 */
export async function createDefaultAccount(): Promise<AuthResponse> {
  const isFirst = await isFirstRun();

  if (!isFirst) {
    throw new ValidationError(
      "Default account can only be created on first run",
    );
  }

  return register({
    username: "admin",
    displayName: "Administrator",
    password: "admin123",
    email: "admin@project-wiz.local",
  });
}

/**
 * Extract user ID from JWT token
 */
export function extractUserIdFromToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

/**
 * Generate JWT token for user
 */
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
