import { z } from "zod";

export const CreateUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
  settings: z.object({
    theme: z.enum(["light", "dark", "system"]).default("system"),
    language: z.enum(["en", "pt-BR"]).default("en"),
    notifications: z
      .object({
        enabled: z.boolean().default(true),
        email: z.boolean().default(false),
        desktop: z.boolean().default(false),
      })
      .default({ enabled: true, email: false, desktop: false }),
    autoSave: z.boolean().default(true),
  }),
});

export const UpdateUserProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
});

export const UpdateUserSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.enum(["en", "pt-BR"]).default("en"),
  notifications: z
    .object({
      enabled: z.boolean().default(true),
      email: z.boolean().default(false),
      desktop: z.boolean().default(false),
    })
    .default({ enabled: true, email: false, desktop: false }),
  autoSave: z.boolean().default(true),
});

export type CreateUserData = z.infer<typeof CreateUserSchema>;
export type UpdateUserProfileData = z.infer<typeof UpdateUserProfileSchema>;
export type UpdateUserSettingsData = z.infer<typeof UpdateUserSettingsSchema>;
