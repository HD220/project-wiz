import { z } from "zod";

// Base schema shared between login and register
const baseAuthSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores and hyphens",
    )
    .trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
});

// Login schema - simpler validation for existing accounts
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username is too long")
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password is too long"),
});

// Register schema - more strict validation for new accounts
export const registerSchema = baseAuthSchema
  .extend({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters")
      .trim(),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Union type for all auth modes
export type AuthMode = "login" | "register";

// Inferred types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AuthFormData = LoginFormData | RegisterFormData;

// Dynamic schema selection
export function getAuthSchema(mode: AuthMode) {
  return mode === "login" ? loginSchema : registerSchema;
}

// Default values for forms
export function getDefaultValues(mode: AuthMode): AuthFormData {
  if (mode === "login") {
    return {
      username: "",
      password: "",
    };
  }

  return {
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  };
}
