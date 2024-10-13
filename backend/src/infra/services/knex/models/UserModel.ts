import { z } from "zod";

export const userModelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  email: z.string().email(),
  email_verified: z.date().nullable(),
  image: z.string().nullable(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type UserModel = z.infer<typeof userModelSchema>;
