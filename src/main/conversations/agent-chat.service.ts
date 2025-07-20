import { openai } from "@ai-sdk/openai";
import { deepseek } from "@ai-sdk/deepseek";
import { generateText } from "ai";

import { AgentService } from "@/main/agents/agent.service";
import { LlmProviderService } from "@/main/agents/llm-providers/llm-provider.service";

import { ConversationService } from "./conversation.service";
import { MessageService } from "./message.service";

import type { SelectAgent } from "@/main/agents/agents.schema";
import type { SelectLlmProvider } from "@/main/agents/llm-providers/llm-providers.schema";

export interface SendAgentMessageInput {
  agentId: string;
  userId: string;
  content: string;
}

export interface AgentResponse {
  content: string;
  conversationId: string;
  userMessageId: string;
  agentMessageId: string;
}

export class AgentChatService {
  static async sendMessageToAgent(
    input: SendAgentMessageInput,
  ): Promise<AgentResponse> {
    const agent = await AgentService.findById(input.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    const provider = await LlmProviderService.findById(agent.providerId);
    if (!provider) {
      throw new Error("LLM Provider not found");
    }

    const conversation = await ConversationService.getOrCreateAgentConversation(
      input.userId,
      input.agentId,
    );

    const userMessage = await MessageService.send({
      conversationId: conversation.id,
      authorId: input.userId,
      content: input.content,
    });

    const agentResponse = await this.generateAgentResponse(
      agent,
      provider,
      input.content,
      conversation.id,
    );

    const agentMessage = await MessageService.sendWithLlmData({
      messageInput: {
        conversationId: conversation.id,
        authorId: agent.id,
        content: agentResponse,
      },
      llmData: {
        role: "assistant",
        metadata: JSON.stringify({
          model: JSON.parse(agent.modelConfig).model,
          provider: provider.type,
        }),
      },
    });

    return {
      content: agentResponse,
      conversationId: conversation.id,
      userMessageId: userMessage.id,
      agentMessageId: agentMessage.id,
    };
  }

  static async generateAgentResponse(
    agent: SelectAgent,
    provider: SelectLlmProvider,
    userMessage: string,
    conversationId: string,
  ): Promise<string> {
    const modelConfig = JSON.parse(agent.modelConfig);
    const conversationHistory = await MessageService.getConversationMessages(
      conversationId,
    );

    const messages = [
      {
        role: "system" as const,
        content: agent.systemPrompt,
      },
      ...conversationHistory
        .slice(-10)
        .map((msg) => ({
          role: msg.authorId === agent.id ? ("assistant" as const) : ("user" as const),
          content: msg.content,
        })),
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    try {
      let model;
      
      switch (provider.type) {
        case "openai":
          model = openai(modelConfig.model || "gpt-4o-mini");
          break;
        case "deepseek":
          model = deepseek(modelConfig.model || "deepseek-chat");
          break;
        default:
          throw new Error(`Unsupported provider type: ${provider.type}`);
      }

      const { text } = await generateText({
        model,
        messages,
        temperature: modelConfig.temperature || 0.7,
        maxTokens: modelConfig.maxTokens || 2048,
      });

      return text;
    } catch (error) {
      console.error("Error generating agent response:", error);
      throw new Error(
        `Failed to generate response: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  static async getAgentConversation(userId: string, agentId: string) {
    const conversation = await ConversationService.getOrCreateAgentConversation(
      userId,
      agentId,
    );

    const messages = await MessageService.getConversationMessages(
      conversation.id,
    );

    return {
      conversation,
      messages,
    };
  }
}