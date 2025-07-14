import { AgentService } from "../../agent-management/application/agent.service";
import { AIService } from "../../llm-provider/application/ai-service";

import { ConversationService } from "./conversation.service";
import { MessageService } from "./message.service";

import type { MessageDto } from "../../../../shared/types/message.types";
import type { CoreMessage } from "ai";

export class AIMessageService {
  constructor(
    private messageService: MessageService,
    private conversationService: ConversationService,
    private agentService: AgentService,
    private aiService: AIService,
  ) {}

  async processUserMessage(
    conversationId: string,
    userMessage: string,
    userId: string = "user",
  ): Promise<MessageDto | null> {
    try {
      console.log("[AIMessageService] Processing user message:", {
        conversationId,
        userMessage,
        userId,
      });

      // 1. Save the user message first
      console.log("[AIMessageService] Saving user message...");
      const savedUserMessage = await this.messageService.createMessage({
        content: userMessage,
        senderId: userId,
        senderName: "User",
        senderType: "user",
        contextType: "direct",
        contextId: conversationId,
        conversationId, // Legacy compatibility
      });
      console.log(
        "[AIMessageService] User message saved:",
        savedUserMessage.id,
      );

      // 2. Get conversation details to identify the persona
      console.log("[AIMessageService] Getting conversation details...");
      const conversation =
        await this.conversationService.getConversationById(conversationId);
      if (!conversation) {
        console.error(
          "[AIMessageService] Conversation not found:",
          conversationId,
        );
        return null;
      }
      console.log(
        "[AIMessageService] Conversation found, participants:",
        conversation.participants,
      );

      // 3. Extract agent ID from conversation participants (assuming format: ['user', 'agentId'])
      const agentId = conversation.participants.find((p) => p !== userId);
      if (!agentId) {
        console.error(
          "[AIMessageService] No agent found in conversation participants",
        );
        return null;
      }
      console.log("[AIMessageService] Agent ID found:", agentId);

      // 4. Get agent details (try by ID first, then by name for backward compatibility)
      console.log("[AIMessageService] Getting agent details...");
      let agent = await this.agentService.getAgentById(agentId);

      // If not found by ID, try to find by name (for backward compatibility)
      if (!agent) {
        console.log(
          "[AIMessageService] Agent not found by ID, trying by name...",
          agentId,
        );
        agent = await this.agentService.getAgentByName(agentId);
      }

      if (!agent || !agent.isActive) {
        console.error(
          "[AIMessageService] Agent not found or inactive:",
          agentId,
        );
        return null;
      }

      console.log("[AIMessageService] Agent found:", {
        id: agent.id,
        name: agent.name,
        isActive: agent.isActive,
      });

      // 5. Build conversation context for AI
      const conversationHistory =
        await this.buildConversationContext(conversationId);

      // 6. Generate AI response
      const aiResponse = await this.generateAgentResponse(
        agent,
        conversationHistory,
        userMessage,
      );

      if (!aiResponse) {
        console.error("Failed to generate AI response");
        return null;
      }

      // 7. Save and return the AI message
      const aiMessage = await this.messageService.createMessage({
        content: aiResponse,
        senderId: agent.id,
        senderName: agent.name,
        senderType: "agent",
        contextType: "direct",
        contextId: conversationId,
        conversationId, // Legacy compatibility
      });

      return aiMessage;
    } catch (error) {
      console.error("Error processing user message:", error);
      return null;
    }
  }

  private async buildConversationContext(
    conversationId: string,
  ): Promise<CoreMessage[]> {
    try {
      // Get recent messages (last 20 for context)
      const messages = await this.messageService.getConversationMessages(
        conversationId,
        20,
        0,
      );

      // Convert to AI SDK format, reversing to get chronological order
      const coreMessages: CoreMessage[] = messages.reverse().map((msg) => ({
        role:
          msg.senderType === "user"
            ? ("user" as const)
            : ("assistant" as const),
        content: msg.content,
      }));

      return coreMessages;
    } catch (error) {
      console.error("Error building conversation context:", error);
      return [];
    }
  }

  private async generateAgentResponse(
    agent: any,
    conversationHistory: CoreMessage[],
    currentMessage: string,
  ): Promise<string | null> {
    try {
      // Build messages array with system prompt and conversation history
      const messages: CoreMessage[] = [
        ...conversationHistory,
        {
          role: "user",
          content: currentMessage,
        },
      ];

      // Generate response using agent's system prompt and LLM provider
      const stream = await this.aiService.generateResponse(
        {
          providerId: agent.llmProviderId,
          systemPrompt: agent.getSystemPrompt(),
        },
        {
          messages,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
        },
      );

      // Return the response text
      return stream;
    } catch (error) {
      console.error("Error generating agent response:", error);
      return null;
    }
  }

  // Method to regenerate a response (for UI retry functionality)
  async regenerateLastResponse(
    conversationId: string,
  ): Promise<MessageDto | null> {
    try {
      // Get the last two messages (user message and agent response)
      const recentMessages = await this.messageService.getConversationMessages(
        conversationId,
        2,
        0,
      );

      if (recentMessages.length < 2) {
        throw new Error("Not enough messages to regenerate");
      }

      const [lastMessage, previousMessage] = recentMessages;

      // Ensure we're regenerating an agent message after a user message
      if (
        lastMessage.senderType !== "agent" ||
        previousMessage.senderType !== "user"
      ) {
        throw new Error("Cannot regenerate: last message sequence is invalid");
      }

      // Delete the last agent message
      // Note: We would need to add a delete method to MessageService
      // For now, just generate a new response

      return await this.processUserMessage(
        conversationId,
        previousMessage.content,
        previousMessage.senderId,
      );
    } catch (error) {
      console.error("Error regenerating response:", error);
      return null;
    }
  }

  // Method to validate if an agent can process messages
  async validateAgentForMessaging(agentId: string): Promise<boolean> {
    try {
      let agent = await this.agentService.getAgentById(agentId);

      // If not found by ID, try to find by name (for backward compatibility)
      if (!agent) {
        agent = await this.agentService.getAgentByName(agentId);
      }

      if (!agent || !agent.isActive) {
        return false;
      }

      // Check if the agent's LLM provider is available
      const providers = await this.aiService.getAvailableProviders();
      return providers.some((p) => p.id === agent.llmProviderId);
    } catch (error) {
      console.error("Error validating agent for messaging:", error);
      return false;
    }
  }
}
