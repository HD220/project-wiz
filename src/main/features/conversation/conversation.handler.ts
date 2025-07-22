import { ipcMain } from "electron";

import { AuthService } from "@/main/features/auth/auth.service";
import { AgentChatWithMemoryService } from "@/main/features/conversation/agent-chat-with-memory.service";
import { AgentChatService } from "@/main/features/conversation/agent-chat.service";
import type { SendAgentMessageInput } from "@/main/features/conversation/agent-chat.service";
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
        // Authentication check for desktop app
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
}

function setupMessageHandlers(): void {
  ipcMain.handle(
    "messages:send",
    async (_, input: SendMessageInput): Promise<IpcResponse> => {
      try {
        // Authentication check for desktop app
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

function setupAgentChatHandlers(): void {
  ipcMain.handle(
    "agent-chat:sendMessage",
    async (_, input: SendAgentMessageInput): Promise<IpcResponse> => {
      try {
        const response = await AgentChatService.sendMessageToAgent(input);
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to send message to agent",
        };
      }
    },
  );

  ipcMain.handle(
    "agent-chat:getConversation",
    async (_, userId: string, agentId: string): Promise<IpcResponse> => {
      try {
        const data = await AgentChatService.getAgentConversation(
          userId,
          agentId,
        );
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get agent conversation",
        };
      }
    },
  );

  ipcMain.handle(
    "agent-chat:sendMessageWithMemory",
    async (_, input: SendAgentMessageInput): Promise<IpcResponse> => {
      try {
        const response =
          await AgentChatWithMemoryService.sendMessageToAgent(input);
        return { success: true, data: response };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to send message to agent with memory",
        };
      }
    },
  );
}

export function setupConversationsHandlers(): void {
  setupConversationHandlers();
  setupMessageHandlers();
  setupAgentChatHandlers();
}
