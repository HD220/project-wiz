import { ipcMain, IpcMainInvokeEvent } from "electron";

import {
  IChatService,
  CHAT_SERVICE_TOKEN,
} from "@/core/application/ports/services/i-chat.service";

import { appContainer } from "@/infrastructure/ioc/inversify.config";

import { IPCChannel } from "@/shared/ipc-channels";
import {
  ChatSendMessagePayload,
  ChatStreamEventPayload,
} from "@/shared/ipc-chat.types";

let chatService: IChatService | null = null;

function initializeChatService() {
  try {
    if (appContainer.isBound(CHAT_SERVICE_TOKEN)) {
      chatService = appContainer.get<IChatService>(CHAT_SERVICE_TOKEN);
    } else {
      console.error(
        "[IPC Chat Handler] CRITICAL: CHAT_SERVICE_TOKEN not bound in DI container."
      );
    }
  } catch (diError) {
    console.error(
      "[IPC Chat Handler] Error resolving IChatService from DI container:",
      diError
    );
  }
}

export function registerChatIPCHandlers(): void {
  initializeChatService();

  ipcMain.handle(
    IPCChannel.CHAT_SEND_MESSAGE,
    async (event: IpcMainInvokeEvent, payload: ChatSendMessagePayload) => {
      console.log(
        `[IPC Chat Handler] Received ${IPCChannel.CHAT_SEND_MESSAGE} for session: ${payload.sessionId}`
      );

      if (!chatService) {
        console.error(
          "[IPC Chat Handler] ChatService not initialized. Attempting re-initialization."
        );
        initializeChatService();
        if (!chatService) {
          const errorEvent: ChatStreamEventPayload = {
            type: "error",
            error: {
              name: "ServiceError",
              message: "ChatService not available in main process.",
            },
          };
          if (!event.sender.isDestroyed()) {
            event.sender.send(IPCChannel.CHAT_STREAM_EVENT, errorEvent);
          }
          const endEvent: ChatStreamEventPayload = { type: "end" };
          if (!event.sender.isDestroyed()) {
            event.sender.send(IPCChannel.CHAT_STREAM_EVENT, endEvent);
          }
          return {
            success: false,
            error: { message: "ChatService not available." },
          };
        }
      }

      const sendStreamEventCallback = (
        streamPayload: ChatStreamEventPayload
      ) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send(IPCChannel.CHAT_STREAM_EVENT, streamPayload);
        }
      };

      const result = await chatService.handleSendMessageStream(
        payload,
        sendStreamEventCallback
      );

      if (result.isSuccess()) {
        return { success: true, data: result.value };
      }
      return {
        success: false,
        error: { message: result.error.message, name: result.error.name },
      };
    }
  );

  console.log("[IPC Chat Handler] Chat IPC handlers registered.");
}

export function unregisterChatIPCHandlers(): void {
  ipcMain.removeHandler(IPCChannel.CHAT_SEND_MESSAGE);
  chatService = null;
  console.log("[IPC Chat Handler] Chat IPC handlers unregistered.");
}
