import { z } from "zod";

// Agent schemas
export const CreateAgentSchema = z.object({
  name: z
    .string()
    .min(2, "Agent name must be at least 2 characters")
    .max(50, "Agent name cannot exceed 50 characters"),
  description: z
    .string()
    .max(300, "Description cannot exceed 300 characters")
    .optional(),
  role: z.enum(
    ["developer", "designer", "tester", "architect", "pm", "reviewer"],
    {
      errorMap: () => ({ message: "Invalid role" }),
    },
  ),
  expertise: z
    .array(z.string())
    .max(10, "Too many expertise areas")
    .optional()
    .default([]),
  personality: z.record(z.any()).optional().default({}),
  systemPrompt: z.string().max(2000, "System prompt too long").optional(),
  llmProvider: z.enum(["openai", "deepseek"]).default("deepseek"),
  llmModel: z.string().max(100, "Model name too long").default("deepseek-chat"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().min(1).max(8000).default(4000),
});

export const UpdateAgentSchema = z.object({
  name: z
    .string()
    .min(2, "Agent name must be at least 2 characters")
    .max(50, "Agent name cannot exceed 50 characters")
    .optional(),
  description: z
    .string()
    .max(300, "Description cannot exceed 300 characters")
    .optional()
    .nullable(),
  role: z
    .enum(["developer", "designer", "tester", "architect", "pm", "reviewer"])
    .optional(),
  expertise: z.array(z.string()).max(10, "Too many expertise areas").optional(),
  personality: z.record(z.any()).optional(),
  systemPrompt: z.string().max(2000, "System prompt too long").optional(),
  llmProvider: z.enum(["openai", "deepseek"]).optional(),
  llmModel: z.string().max(100, "Model name too long").optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(1).max(8000).optional(),
});

// Types inferred from schemas
export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;

// Additional types
export type AgentStatus = "online" | "busy" | "offline";

export interface Agent {
  id: string;
  name: string;
  description?: string;
  role: string;
  expertise: string[];
  personality: Record<string, any>;
  systemPrompt: string;
  avatarUrl?: string;
  status: AgentStatus;
  isGlobal: boolean;
  llmProvider: string;
  llmModel: string;
  temperature: number;
  maxTokens: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
