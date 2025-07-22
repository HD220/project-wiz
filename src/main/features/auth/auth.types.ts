// Authentication types for the user domain

import type { AuthenticatedUser } from "@/main/features/user/user.types";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterUserInput {
  username: string;
  name: string;
  avatar?: string;
  password: string;
}

// Re-export from user types to avoid duplication
export type { AuthenticatedUser };

export interface AuthResult {
  user: AuthenticatedUser;
  sessionToken: string;
}
