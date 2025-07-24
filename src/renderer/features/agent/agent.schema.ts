import { z } from "zod";

/**
 * Schema for model configuration validation (renderer-side)
 */
export const ModelConfigSchema = z.object({
  model: z.string().min(1, "Model is required"),
  temperature: z
    .number()
    .min(0, "Temperature must be at least 0")
    .max(2, "Temperature must not exceed 2"),
  maxTokens: z
    .number()
    .int("Max tokens must be an integer")
    .positive("Max tokens must be a positive number"),
  topP: z
    .number()
    .min(0, "Top P must be at least 0")
    .max(1, "Top P must not exceed 1")
    .optional(),
});

/**
 * Schema for agent creation validation (renderer-side)
 */
export const CreateAgentSchema = z.object({
  name: z
    .string()
    .min(1, "Agent name is required")
    .max(100, "Agent name must not exceed 100 characters")
    .trim(),
  role: z
    .string()
    .min(1, "Agent role is required")
    .max(100, "Agent role must not exceed 100 characters")
    .trim(),
  backstory: z
    .string()
    .min(10, "Backstory must be at least 10 characters")
    .max(1000, "Backstory must not exceed 1000 characters")
    .trim(),
  goal: z
    .string()
    .min(10, "Goal must be at least 10 characters")
    .max(500, "Goal must not exceed 500 characters")
    .trim(),
  providerId: z
    .string()
    .min(1, "LLM provider is required")
    .uuid("Provider ID must be a valid UUID"),
  modelConfig: z.string().refine(
    (val) => {
      try {
        const parsed = JSON.parse(val);
        return ModelConfigSchema.safeParse(parsed).success;
      } catch {
        return false;
      }
    },
    { message: "Invalid model configuration JSON" },
  ),
  status: z
    .enum(["active", "inactive", "busy"], {
      errorMap: () => ({
        message: "Status must be 'active', 'inactive', or 'busy'",
      }),
    })
    .default("inactive")
    .optional(),
  avatar: z.string().url("Avatar must be a valid URL").optional(),
});

/**
 * Schema for agent filters validation (renderer-side)
 */
export const AgentFiltersSchema = z
  .object({
    status: z.enum(["active", "inactive", "busy"]).optional(),
    providerId: z.string().uuid("Provider ID must be a valid UUID").optional(),
    search: z
      .string()
      .max(200, "Search term must not exceed 200 characters")
      .trim()
      .optional(),
  })
  .partial();

// Type exports for use in renderer components
export type ModelConfigInput = z.infer<typeof ModelConfigSchema>;
export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
export type AgentFiltersInput = z.infer<typeof AgentFiltersSchema>;
