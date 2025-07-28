import { z } from "zod";

/**
 * Schema for LLM provider filters validation (renderer-side)
 */
export const ProviderFiltersSchema = z
  .object({
    type: z
      .enum(["openai", "deepseek", "anthropic", "google", "custom"])
      .optional(),
    search: z
      .string()
      .max(200, "Search term must not exceed 200 characters")
      .trim()
      .optional(),
    showInactive: z.boolean().optional().default(false),
  })
  .partial();

// Type exports for use in renderer components
export type ProviderFiltersInput = z.infer<typeof ProviderFiltersSchema>;
