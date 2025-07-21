import { z } from "zod";

/**
 * Schema for login credentials validation
 */
export const LoginCredentialsSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
});

/**
 * Schema for user registration input validation
 */
export const RegisterUserInputSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  avatar: z
    .string()
    .url("Avatar must be a valid URL")
    .optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
});

/**
 * Schema for password change validation
 */
export const ChangePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .max(100, "New password must not exceed 100 characters"),
  confirmPassword: z
    .string()
    .min(1, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Schema for username validation (standalone)
 */
export const UsernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(50, "Username must not exceed 50 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens");

/**
 * Schema for password validation (standalone)
 */
export const PasswordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password must not exceed 100 characters");

// Type exports for use in other files
export type LoginCredentialsInput = z.infer<typeof LoginCredentialsSchema>;
export type RegisterUserInputInput = z.infer<typeof RegisterUserInputSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;