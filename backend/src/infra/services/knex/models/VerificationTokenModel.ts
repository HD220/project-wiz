import { z } from "zod";

export const verificationTokenModelSchema = z.object({
  identifier: z.string(),
  token: z.string().max(255),
  expires: z.date(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type VerificationTokenModel = z.infer<
  typeof verificationTokenModelSchema
>;
