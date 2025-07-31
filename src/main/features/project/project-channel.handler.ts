import { AuthService } from "@/main/features/auth/auth.service";
import { messageService } from "@/main/features/message/message.service";
import { createIpcHandler } from "@/main/utils/ipc-handler";

import { projectChannelService } from "./project-channel.service";

import type {
  CreateProjectChannelInput,
  ProjectChannelFilters,
} from "./project-channel.types";

export function setupChannelHandlers(): void {
  // Create project channel
  createIpcHandler(
    "channels:create",
    async (input: CreateProjectChannelInput) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return projectChannelService.createChannel(input);
    },
  );

  // Get project channels
  createIpcHandler(
    "channels:getProjectChannels",
    async (projectId: string, filters?: ProjectChannelFilters) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return projectChannelService.getProjectChannels(projectId, filters || {});
    },
  );

  // Get channel by ID
  createIpcHandler("channels:findById", async (channelId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return projectChannelService.findById(channelId);
  });

  // Update channel
  createIpcHandler(
    "channels:update",
    async (
      channelId: string,
      updates: { name?: string; description?: string },
    ) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return projectChannelService.updateChannel(channelId, updates);
    },
  );

  // Archive channel
  createIpcHandler("channels:archive", async (channelId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return projectChannelService.archiveChannel(channelId, currentUser.id);
  });

  // Unarchive channel
  createIpcHandler("channels:unarchive", async (channelId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return projectChannelService.unarchiveChannel(channelId);
  });

  // Send message to channel
  createIpcHandler(
    "channels:sendMessage",
    async (channelId: string, content: string) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return messageService.sendToChannel(channelId, currentUser.id, content);
    },
  );

  // Get channel messages
  createIpcHandler("channels:getMessages", async (channelId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return messageService.getChannelMessages(channelId);
  });

  // Delete channel (soft delete)
  createIpcHandler("channels:delete", async (channelId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return projectChannelService.deleteChannel(channelId, currentUser.id);
  });

}
