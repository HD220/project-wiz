// ===========================
// CONVERSATION API
// ===========================
// Server operations for conversations only

import type {
  ConversationWithLastMessage,
  ConversationWithParticipants,
  CreateConversationInput,
  AuthenticatedUser,
} from "../types";

// ===========================
// AGENT CONVERSION HELPER
// ===========================

function agentToAuthenticatedUser(agent: any): AuthenticatedUser {
  return {
    id: agent.userId,
    name: agent.name,
    avatar: null,
    type: "agent" as const,
    createdAt: new Date(agent.createdAt),
    updatedAt: new Date(agent.updatedAt),
  };
}

async function getAllAgents(): Promise<AuthenticatedUser[]> {
  try {
    const response = await window.api.agents.list();
    if (!response.success) {
      throw new Error(response.error || "Failed to load agents");
    }
    const agents = response.data as any[];
    return agents.map(agentToAuthenticatedUser);
  } catch (error) {
    console.error("Error loading agents:", error);
    return [];
  }
}

// ===========================
// CONVERSATION API
// ===========================

export const conversationApi = {
  /**
   * Get all conversations for current user with last message
   */
  async getUserConversations(
    sessionToken: string,
  ): Promise<ConversationWithLastMessage[]> {
    try {
      // Get current user
      const userResponse = await window.api.auth.getCurrentUser(sessionToken);
      if (!userResponse.success || !userResponse.data) {
        throw new Error("User not authenticated");
      }

      const userId = (userResponse.data as any).id;

      // Get conversations
      const response =
        await window.api.conversations.getUserConversations(userId);
      if (!response.success) {
        throw new Error(response.error || "Failed to load conversations");
      }

      return (response.data as ConversationWithLastMessage[]) || [];
    } catch (error) {
      console.error("Error loading conversations:", error);
      throw error;
    }
  },

  /**
   * Create new conversation
   */
  async createConversation(
    participantIds: string[],
    sessionToken: string,
  ): Promise<ConversationWithParticipants> {
    try {
      // Get current user
      const userResponse = await window.api.auth.getCurrentUser(sessionToken);
      if (!userResponse.success || !userResponse.data) {
        throw new Error("User not authenticated");
      }

      const currentUserId = (userResponse.data as any).id;

      // Determine conversation name
      let conversationName = "New Conversation";
      if (participantIds.length === 1) {
        const agents = await getAllAgents();
        const otherUser = agents.find((user) => user.id === participantIds[0]);
        conversationName = otherUser?.name || "Unknown Agent";
      } else if (participantIds.length > 1) {
        conversationName = `Grupo ${participantIds.length + 1} agentes`;
      }

      const createInput: CreateConversationInput = {
        name: conversationName,
        description: null,
        type: "dm",
        agentId: null,
        participantIds: [currentUserId, ...participantIds],
      };

      const response = await window.api.conversations.create(createInput);
      if (!response.success) {
        throw new Error(response.error || "Failed to create conversation");
      }

      return response.data as ConversationWithParticipants;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  },

  /**
   * Get available users for creating conversations (agents only)
   */
  async getAvailableUsers(): Promise<AuthenticatedUser[]> {
    return await getAllAgents();
  },
};
