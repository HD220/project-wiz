// New IPC handlers following FILE-STRUCTURE.md
import { registerAuthHandlers } from "../user/authentication/auth.handlers";
import { registerProjectHandlers } from "../project/project.handlers";
import { registerChannelHandlers } from "../project/channels/channel.handlers";
import { setupFileSystemHandlers } from "../project/files/file-system.handlers";
import { setupTerminalHandlers } from "../project/terminal/terminal.handlers";
import { registerAgentHandlers } from "../agents/worker/agent.handlers";
import { setupQueueHandlers } from "../agents/queue/queue.handlers";
import { registerMessageHandlers } from "../conversations/core/message.handlers";
import { registerLlmProviderHandlers } from "../agents/llm/llm.handlers";

export function registerAllHandlers(): void {
  console.log("Registering all IPC handlers...");

  // User bounded context
  registerAuthHandlers();

  // Project bounded context
  registerProjectHandlers();
  registerChannelHandlers();
  setupFileSystemHandlers();
  setupTerminalHandlers();

  // Agents bounded context
  registerAgentHandlers();
  setupQueueHandlers();

  // Conversations bounded context
  registerMessageHandlers();

  // LLM providers (using service from old structure temporarily)
  registerLlmProviderHandlers();

  console.log("All IPC handlers registered successfully");
}
