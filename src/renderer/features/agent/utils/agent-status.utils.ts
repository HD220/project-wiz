import type { AgentStatus } from "@/renderer/features/agent/agent.types";

export const getAgentStatusVariant = (status: AgentStatus) => {
  switch (status) {
    case "active":
      return "default";
    case "busy":
      return "destructive";
    case "inactive":
    default:
      return "secondary";
  }
};

export const getAgentStatusSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return "px-1.5 py-0.5 text-xs";
    case "lg":
      return "px-3 py-1.5 text-sm";
    case "md":
    default:
      return "px-2 py-1 text-xs";
  }
};

export const getAgentStatusDotColor = (status: AgentStatus) => {
  switch (status) {
    case "active":
      return "bg-emerald-500 dark:bg-emerald-400";
    case "busy":
      return "bg-orange-500 dark:bg-orange-400";
    case "inactive":
    default:
      return "bg-slate-400 dark:bg-slate-500";
  }
};

export const getAgentStatusDotSize = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return "size-1.5";
    case "lg":
      return "size-2.5";
    case "md":
    default:
      return "size-2";
  }
};

export const getAgentStatusLabel = (status: AgentStatus) => {
  switch (status) {
    case "active":
      return "Active";
    case "busy":
      return "Busy";
    case "inactive":
    default:
      return "Inactive";
  }
};
