import { ipcMain, IpcMainInvokeEvent } from "electron";

import {
  IChatService,
} from "@/core/application/ports/services/chat.service.port";

import {
  IPC_CHANNELS
} from "@/shared/ipc-channels.constants";
import {
  ChatSendMessagePayload,
  ChatStreamEventPayload,
} from "@/shared/ipc-chat.types";

let internalChatService: IChatService | null = null;

// Removed initializeChatService as service is now injected.

export function registerChatIPCHandlers(chatServiceInstance: IChatService): void {
  if (!chatServiceInstance) {
    console.error("[IPC Chat Handler] CRITICAL: Provided chatServiceInstance is null or undefined.");
    // Optionally, throw an error or handle this case more gracefully
    // For now, internalChatService will remain null, and handlers will fail.
  }
  internalChatService = chatServiceInstance;

  ipcMain.handle(IPC_CHANNELS.CHAT_SEND_MESSAGE, handleChatSendMessage);

  console.log("[IPC Chat Handler] Chat IPC handlers registered.");
}

async function handleChatSendMessage(
  event: IpcMainInvokeEvent,
  payload: ChatSendMessagePayload
) {
  console.log(
    `[IPC Chat Handler] Received ${IPC_CHANNELS.CHAT_SEND_MESSAGE}`
  );

  if (!internalChatService) {
    console.error(
      "[IPC Chat Handler] ChatService not available. It might not have been initialized correctly or passed to registerChatIPCHandlers."
    );
    const errorEvent: ChatStreamEventPayload = {
      type: "error",
      error: {
        name: "ServiceError",
        message: "ChatService not available in main process.",
      },
    };
    if (!event.sender.isDestroyed()) {
      event.sender.send(IPC_CHANNELS.CHAT_STREAM_EVENT, errorEvent);
    }
    const endEvent: ChatStreamEventPayload = { type: "end" };
    if (!event.sender.isDestroyed()) {
      event.sender.send(IPC_CHANNELS.CHAT_STREAM_EVENT, endEvent);
    }
    return {
      success: false,
      error: { message: "ChatService not available." },
    };
  }

  const sendStreamEventCallback = (
    streamPayload: ChatStreamEventPayload
  ) => {
    if (!event.sender.isDestroyed()) {
      event.sender.send(IPC_CHANNELS.CHAT_STREAM_EVENT, streamPayload);
    }
  };

  const result = await internalChatService.handleSendMessageStream(
    payload,
    sendStreamEventCallback
  );

  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: { message: result.error!.message, name: result.error!.name },
  };
}

export function unregisterChatIPCHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.CHAT_SEND_MESSAGE);
  // Clear the internal reference
  internalChatService = null;
  console.log("[IPC Chat Handler] Chat IPC handlers unregistered.");
}
