import type { Agent } from "@/lib/placeholders";
import { StringUtils } from "../shared-utils";

export const AgentUtils = {
  getInitials: StringUtils.getInitials,

  isActive: (status: Agent["status"]): boolean => {
    return ["online", "executing", "busy"].includes(status);
  },

  isAvailable: (status: Agent["status"]): boolean => {
    return status === "online";
  },

  formatDescription: StringUtils.truncate,
} as const;
