import { TextGenerationService } from "../../llm-provider/application/text-generation.service";
import { findDefaultAgent, findAgentById, findAgentByName } from "../../../domains/agents/functions";

import { ConversationService } from "./conversation.service";
import { MessageService } from "./message.service";

import type { MessageDto } from "../../../../shared/types/message.types";
import type { CoreMessage } from "ai";

export interface ProcessUserMessageRequest {
  conversationId: string;
  userMessage: string;
  userId?: string;
}

export interface ProcessUserMessageResponse {
  userMessage: MessageDto;
  agentMessage: MessageDto;
}

export class AgentConversationService {
  constructor(
    private messageService: MessageService,
    private conversationService: ConversationService,
    private textGenerationService: TextGenerationService,
  ) {}

  async processUserMessage(
    request: ProcessUserMessageRequest,
  ): Promise<ProcessUserMessageResponse> {
    const { conversationId, userMessage, userId = "user" } = request;

    console.log("[AgentConversationService] Processing user message:", {
      conversationId,
      userMessage,
      userId,
    });

    // 1. Save the user message first
    console.log("[AgentConversationService] Saving user message...");
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
      "[AgentConversationService] User message saved:",
      savedUserMessage.id,
    );

    // 2. Get conversation details to identify the agent
    console.log("[AgentConversationService] Getting conversation details...");
    const conversation =
      await this.conversationService.getConversationById(conversationId);
    if (!conversation) {
      throw new Error("Conversa não encontrada");
    }
    console.log(
      "[AgentConversationService] Conversation found, participants:",
      conversation.participants,
    );

    // 3. Extract persona ID from conversation participants (assuming format: ['user', 'personaId'])
    const personaId = conversation.participants.find((p) => p !== userId);
    if (!personaId) {
      throw new Error("Nenhuma persona encontrada na conversa");
    }
    console.log("[AgentConversationService] Persona ID found:", personaId);

    // 4. Get agent by ID or name (for backward compatibility)
    console.log("[AgentConversationService] Getting agent...");
    let agent = await findAgentById(personaId);

    // If not found by ID, try to find by name (for backward compatibility with old conversations)
    if (!agent) {
      console.log(
        "[AgentConversationService] Agent not found by ID, trying by name...",
      );
      agent = await findAgentByName(personaId);
    }

    if (!agent || !agent.isActive) {
      throw new Error("Agente não encontrado ou inativo");
    }
    console.log("[AgentConversationService] Agent found:", {
      id: agent.id,
      agentName: agent.getName(),
    });

    try {
      // 5. Build conversation context for AI
      const conversationHistory =
        await this.buildConversationContext(conversationId);

      // 6. Generate AI response using the text generation service
      // The service will automatically handle fallback to default provider if needed
      const agentResponse = await this.textGenerationService.generateText(
        { llmProviderId: agent.llmProviderId },
        {
          systemPrompt: agent.generateSystemPrompt(),
          messages: [
            ...conversationHistory,
            { role: "user", content: userMessage },
          ],
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
        },
      );

      if (!agentResponse) {
        throw new Error("Falha ao gerar resposta do agente");
      }

      // 7. Save and return the AI message
      const agentMessage = await this.messageService.createMessage({
        content: agentResponse,
        senderId: agent.id, // Use the actual agent ID, not the name
        senderName: agent.getName(),
        senderType: "agent",
        contextType: "direct",
        contextId: conversationId,
        conversationId, // Legacy compatibility
      });

      console.log(
        "[AgentConversationService] Agent response generated and saved successfully",
      );

      return {
        userMessage: savedUserMessage,
        agentMessage,
      };
    } catch (error) {
      console.error("Error generating agent response:", error);

      // Create error message for user feedback
      const errorMessage = await this.messageService.createMessage({
        content: `❌ Erro ao gerar resposta: ${(error as Error).message}`,
        senderId: "system",
        senderName: "Sistema",
        senderType: "system",
        contextType: "direct",
        contextId: conversationId,
        conversationId, // Legacy compatibility
      });

      throw new Error(
        `Falha ao processar mensagem: ${(error as Error).message}`,
      );
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
      // Exclude system messages from context
      const coreMessages: CoreMessage[] = messages
        .reverse()
        .filter((msg) => msg.senderType !== "system")
        .map((msg) => ({
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

  async regenerateLastResponse(conversationId: string): Promise<MessageDto> {
    try {
      // Get the last two messages (user message and agent response)
      const recentMessages = await this.messageService.getConversationMessages(
        conversationId,
        2,
        0,
      );

      if (recentMessages.length < 2) {
        throw new Error("Não há mensagens suficientes para regenerar");
      }

      const [lastMessage, previousMessage] = recentMessages;

      // Ensure we're regenerating an agent message after a user message
      if (
        lastMessage.senderType !== "agent" ||
        previousMessage.senderType !== "user"
      ) {
        throw new Error(
          "Não é possível regenerar: sequência de mensagens inválida",
        );
      }

      // Delete the last agent message
      await this.messageService.deleteMessage(lastMessage.id);

      // Generate new response using the previous user message
      const result = await this.processUserMessage({
        conversationId,
        userMessage: previousMessage.content,
        userId: previousMessage.senderId,
      });

      return result.agentMessage;
    } catch (error) {
      console.error("Error regenerating response:", error);
      throw new Error(
        `Falha ao regenerar resposta: ${(error as Error).message}`,
      );
    }
  }

  async validateAgentForConversation(conversationId: string): Promise<boolean> {
    try {
      const conversation =
        await this.conversationService.getConversationById(conversationId);
      if (!conversation) {
        return false;
      }

      const personaId = conversation.participants.find((p) => p !== "user");
      if (!personaId) {
        return false;
      }

      let agent = await findAgentById(personaId);

      // If not found by ID, try to find by name (for backward compatibility)
      if (!agent) {
        agent = await findAgentByName(personaId);
      }

      if (!agent || !agent.isActive) {
        return false;
      }

      return await this.textGenerationService.validateProvider(
        agent.llmProviderId,
      );
    } catch (error) {
      console.error("Error validating agent for conversation:", error);
      return false;
    }
  }
}
