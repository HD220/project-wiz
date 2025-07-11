import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";

export function registerPersonaIpcHandlers(cqrsDispatcher: CqrsDispatcher): void {
  createIpcHandler(
    IpcChannel.PERSONA_REFINE_SUGGESTION,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Refine persona suggestion payload:", payload);
      return "";
    },
  );

  createIpcHandler(
    IpcChannel.PERSONA_CREATE,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Create persona payload:", payload);
      return { id: "", name: "", description: "", llmConfig: { provider: "", model: "", apiKey: "" }, tools: [] };
    },
  );

  createIpcHandler(
    IpcChannel.PERSONA_LIST,
    cqrsDispatcher,
    async () => {
      // Placeholder for actual logic
      return [];
    },
  );

  createIpcHandler(
    IpcChannel.PERSONA_REMOVE,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Remove persona payload:", payload);
      return { success: true };
    },
  );
}
