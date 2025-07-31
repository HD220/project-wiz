// User types for the user domain

import type {
  SelectUserPreferences,
  InsertUserPreferences,
  Theme,
} from "@/main/features/user/profile.model";
import type { SelectUser, InsertUser } from "@/main/features/user/user.model";

// Base user types
export type AuthenticatedUser = Omit<SelectUser, "passwordHash">;
export type UpdateUser = Partial<InsertUser> & { id: string };
export type CreateUserInput = Omit<
  InsertUser,
  "id" | "createdAt" | "updatedAt"
>;

// User preferences types
export type UserPreferences = SelectUserPreferences;
export type CreateUserPreferencesInput = Omit<
  InsertUserPreferences,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateUserPreferencesInput = Partial<InsertUserPreferences> & {
  id: string;
};

// Theme type re-export for convenience
export type { Theme };

// User profile composite type
export interface UserProfile {
  user: SelectUser;
  preferences: UserPreferences;
}

// User creation composite input
export interface CreateUserProfileInput {
  user: CreateUserInput;
  preferences?: Partial<CreateUserPreferencesInput>;
}

// User update composite input
export interface UpdateUserProfileInput {
  user?: UpdateUser;
  preferences?: UpdateUserPreferencesInput;
}
