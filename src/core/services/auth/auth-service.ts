// AuthService: JWT-based authentication service for user registration, login, logout, session verification, and token refresh.

import jwt from "jsonwebtoken";
import { compare, hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { AuthUser, AuthToken, AuthServiceInterface, RegisterInput, LoginInput, AuthSession } from "./types";

// In-memory user store for demonstration (replace with DB in production)
const users: Record<string, AuthUser> = {};

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = "1h";
const JWT_REFRESH_EXPIRES_IN = "7d";

function generateToken(payload: object, expiresIn: string) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

export class AuthService implements AuthServiceInterface {
  async register(input: RegisterInput): Promise<AuthUser> {
    if (users[input.email]) {
      throw new Error("User already exists");
    }
    const passwordHash = await hash(input.password, 10);
    const user: AuthUser = {
      id: uuidv4(),
      email: input.email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    users[input.email] = user;
    return user;
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const user = users[input.email];
    if (!user) throw new Error("Invalid credentials");
    const valid = await compare(input.password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");
    const accessToken = generateToken({ sub: user.id, email: user.email }, JWT_EXPIRES_IN);
    const refreshToken = generateToken({ sub: user.id, email: user.email }, JWT_REFRESH_EXPIRES_IN);
    return {
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN,
    };
  }

  async logout(_token: string): Promise<void> {
    // For stateless JWT, logout is handled client-side (token removal)
    // Optionally, implement token blacklist here
  }

  async verifySession(token: string): Promise<AuthUser | null> {
    try {
      const payload = verifyToken(token) as any;
      const user = Object.values(users).find((u) => u.id === payload.sub);
      return user ? { id: user.id, email: user.email, createdAt: user.createdAt } : null;
    } catch {
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthSession> {
    try {
      const payload = verifyToken(refreshToken) as any;
      const user = Object.values(users).find((u) => u.id === payload.sub);
      if (!user) throw new Error("Invalid refresh token");
      const accessToken = generateToken({ sub: user.id, email: user.email }, JWT_EXPIRES_IN);
      const newRefreshToken = generateToken({ sub: user.id, email: user.email }, JWT_REFRESH_EXPIRES_IN);
      return {
        user: { id: user.id, email: user.email },
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: JWT_EXPIRES_IN,
      };
    } catch {
      throw new Error("Invalid refresh token");
    }
  }
}