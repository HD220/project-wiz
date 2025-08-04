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