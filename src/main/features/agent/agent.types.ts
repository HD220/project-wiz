import { z } from "zod";

import type {
  SelectAgent,
  InsertAgent,
  AgentStatus,
} from "@/main/features/agent/agent.model";
import type { SelectLlmProvider } from "@/main/features/agent/llm-provider/llm-provider.model";

// Model configuration interface
export interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
}

// Input type for creating an agent (without generated fields)
export type CreateAgentInput = Omit<
  InsertAgent,
  "id" | "userId" | "systemPrompt" | "createdAt" | "updatedAt"
> & {
  avatar?: string; // Optional avatar for the user entry
};

// Model configuration validation schema
export const modelConfigSchema = z.object({
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(2, "Temperature must be between 0 and 2"),
  maxTokens: z.number().int().positive("Max tokens must be a positive integer"),
  topP: z.number().min(0).max(1).optional(),
});

// Validation schema for creating an agent
export const createAgentSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(100, "Name too long"),
  role: z.string().min(1, "Agent role is required").max(100, "Role too long"),
  backstory: z
    .string()
    .min(10, "Backstory must be at least 10 characters")
    .max(1000, "Backstory too long"),
  goal: z
    .string()
    .min(10, "Goal must be at least 10 characters")
    .max(500, "Goal too long"),
  providerId: z.string().min(1, "LLM provider is required"),
  modelConfig: z.string().refine(
    (val) => {
      try {
        const parsed = JSON.parse(val);
        return modelConfigSchema.safeParse(parsed).success;
      } catch {
        return false;
      }
    },
    { message: "Invalid model configuration" },
  ),
  status: z.enum(["active", "inactive", "busy"]).default("inactive"),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

// Response types
export type AgentWithProvider = SelectAgent & {
  provider: SelectLlmProvider;
};

export type AgentSummary = Pick<SelectAgent, "id" | "name" | "role" | "status">;

// Export types for reuse
export type { SelectAgent, InsertAgent, AgentStatus };
