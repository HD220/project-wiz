import { ipcMain } from "electron";

import type { IpcResponse } from "@/main/types";

import { ConversationService } from "./conversation.service";
import { MessageService } from "./message.service";

import type { CreateConversationInput } from "./conversation.service";
import type { SendMessageInput } from "./message.service";

export function setupConversationsHandlers(): void {
  ipcMain.handle(
    "conversations:create",
    async (_, input: CreateConversationInput): Promise<IpcResponse> => {
      try {
        const conversation = await ConversationService.create(input);
        return { success: true, data: conversation };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create conversation",
        };
      }
    },
  );

  ipcMain.handle(
    "conversations:getUserConversations",
    async (_, userId: string): Promise<IpcResponse> => {
      try {
        const conversations =
          await ConversationService.getUserConversations(userId);
        return { success: true, data: conversations };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get conversations",
        };
      }
    },
  );

  ipcMain.handle(
    "messages:send",
    async (_, input: SendMessageInput): Promise<IpcResponse> => {
      try {
        const message = await MessageService.send(input);
        return { success: true, data: message };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to send message",
        };
      }
    },
  );

  ipcMain.handle(
    "messages:getConversationMessages",
    async (_, conversationId: string): Promise<IpcResponse> => {
      try {
        const messages =
          await MessageService.getConversationMessages(conversationId);
        return { success: true, data: messages };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to get messages",
        };
      }
    },
  );
}
