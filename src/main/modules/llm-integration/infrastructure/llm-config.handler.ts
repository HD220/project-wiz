import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";

export function registerLlmConfigIpcHandlers(cqrsDispatcher: CqrsDispatcher): void {
  createIpcHandler(
    IpcChannel.LLM_CONFIG_SAVE,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Save LLM config payload:", payload);
      return { provider: "", model: "", apiKey: "" };
    },
  );

  createIpcHandler(
    IpcChannel.LLM_CONFIG_GET,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Get LLM config payload:", payload);
      return { provider: "", model: "", apiKey: "" };
    },
  );

  createIpcHandler(
    IpcChannel.LLM_CONFIG_LIST,
    cqrsDispatcher,
    async () => {
      // Placeholder for actual logic
      return [];
    },
  );

  createIpcHandler(
    IpcChannel.LLM_CONFIG_REMOVE,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Remove LLM config payload:", payload);
      return { success: true };
    },
  );
}
