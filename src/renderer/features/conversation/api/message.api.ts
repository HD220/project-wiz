// ===========================
// MESSAGE API
// ===========================
// Server operations for messages only

import type {
  ConversationWithMessages,
  SendMessageInput,
} from "../types";

// ===========================
// MESSAGE API
// ===========================

export const messageApi = {
  /**
   * Get conversation with all messages
   */
  async getConversationWithMessages(conversationId: string): Promise<ConversationWithMessages | null> {
    try {
      // Get current user first (for auth check)
      const userResponse = await window.api.auth.getCurrentUser();
      if (!userResponse.success || !userResponse.data) {
        throw new Error("User not authenticated");
      }
      
      const userId = (userResponse.data as any).id;
      
      // Get user's conversations to verify access
      const conversationsResponse = await window.api.conversations.getUserConversations(userId);
      if (!conversationsResponse.success) {
        throw new Error("Failed to verify conversation access");
      }
      
      const conversations = conversationsResponse.data as any[];
      const conversation = conversations.find((conv: any) => conv.id === conversationId);
      
      if (!conversation) {
        return null;
      }
      
      // Get messages for this conversation
      const messagesResponse = await window.api.messages.getConversationMessages(conversationId);
      const messages = messagesResponse.success ? (messagesResponse.data as any[]) || [] : [];
      
      return {
        ...conversation,
        messages,
      };
    } catch (error) {
      console.error("Error loading conversation with messages:", error);
      throw error;
    }
  },

  /**
   * Send message to conversation
   */
  async sendMessage(input: SendMessageInput): Promise<any> {
    try {
      const response = await window.api.messages.send(input);
      if (!response.success) {
        throw new Error(response.error || "Failed to send message");
      }
      
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
};