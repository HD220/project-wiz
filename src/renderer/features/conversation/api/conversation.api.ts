import type { IpcResponse } from "@/main/types";

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
    const response: IpcResponse<ConversationWithLastMessage[]> =
      await window.api.conversations.getUserConversations(userId);

    if (!response.success) {
      throw new Error(response.error || "Failed to load conversations");
    }

    return response.data || [];
  }

  static async createConversation(
    input: CreateConversationInput,
  ): Promise<ConversationWithParticipants> {
    const response: IpcResponse<ConversationWithParticipants> =
      await window.api.conversations.create(input);

    if (!response.success) {
      throw new Error(response.error || "Failed to create conversation");
    }

    return response.data!;
  }

  static async getAvailableAgents(): Promise<AuthenticatedUser[]> {
    const response: IpcResponse<any[]> = await window.api.agents.list();

    if (!response.success) {
      throw new Error(response.error || "Failed to load agents");
    }

    return (response.data || []).map(
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
}
