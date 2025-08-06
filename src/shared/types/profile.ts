import { z } from "zod";

// Profile Domain Entity Schema
export const ProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  theme: z.enum(["light", "dark", "system"]),
  language: z.string().optional(),
  timezone: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Export domain entity type
export type Profile = z.infer<typeof ProfileSchema>;