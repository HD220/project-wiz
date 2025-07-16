import { getLogger } from "../infrastructure/logger";

import { registerAgentHandlers } from "./agents.handlers";
import { registerLlmProviderHandlers } from "./llm.handlers";
import {
  registerProjectHandlers,
  registerChannelHandlers,
  registerChannelMessageHandlers,
} from "./projects.handlers";
import {
  registerUserHandlers,
  registerDirectMessageHandlers,
} from "./users.handlers";

const logger = getLogger("ipc.handlers");

export function registerDomainHandlers(): void {
  logger.info("Registering domain IPC handlers");

  // Register all domain handlers
  registerAgentHandlers();
  registerLlmProviderHandlers();
  registerProjectHandlers();
  registerChannelHandlers();
  registerChannelMessageHandlers();
  registerUserHandlers();
  registerDirectMessageHandlers();

  logger.info("Domain IPC handlers registered successfully");
}
