import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";

export function registerFilesystemIpcHandlers(cqrsDispatcher: CqrsDispatcher): void {
  createIpcHandler(
    IpcChannel.FILESYSTEM_LIST_DIRECTORY,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("List directory payload:", payload);
      return [];
    },
  );

  createIpcHandler(
    IpcChannel.FILESYSTEM_READ_FILE,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Read file payload:", payload);
      return "";
    },
  );

  createIpcHandler(
    IpcChannel.FILESYSTEM_SEARCH_FILE_CONTENT,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Search file content payload:", payload);
      return [];
    },
  );

  createIpcHandler(
    IpcChannel.FILESYSTEM_WRITE_FILE,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Write file payload:", payload);
      return { success: true };
    },
  );
}
