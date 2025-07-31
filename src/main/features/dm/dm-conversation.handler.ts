import { AuthService } from "@/main/features/auth/auth.service";
import { messageService } from "@/main/features/message/message.service";
import { createIpcHandler } from "@/main/utils/ipc-handler";

import { dmConversationService } from "./dm-conversation.service";

import type {
  CreateDMConversationInput,
  DMConversationFilters,
} from "./dm-conversation.types";

export function setupDMHandlers(): void {
  // Create DM conversation
  createIpcHandler("dm:create", async (input: CreateDMConversationInput) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return dmConversationService.create({
      ...input,
      currentUserId: currentUser.id,
    });
  });

  // Get user DM conversations
  createIpcHandler(
    "dm:getUserConversations",
    async (filters?: DMConversationFilters) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return dmConversationService.getUserDMConversations(
        currentUser.id,
        filters || {},
      );
    },
  );

  // Get DM conversation by ID
  createIpcHandler("dm:findById", async (dmId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return dmConversationService.findById(dmId);
  });

  // Archive DM conversation
  createIpcHandler("dm:archive", async (dmId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return dmConversationService.archive(dmId, currentUser.id);
  });

  // Unarchive DM conversation
  createIpcHandler("dm:unarchive", async (dmId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return dmConversationService.unarchive(dmId);
  });

  // Send message to DM
  createIpcHandler("dm:sendMessage", async (dmId: string, content: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return messageService.sendToDM(dmId, currentUser.id, content);
  });

  // Get DM messages
  createIpcHandler("dm:getMessages", async (dmId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return messageService.getDMMessages(dmId);
  });

  // Add participant to DM
  createIpcHandler(
    "dm:addParticipant",
    async (dmId: string, participantId: string) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return dmConversationService.addParticipant(dmId, participantId);
    },
  );

  // Remove participant from DM
  createIpcHandler(
    "dm:removeParticipant",
    async (dmId: string, participantId: string) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return dmConversationService.removeParticipant(
        dmId,
        participantId,
        currentUser.id,
      );
    },
  );

  // Delete DM conversation (soft delete)
  createIpcHandler("dm:delete", async (dmId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return dmConversationService.softDelete(dmId, currentUser.id);
  });
}
