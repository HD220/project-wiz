import { generateText } from "ai";

import { AgentService } from "@/main/features/agent/agent.service";
import type { SelectAgent } from "@/main/features/agent/agent.types";
import type { SelectLlmProvider } from "@/main/features/agent/llm-provider/llm-provider.model";
import { LlmProviderService } from "@/main/features/agent/llm-provider/llm-provider.service";
import { LLMService } from "@/main/features/agent/llm-provider/llm.service";

import { ConversationService } from "./conversation.service";
import { MessageService } from "./message.service";

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
      input.userId,
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
    userId: string,
  ): Promise<string> {
    const modelConfig = JSON.parse(agent.modelConfig);
    const conversationHistory =
      await MessageService.getConversationMessages(conversationId);

    const messages = [
      {
        role: "system" as const,
        content: agent.systemPrompt,
      },
      ...conversationHistory.slice(-10).map((msg) => ({
        role:
          msg.authorId === agent.id
            ? ("assistant" as const)
            : ("user" as const),
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    const model = await LLMService.getModel(
      userId,
      provider.id,
      modelConfig.model,
    );

    const { text } = await generateText({
      model,
      messages,
      temperature: modelConfig.temperature || 0.7,
      maxTokens: modelConfig.maxTokens || 2048,
    });

    return text;
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
