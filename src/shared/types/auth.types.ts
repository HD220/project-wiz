import { z } from "zod";

// Login schemas
export const LoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscore and dash",
    ),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name cannot exceed 50 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email format").optional(),
});

export const UpdateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscore and dash",
    )
    .optional(),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name cannot exceed 50 characters")
    .optional(),
  email: z.string().email("Invalid email format").optional().nullable(),
  bio: z
    .string()
    .max(500, "Bio cannot exceed 500 characters")
    .optional()
    .nullable(),
  avatarUrl: z.string().url("Invalid avatar URL").optional().nullable(),
});

// Types inferred from schemas
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// Response types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  preferences: Record<string, any>;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
