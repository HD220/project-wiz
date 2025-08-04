// Shared user types used across main process
import type { SelectUser } from "@/main/database/schemas/user.schema";

// Authenticated user type (without sensitive fields)
export type AuthenticatedUser = Omit<SelectUser, "passwordHash">;

// User type helper for session management
export type SessionUser = AuthenticatedUser;