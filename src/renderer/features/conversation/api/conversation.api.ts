import type {
  ConversationWithLastMessage,
  ConversationWithParticipants,
  CreateConversationInput,
  AuthenticatedUser,
} from "@/renderer/features/conversation/types";

export class ConversationAPI {
  static async getUserConversations(
    userId: string,
  ): Promise<ConversationWithLastMessage[]> {
    const response =
      await window.api.conversations.getUserConversations(userId);

    if (!response.success) {
      throw new Error(response.error || "Failed to load conversations");
    }

    return response.data || [];
  }

  static async createConversation(
    input: CreateConversationInput,
  ): Promise<ConversationWithParticipants> {
    const response = await window.api.conversations.create(input);

    if (!response.success) {
      throw new Error(response.error || "Failed to create conversation");
    }

    return response.data!;
  }

  static async getAvailableAgents(): Promise<AuthenticatedUser[]> {
    const response = await window.api.agents.list();

    if (!response.success) {
      throw new Error(response.error || "Failed to load agents");
    }

    const agents = response.data || [];
    return agents.map(
      (agent: any): AuthenticatedUser => ({
        id: agent.userId,
        name: agent.name,
        avatar: null,
        type: "agent" as const,
        createdAt: new Date(agent.createdAt),
        updatedAt: new Date(agent.updatedAt),
      }),
    );
  }

  static async getAvailableUsers(): Promise<AuthenticatedUser[]> {
    // For now, return available agents as "users" since conversations are typically with agents
    // TODO: Implement proper user listing if needed for human-to-human conversations
    return this.getAvailableAgents();
  }
}
