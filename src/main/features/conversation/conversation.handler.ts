import { ipcMain } from "electron";

import { AuthService } from "@/main/features/auth/auth.service";
import { ConversationService } from "@/main/features/conversation/conversation.service";
import type { CreateConversationInput } from "@/main/features/conversation/conversation.service";
import { MessageService } from "@/main/features/conversation/message.service";
import type { SendMessageInput } from "@/main/features/conversation/message.service";
import type { IpcResponse } from "@/main/types";

function setupConversationHandlers(): void {
  ipcMain.handle(
    "conversations:create",
    async (_, input: CreateConversationInput): Promise<IpcResponse> => {
      try {
        // Get session from main process for desktop authentication
        const activeSession = await AuthService.getActiveSession();
        if (!activeSession) {
          throw new Error("User not authenticated");
        }

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
    async (): Promise<IpcResponse> => {
      try {
        // Get session from main process for desktop authentication
        const activeSession = await AuthService.getActiveSession();
        if (!activeSession) {
          throw new Error("User not authenticated");
        }
        const currentUser = activeSession.user;

        const conversations = await ConversationService.getUserConversations(
          currentUser.id,
        );
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
}

function setupMessageHandlers(): void {
  ipcMain.handle(
    "messages:send",
    async (_, input: SendMessageInput): Promise<IpcResponse> => {
      try {
        // Get session from main process for desktop authentication
        const activeSession = await AuthService.getActiveSession();
        if (!activeSession) {
          throw new Error("User not authenticated");
        }

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
        // Get session from main process for desktop authentication
        const activeSession = await AuthService.getActiveSession();
        if (!activeSession) {
          throw new Error("User not authenticated");
        }

        const messages =
          await MessageService.getConversationMessages(conversationId);

        // console.log(messages);

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

export function setupConversationsHandlers(): void {
  setupConversationHandlers();
  setupMessageHandlers();
}
