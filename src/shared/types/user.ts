import { z } from "zod";

/**
 * User domain entity
 */
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  type: z.enum(["human", "agent"]),
  status: z.enum(["online", "away", "busy", "offline"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
