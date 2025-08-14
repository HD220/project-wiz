import type { Agent } from "@/shared/types";

import type {
  CreateAgentInput,
  AgentFiltersInput,
  ModelConfigInput,
} from "./agent.schema";

/**
 * Agent-related types for renderer features
 */

// Re-export shared types for convenience
export type { Agent };

// Schema-derived types
export type { CreateAgentInput, AgentFiltersInput, ModelConfigInput };

/**
 * Select variant of Agent - used in database queries
 * This represents an Agent as returned by database select operations
 */
export type SelectAgent = Agent;

/**
 * Agent with extended relationships for UI display
 */
export interface AgentWithProvider extends Agent {
  provider: {
    id: string;
    name: string;
    type: string;
  };
}

/**
 * User status types for presence indication
 */
export type UserStatus = "online" | "away" | "busy" | "offline";

/**
 * Agent list item - minimal agent data for list displays
 */
export interface AgentListItem {
  id: string;
  name: string;
  role: string;
  status: UserStatus;
  deactivatedAt: Date | null;
  avatar: string | null;
  providerId: string;
  createdAt: Date;
}

/**
 * Agent update input - partial agent data for updates
 */
export interface UpdateAgentInput {
  id: string;
  name?: string;
  role?: string;
  backstory?: string;
  goal?: string;
  status?: UserStatus;
  deactivatedAt?: Date | null;
  avatar?: string | null;
  providerId?: string;
  modelConfig?: string;
}
