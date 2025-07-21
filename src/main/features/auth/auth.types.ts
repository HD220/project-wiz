// Authentication types for the user domain

import type { SelectUser } from "@/main/features/user/user.model";

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

export type AuthenticatedUser = SelectUser;
