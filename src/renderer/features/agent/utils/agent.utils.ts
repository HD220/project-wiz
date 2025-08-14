import type { Agent } from "@/renderer/features/agent/agent.types";

import { getRendererLogger } from "@/shared/services/logger/renderer";

const logger = getRendererLogger("agent.utils");

export interface ParsedModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  [key: string]: unknown;
}

export function parseModelConfig(
  modelConfig: unknown,
  agentId?: string,
): ParsedModelConfig {
  const defaultConfig: ParsedModelConfig = {
    model: "Unknown Model",
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.95,
  };

  if (!modelConfig) {
    logger.warn("No modelConfig provided", { agentId });
    return defaultConfig;
  }

  if (typeof modelConfig === "object") {
    logger.debug("Parsed modelConfig from object", { agentId, modelConfig });
    return { ...defaultConfig, ...modelConfig };
  }

  if (typeof modelConfig === "string") {
    try {
      const parsed = JSON.parse(modelConfig);
      logger.debug("Parsed modelConfig from JSON string", { agentId, parsed });
      return { ...defaultConfig, ...parsed };
    } catch (error) {
      logger.error("Failed to parse modelConfig JSON", {
        agentId,
        modelConfig,
        error: error instanceof Error ? error.message : String(error),
      });
      return defaultConfig;
    }
  }

  logger.warn("Unexpected modelConfig type", {
    agentId,
    type: typeof modelConfig,
    value: modelConfig,
  });
  return defaultConfig;
}

export function getAgentModelName(agent: Agent): string {
  const config = parseModelConfig(agent.modelConfig, agent.id);
  return config.model;
}
