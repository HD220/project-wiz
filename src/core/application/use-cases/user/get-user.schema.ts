import { z } from 'zod';

// Schema for input when fetching a user
// Allows fetching by either ID or email. One must be provided.
export const GetUserInputSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
}).refine(data => data.userId || data.email, {
  message: "Either userId or email must be provided to get a user.",
  path: ["userId", "email"],
});

export type GetUserInput = z.infer<typeof GetUserInputSchema>;

// Schema for the output when fetching a user (similar to CreateUserOutput)
export const GetUserOutputSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  nickname: z.string(),
  avatarUrl: z.string().url().optional().nullable(),
  defaultLLMProviderConfigId: z.string().uuid(),
  assistantId: z.string().uuid().optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type GetUserOutput = z.infer<typeof GetUserOutputSchema>;
