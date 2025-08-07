import type { Agent } from "@/renderer/features/agent/agent.types";

export function getAgentModelName(agent: Agent): string {
  if (!agent.modelConfig) return "Unknown Model";

  try {
    const config = JSON.parse(agent.modelConfig);
    return config.model || "Unknown Model";
  } catch {
    return "Invalid Model Config";
  }
}
