import { z } from "zod";

/**
 * Schema for model configuration validation
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
 * Schema for agent creation validation
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
  avatar: z
    .string()
    .url("Avatar must be a valid URL")
    .optional()
    .or(z.literal("")),
});

/**
 * Schema for agent update validation
 */
export const UpdateAgentSchema = z
  .object({
    id: z.string().uuid("Agent ID must be a valid UUID"),
    name: z
      .string()
      .min(1, "Agent name is required")
      .max(100, "Agent name must not exceed 100 characters")
      .trim()
      .optional(),
    role: z
      .string()
      .min(1, "Agent role is required")
      .max(100, "Agent role must not exceed 100 characters")
      .trim()
      .optional(),
    backstory: z
      .string()
      .min(10, "Backstory must be at least 10 characters")
      .max(1000, "Backstory must not exceed 1000 characters")
      .trim()
      .optional(),
    goal: z
      .string()
      .min(10, "Goal must be at least 10 characters")
      .max(500, "Goal must not exceed 500 characters")
      .trim()
      .optional(),
    providerId: z
      .string()
      .min(1, "LLM provider is required")
      .uuid("Provider ID must be a valid UUID")
      .optional(),
    modelConfig: z
      .string()
      .refine(
        (val) => {
          try {
            const parsed = JSON.parse(val);
            return ModelConfigSchema.safeParse(parsed).success;
          } catch {
            return false;
          }
        },
        { message: "Invalid model configuration JSON" },
      )
      .optional(),
    status: z
      .enum(["active", "inactive", "busy"], {
        errorMap: () => ({
          message: "Status must be 'active', 'inactive', or 'busy'",
        }),
      })
      .optional(),
    avatar: z
      .string()
      .url("Avatar must be a valid URL")
      .optional()
      .or(z.literal("")),
  })
  .partial();

/**
 * Schema for agent ID validation
 */
export const AgentIdSchema = z.string().uuid("Agent ID must be a valid UUID");

/**
 * Schema for agent name validation (standalone)
 */
export const AgentNameSchema = z
  .string()
  .min(1, "Agent name is required")
  .max(100, "Agent name must not exceed 100 characters")
  .trim();

/**
 * Schema for agent status validation (standalone)
 */
export const AgentStatusSchema = z.enum(["active", "inactive", "busy"], {
  errorMap: () => ({
    message: "Status must be 'active', 'inactive', or 'busy'",
  }),
});

/**
 * Schema for agent filters validation
 */
export const AgentFiltersSchema = z
  .object({
    status: AgentStatusSchema.optional(),
    providerId: z.string().uuid("Provider ID must be a valid UUID").optional(),
    search: z
      .string()
      .max(200, "Search term must not exceed 200 characters")
      .trim()
      .optional(),
    showInactive: z.boolean().optional().default(false),
  })
  .partial();

/**
 * Schema for agent status update operation
 */
export const UpdateAgentStatusSchema = z.object({
  id: AgentIdSchema,
  status: AgentStatusSchema,
});

/**
 * Schema for agent deletion validation
 */
export const DeleteAgentSchema = z.object({
  id: AgentIdSchema,
});

// Type exports for use in other files
export type ModelConfigInput = z.infer<typeof ModelConfigSchema>;
export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;
export type AgentFiltersInput = z.infer<typeof AgentFiltersSchema>;
export type UpdateAgentStatusInput = z.infer<typeof UpdateAgentStatusSchema>;
export type DeleteAgentInput = z.infer<typeof DeleteAgentSchema>;
