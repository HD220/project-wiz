import { z } from "zod";

export const accountModelSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.string(),
  provider: z.string(),
  provider_account_id: z.string(),
  refresh_token: z.string().nullable(),
  access_token: z.string().nullable(),
  expires_at: z.bigint().nullable(),
  expires_in: z.bigint().nullable(),
  token_type: z.string().nullable(),
  scope: z.string().nullable(),
  id_token: z.string().nullable(),
  session_state: z.string().nullable(),
  password: z.string().max(512).nullable(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type AccountModel = z.infer<typeof accountModelSchema>;
