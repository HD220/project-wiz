import { ChannelMessageService } from "./channel-message.service";
import { AIService } from "../../llm-provider/application/ai-service";
import type { CoreMessage } from "ai";
import type { ChannelMessage } from "../domain/channel-message.entity";

interface AIChatConfig {
  channelId: string;
  llmProviderId: string;
  systemPrompt?: string;
  authorId: string;
  authorName: string;
}

interface SendMessageOptions {
  temperature?: number;
  maxTokens?: number;
  includeHistory?: boolean;
  historyLimit?: number;
  aiName?: string;
}

export class AIChatService {
  constructor(
    private channelMessageService: ChannelMessageService,
    private aiService: AIService,
  ) {}

  async sendUserMessage(
    content: string,
    config: AIChatConfig,
    options: SendMessageOptions = {},
  ): Promise<{ userMessage: ChannelMessage; aiMessage: ChannelMessage }> {
    const {
      temperature = 0.7,
      maxTokens = 1000,
      includeHistory = true,
      historyLimit = 10,
      aiName,
    } = options;

    // Create and save user message
    const userMessage = await this.channelMessageService.createTextMessage(
      content,
      config.channelId,
      config.authorId,
      config.authorName,
    );

    try {
      // Prepare conversation context
      const messages: CoreMessage[] = [];

      if (includeHistory) {
        // Get recent message history for context
        const recentMessages =
          await this.channelMessageService.getLatestMessages(
            config.channelId,
            historyLimit,
          );

        // Convert to CoreMessage format (exclude system messages from history)
        const historyMessages = recentMessages
          .filter((msg) => msg.type !== "system")
          .slice(-historyLimit) // Ensure we don't exceed limit
          .map((msg) => ({
            role:
              msg.authorId === "ai"
                ? ("assistant" as const)
                : ("user" as const),
            content: msg.content,
          }));

        messages.push(...historyMessages);
      }

      // Add current user message if not already in history
      if (
        !includeHistory ||
        messages.length === 0 ||
        messages[messages.length - 1]?.content !== content
      ) {
        messages.push({
          role: "user",
          content,
        });
      }

      // Generate AI response
      const aiResponse = await this.aiService.generateResponse(
        {
          providerId: config.llmProviderId,
          systemPrompt: config.systemPrompt,
        },
        {
          messages,
          temperature,
          maxTokens,
        },
      );

      // Create and save AI message
      const aiMessage = await this.channelMessageService.createTextMessage(
        aiResponse,
        config.channelId,
        "ai",
        aiName || "AI Assistant",
      );

      return {
        userMessage,
        aiMessage,
      };
    } catch (error) {
      // Log error and create error message
      console.error("Failed to generate AI response:", error);

      const errorMessage = await this.channelMessageService.createSystemMessage(
        `❌ Falha ao gerar resposta da IA: ${(error as Error).message}`,
        config.channelId,
        {
          error: true,
          originalUserMessageId: userMessage.id,
          llmProviderId: config.llmProviderId,
        },
      );

      throw new Error(`AI response failed: ${(error as Error).message}`);
    }
  }

  async regenerateLastAIMessage(
    config: AIChatConfig,
    options: SendMessageOptions = {},
  ): Promise<ChannelMessage> {
    // Get the last two messages (should be user + AI)
    const recentMessages = await this.channelMessageService.getLatestMessages(
      config.channelId,
      2,
    );

    if (recentMessages.length < 2) {
      throw new Error("Não há mensagens suficientes para regenerar");
    }

    const [userMessage, aiMessage] = recentMessages;

    // Validate that the last message is from AI
    if (aiMessage.authorId !== "ai") {
      throw new Error("A última mensagem não é da IA");
    }

    // Validate that the second-to-last is from user
    if (userMessage.authorId === "ai" || userMessage.type === "system") {
      throw new Error(
        "Não foi possível encontrar a mensagem do usuário para regenerar",
      );
    }

    try {
      // Delete the old AI message
      await this.channelMessageService.deleteMessage(aiMessage.id);

      // Regenerate response using the user's message
      const result = await this.sendUserMessage(
        userMessage.content,
        {
          ...config,
          authorId: userMessage.authorId,
          authorName: userMessage.authorName,
        },
        {
          ...options,
          includeHistory: true,
          historyLimit: 8, // Reduced limit since we're regenerating
        },
      );

      return result.aiMessage;
    } catch (error) {
      console.error("Failed to regenerate AI message:", error);
      throw new Error(
        `Falha ao regenerar mensagem: ${(error as Error).message}`,
      );
    }
  }

  async validateAIProvider(llmProviderId: string): Promise<boolean> {
    try {
      return await this.aiService.validateProvider(llmProviderId);
    } catch (error) {
      console.error(`Failed to validate AI provider ${llmProviderId}:`, error);
      return false;
    }
  }

  async getConversationSummary(
    channelId: string,
    messageLimit: number = 20,
  ): Promise<string> {
    try {
      const messages = await this.channelMessageService.getLatestMessages(
        channelId,
        messageLimit,
      );

      if (messages.length === 0) {
        return "Nenhuma conversa encontrada neste canal.";
      }

      // Format messages for summary
      const formattedMessages = messages
        .filter((msg) => msg.type !== "system") // Exclude system messages
        .map((msg) => `${msg.authorName}: ${msg.content}`)
        .join("\n");

      return formattedMessages;
    } catch (error) {
      console.error("Failed to get conversation summary:", error);
      throw new Error(
        `Falha ao obter resumo da conversa: ${(error as Error).message}`,
      );
    }
  }

  async clearAIMessages(channelId: string): Promise<number> {
    try {
      const allMessages = await this.channelMessageService.listMessages({
        channelId,
      });

      const aiMessages = allMessages.filter((msg) => msg.authorId === "ai");

      let deletedCount = 0;
      for (const message of aiMessages) {
        try {
          await this.channelMessageService.deleteMessage(message.id);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete AI message ${message.id}:`, error);
        }
      }

      return deletedCount;
    } catch (error) {
      console.error("Failed to clear AI messages:", error);
      throw new Error(
        `Falha ao limpar mensagens da IA: ${(error as Error).message}`,
      );
    }
  }
}
