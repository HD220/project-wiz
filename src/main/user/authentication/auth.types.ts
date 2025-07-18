// Authentication types for the user domain

import type {
  SelectUser,
  InsertUser,
} from "@/main/user/authentication/users.schema";

export interface LoginCredentials {
  username: string;
  password: string;
}

export type RegisterUserInput = Omit<InsertUser, "passwordHash"> & {
  password: string;
};

export type AuthenticatedUser = Omit<SelectUser, "passwordHash">;
