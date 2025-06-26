import { z } from 'zod';

// Schema for creating a new user
export const CreateUserInputSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long.').max(50, 'Username cannot exceed 50 characters.'),
  email: z.string().email('Invalid email address.'),
  nickname: z.string().min(1, 'Nickname is required.').max(50, 'Nickname cannot exceed 50 characters.'),
  // Password handling needs to be considered carefully.
  // For now, let's assume a plain text password is provided for the use case.
  // Hashing should occur before storage, ideally via a HashingService or within the domain if UserPassword VO existed.
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  avatarUrl: z.string().url('Invalid URL for avatar.').optional(), // Optional avatar URL
  defaultLLMProviderConfigId: z.string().uuid('Invalid UUID for default LLM provider config ID.'),
  assistantId: z.string().uuid('Invalid UUID for assistant ID.').optional().nullable(),
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

// Schema for the output after creating a user
export const CreateUserOutputSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  nickname: z.string(),
  avatarUrl: z.string().url().optional().nullable(),
  defaultLLMProviderConfigId: z.string().uuid(),
  assistantId: z.string().uuid().optional().nullable(),
  createdAt: z.string().datetime(), // ISO string
  updatedAt: z.string().datetime(), // ISO string
});

export type CreateUserOutput = z.infer<typeof CreateUserOutputSchema>;
