import { z } from "zod";

/**
 * Profile domain entity
 */
export const ProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  theme: z.enum(["light", "dark", "system"]),
  language: z.string().optional(),
  timezone: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Profile = z.infer<typeof ProfileSchema>;
