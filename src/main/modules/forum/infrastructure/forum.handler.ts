import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";

export function registerForumIpcHandlers(cqrsDispatcher: CqrsDispatcher): void {
  createIpcHandler(
    IpcChannel.FORUM_LIST_TOPICS,
    cqrsDispatcher,
    async () => {
      // Placeholder for actual logic
      return [];
    },
  );

  createIpcHandler(
    IpcChannel.FORUM_CREATE_TOPIC,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Create topic payload:", payload);
      return { id: "", title: "", createdAt: 0, updatedAt: 0 };
    },
  );

  createIpcHandler(
    IpcChannel.FORUM_LIST_POSTS,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("List posts payload:", payload);
      return [];
    },
  );

  createIpcHandler(
    IpcChannel.FORUM_CREATE_POST,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Create post payload:", payload);
      return { id: "", topicId: "", content: "", createdAt: 0, updatedAt: 0 };
    },
  );
}
