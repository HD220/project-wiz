import { AuthService } from "@/main/features/auth/auth.service";
import { messageService } from "@/main/features/message/message.service";
import { llmMessageProcessorService } from "@/main/features/llm-jobs/llm-message-processor.service";
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

  // Process user message with LLM (submit job instead of direct API call)
  createIpcHandler("channels:processMessage", async (channelId: string, content: string, options?: {
    systemPrompt?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    priority?: number;
  }) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmMessageProcessorService.processUserMessage(
      currentUser.id,
      "channel",
      channelId,
      content,
      options
    );
  });

  // Trigger agent response in channel
  createIpcHandler("channels:triggerAgentResponse", async (channelId: string, triggerMessageId: string, agentId?: string, options?: {
    priority?: number;
    customInstruction?: string;
  }) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // If no specific agent provided, find an active agent for this conversation
    let targetAgentId = agentId;
    if (!targetAgentId) {
      const foundAgentId = await llmMessageProcessorService.getActiveAgentForConversation("channel", channelId);
      if (!foundAgentId) {
        throw new Error("No active agent available for this channel");
      }
      targetAgentId = foundAgentId;
    }

    return llmMessageProcessorService.processAgentMessage(
      targetAgentId,
      "channel",
      channelId,
      triggerMessageId,
      options
    );
  });
}
