import type {
  ConversationWithParticipants,
  ConversationWithMessagesAndParticipants,
  AuthenticatedUser,
  MessageWithLlmData,
  CreateConversationInput,
  SendMessageInput,
} from "./conversation.types";

// Function to convert agents to AuthenticatedUser format
function agentToAuthenticatedUser(agent: any): AuthenticatedUser {
  return {
    id: agent.userId, // Use the userId from agent as the user ID
    name: agent.name,
    avatar: null, // Agents don't have avatars for now
    type: "agent" as const,
    createdAt: new Date(agent.createdAt),
    updatedAt: new Date(agent.updatedAt),
  };
}

// Helper function to get all agents
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


export const conversationApi = {
  // Get all DM conversations for current user
  getUserConversations: async (): Promise<ConversationWithParticipants[]> => {
    try {
      // Get current user from auth store
      const response = await window.api.auth.getCurrentUser();
      if (!response.success || !response.data) {
        throw new Error("User not authenticated");
      }
      
      const userId = (response.data as any).id;
      const conversationsResponse = await window.api.conversations.getUserConversations(userId);
      
      if (!conversationsResponse.success) {
        throw new Error(conversationsResponse.error || "Failed to load conversations");
      }
      
      return (conversationsResponse.data as ConversationWithParticipants[]) || [];
    } catch (error) {
      console.error("Error loading conversations:", error);
      return [];
    }
  },

  // Get specific conversation with messages
  getConversationWithMessages: async (conversationId: string): Promise<ConversationWithMessagesAndParticipants | null> => {
    try {
      // First get the conversation from getUserConversations
      const conversations = await conversationApi.getUserConversations();
      const conversation = conversations.find(conv => conv.id === conversationId);
      
      if (!conversation) {
        return null;
      }
      
      // Then get messages for this conversation
      const messagesResponse = await window.api.messages.getConversationMessages(conversationId);
      
      const messages = messagesResponse.success ? ((messagesResponse.data as MessageWithLlmData[]) || []) : [];
      
      return {
        ...conversation,
        messages,
      };
    } catch (error) {
      console.error("Error loading conversation with messages:", error);
      return null;
    }
  },

  // Get available users for creating conversations
  getAvailableUsers: async (): Promise<AuthenticatedUser[]> => {
    return await getAllAgents();
  },

  // Create new conversation
  createConversation: async (participantIds: string[]): Promise<ConversationWithParticipants> => {
    try {
      // Get current user
      const userResponse = await window.api.auth.getCurrentUser();
      if (!userResponse.success || !userResponse.data) {
        throw new Error("User not authenticated");
      }
      
      const currentUserId = (userResponse.data as any).id;
      
      // Determine conversation name based on participants
      let conversationName = "New Conversation";
      if (participantIds.length === 1) {
        // 1:1 conversation - use other participant's name
        const agents = await getAllAgents();
        const otherUser = agents.find(user => user.id === participantIds[0]);
        conversationName = otherUser?.name || "Unknown Agent";
      } else if (participantIds.length > 1) {
        // Group conversation - create generic name (could be customizable)
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

  // Send message to conversation
  sendMessage: async (input: SendMessageInput): Promise<MessageWithLlmData> => {
    try {
      const response = await window.api.messages.send(input);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to send message");
      }
      
      return response.data as MessageWithLlmData;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Get user by ID (helper function)
  getUserById: async (userId: string): Promise<AuthenticatedUser | null> => {
    const agents = await getAllAgents();
    return agents.find(user => user.id === userId) || null;
  },
};