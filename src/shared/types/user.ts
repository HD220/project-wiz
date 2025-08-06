import { z } from "zod";

/**
 * User entity schema for public API
 * Clean domain type without technical fields (isActive, deactivatedAt, etc.)
 */
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  type: z.enum(["human", "agent"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * User summary for lists and references
 */
export const UserSummarySchema = UserSchema.pick({
  id: true,
  name: true,
  avatar: true,
  type: true
});

export type UserSummary = z.infer<typeof UserSummarySchema>;

/**
 * Authenticated user type with session info
 */
export const AuthenticatedUserSchema = UserSchema.extend({
  // Add session-specific fields if needed
  sessionId: z.string().optional(),
});

export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;

/**
 * Auth result from login operations
 */
export const AuthResultSchema = z.object({
  user: AuthenticatedUserSchema,
  token: z.string().optional(), // JWT token if used
});

export type AuthResult = z.infer<typeof AuthResultSchema>;