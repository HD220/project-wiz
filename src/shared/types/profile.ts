import { z } from "zod";

// Profile Get Theme Schemas
export const GetThemeInputSchema = z.void();

export const GetThemeOutputSchema = z.object({
  theme: z.enum(["light", "dark", "system"])
});

// Profile Update Theme Schemas
export const UpdateThemeInputSchema = z.object({
  theme: z.enum(["light", "dark", "system"])
});

export const UpdateThemeOutputSchema = z.object({
  theme: z.enum(["light", "dark", "system"])
});

// Export types
export type GetThemeInput = z.infer<typeof GetThemeInputSchema>;
export type GetThemeOutput = z.infer<typeof GetThemeOutputSchema>;
export type UpdateThemeInput = z.infer<typeof UpdateThemeInputSchema>;
export type UpdateThemeOutput = z.infer<typeof UpdateThemeOutputSchema>;