import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";

export function registerProjectIpcHandlers(cqrsDispatcher: CqrsDispatcher): void {
  createIpcHandler(
    IpcChannel.PROJECT_CREATE,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Create project payload:", payload);
      return { id: "", name: "", localPath: "", createdAt: 0, updatedAt: 0 };
    },
  );

  createIpcHandler(
    IpcChannel.PROJECT_LIST,
    cqrsDispatcher,
    async () => {
      // Placeholder for actual logic
      return [];
    },
  );

  createIpcHandler(
    IpcChannel.PROJECT_REMOVE,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Remove project payload:", payload);
      return { success: true };
    },
  );
}
