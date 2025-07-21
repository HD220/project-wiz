import { z } from "zod";

/**
 * Schema for user creation validation
 */
export const CreateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  avatar: z.string().url("Avatar must be a valid URL").optional(),
  type: z
    .enum(["human", "agent"], {
      errorMap: () => ({ message: "Type must be either 'human' or 'agent'" }),
    })
    .default("human"),
});

/**
 * Schema for user update validation
 */
export const UpdateUserSchema = z.object({
  id: z.string().uuid("User ID must be a valid UUID"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim()
    .optional(),
  avatar: z.string().url("Avatar must be a valid URL").optional().nullable(),
  type: z
    .enum(["human", "agent"], {
      errorMap: () => ({ message: "Type must be either 'human' or 'agent'" }),
    })
    .optional(),
});

/**
 * Schema for user preferences validation
 */
export const UserPreferencesSchema = z.object({
  userId: z.string().uuid("User ID must be a valid UUID"),
  theme: z
    .enum(["dark", "light", "system"], {
      errorMap: () => ({
        message: "Theme must be 'dark', 'light', or 'system'",
      }),
    })
    .default("system"),
});

/**
 * Schema for updating user preferences
 */
export const UpdateUserPreferencesSchema = z.object({
  id: z.string().uuid("Preferences ID must be a valid UUID"),
  userId: z.string().uuid("User ID must be a valid UUID").optional(),
  theme: z
    .enum(["dark", "light", "system"], {
      errorMap: () => ({
        message: "Theme must be 'dark', 'light', or 'system'",
      }),
    })
    .optional(),
});

/**
 * Schema for creating user preferences
 */
export const CreateUserPreferencesSchema = z.object({
  userId: z.string().uuid("User ID must be a valid UUID"),
  theme: z
    .enum(["dark", "light", "system"], {
      errorMap: () => ({
        message: "Theme must be 'dark', 'light', or 'system'",
      }),
    })
    .default("system"),
});

/**
 * Schema for user profile creation (user + preferences)
 */
export const CreateUserProfileSchema = z.object({
  user: CreateUserSchema,
  preferences: CreateUserPreferencesSchema.omit({ userId: true }).optional(),
});

/**
 * Schema for user profile update (user + preferences)
 */
export const UpdateUserProfileSchema = z.object({
  user: UpdateUserSchema.optional(),
  preferences: UpdateUserPreferencesSchema.optional(),
});

/**
 * Schema for user ID validation
 */
export const UserIdSchema = z.string().uuid("User ID must be a valid UUID");

/**
 * Schema for user name validation (standalone)
 */
export const UserNameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must not exceed 100 characters")
  .trim();

/**
 * Schema for user type validation (standalone)
 */
export const UserTypeSchema = z.enum(["human", "agent"], {
  errorMap: () => ({ message: "Type must be either 'human' or 'agent'" }),
});

/**
 * Schema for theme validation (standalone)
 */
export const ThemeSchema = z.enum(["dark", "light", "system"], {
  errorMap: () => ({ message: "Theme must be 'dark', 'light', or 'system'" }),
});

// Type exports for use in other files
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserPreferencesInput = z.infer<typeof UserPreferencesSchema>;
export type UpdateUserPreferencesInput = z.infer<
  typeof UpdateUserPreferencesSchema
>;
export type CreateUserPreferencesInput = z.infer<
  typeof CreateUserPreferencesSchema
>;
export type CreateUserProfileInput = z.infer<typeof CreateUserProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
