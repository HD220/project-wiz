import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";

export function registerUserSettingsIpcHandlers(cqrsDispatcher: CqrsDispatcher): void {
  createIpcHandler(
    IpcChannel.USER_SETTINGS_SAVE,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Save user settings payload:", payload);
      return { userId: "", key: "", value: "" };
    },
  );

  createIpcHandler(
    IpcChannel.USER_SETTINGS_GET,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Get user settings payload:", payload);
      return { userId: "", key: "", value: "" };
    },
  );

  createIpcHandler(
    IpcChannel.USER_SETTINGS_LIST,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("List user settings payload:", payload);
      return [];
    },
  );
}
