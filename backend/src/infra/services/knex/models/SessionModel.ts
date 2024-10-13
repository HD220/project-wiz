import { z } from "zod";

export const sessionModelSchema = z.object({
  // id: z.string().uuid(),
  session_token: z.string(),
  user_id: z.string().uuid(),
  expires: z.date(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type SessionModel = z.infer<typeof sessionModelSchema>;
