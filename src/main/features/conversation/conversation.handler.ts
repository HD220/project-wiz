import { AuthService } from "@/main/features/auth/auth.service";
import { ConversationService } from "@/main/features/conversation/conversation.service";
import type { CreateConversationInput } from "@/main/features/conversation/conversation.service";
import { MessageService } from "@/main/features/conversation/message.service";
import type { SendMessageInput } from "@/main/features/conversation/message.service";
import { createIpcHandler } from "@/main/utils/ipc-handler";

export function setupConversationsHandlers(): void {
  // Create conversation (with session-based auth)
  createIpcHandler(
    "conversations:create",
    async (input: CreateConversationInput) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return ConversationService.create(input);
    },
  );

  // Get user conversations with archiving support (with session-based auth)
  createIpcHandler(
    "conversations:getUserConversations",
    async (options?: {
      includeInactive?: boolean;
      includeArchived?: boolean;
    }) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return ConversationService.getUserConversations(
        currentUser.id,
        options || {},
      );
    },
  );

  // Archive conversation (with session-based auth)
  createIpcHandler("conversations:archive", async (conversationId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return ConversationService.archive(conversationId, currentUser.id);
  });

  // Unarchive conversation (with session-based auth)
  createIpcHandler(
    "conversations:unarchive",
    async (conversationId: string) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return ConversationService.unarchive(conversationId);
    },
  );

  // Check if conversation is blocked (with session-based auth)
  createIpcHandler(
    "conversations:isBlocked",
    async (conversationId: string) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return ConversationService.isConversationBlocked(conversationId);
    },
  );

  // Send message (with session-based auth)
  createIpcHandler("messages:send", async (input: SendMessageInput) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return MessageService.send(input);
  });

  // Get conversation messages (with session-based auth)
  createIpcHandler(
    "messages:getConversationMessages",
    async (conversationId: string) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return MessageService.getConversationMessages(conversationId);
    },
  );

  // Regenerate missing conversation titles (with session-based auth)
  createIpcHandler("conversations:regenerateTitles", async () => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return ConversationService.regenerateMissingTitles();
  });
}
