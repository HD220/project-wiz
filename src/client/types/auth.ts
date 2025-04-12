/**
 * Auth types for authentication flows.
 * Centralized for reuse and documentation.
 */

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}