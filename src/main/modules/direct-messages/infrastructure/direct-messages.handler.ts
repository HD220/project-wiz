import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";

export function registerDirectMessagesIpcHandlers(cqrsDispatcher: CqrsDispatcher): void {
  createIpcHandler(
    IpcChannel.DIRECT_MESSAGES_SEND,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Send message payload:", payload);
      return { id: "", senderId: "", receiverId: "", content: "", timestamp: 0 };
    },
  );

  createIpcHandler(
    IpcChannel.DIRECT_MESSAGES_LIST,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("List messages payload:", payload);
      return [];
    },
  );
}
