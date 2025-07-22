import { generateText } from "ai";

import { AI_DEFAULTS } from "@/main/constants/ai-defaults";
import { AgentService } from "@/main/features/agent/agent.service";
import type { SelectAgent } from "@/main/features/agent/agent.types";
import type { SelectLlmProvider } from "@/main/features/agent/llm-provider/llm-provider.model";
import { LlmProviderService } from "@/main/features/agent/llm-provider/llm-provider.service";
import { LLMService } from "@/main/features/agent/llm-provider/llm.service";
import { SimplifiedMemoryService } from "@/main/features/agent/memory/memory.service";

import { ConversationService } from "./conversation.service";
import { MessageService } from "./message.service";

export interface SendAgentMessageInput {
  agentId: string;
  userId: string;
  content: string;
  useMemory?: boolean;
}

export interface AgentResponse {
  content: string;
  conversationId: string;
  userMessageId: string;
  agentMessageId: string;
  memoriesCreated?: string[];
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

    const agentResponse = await this.generateResponse(
      agent,
      provider,
      input.content,
      conversation.id,
      input.userId,
      input.useMemory || false,
    );

    const agentMessage = await MessageService.sendWithLlmData({
      messageInput: {
        conversationId: conversation.id,
        authorId: agent.id,
        content: agentResponse.content,
      },
      llmData: {
        role: "assistant",
        metadata: JSON.stringify({
          model: JSON.parse(agent.modelConfig).model,
          provider: provider.type,
          memoryUsed: input.useMemory || false,
        }),
      },
    });

    let memoriesCreated: string[] = [];
    if (input.useMemory) {
      memoriesCreated = await this.createConversationMemory(
        input.agentId,
        input.userId,
        conversation.id,
        input.content,
        agentResponse.content,
      );
    }

    return {
      content: agentResponse.content,
      conversationId: conversation.id,
      userMessageId: userMessage.id,
      agentMessageId: agentMessage.id,
      memoriesCreated: memoriesCreated.length > 0 ? memoriesCreated : undefined,
    };
  }

  private static async generateResponse(
    agent: SelectAgent,
    provider: SelectLlmProvider,
    userMessage: string,
    conversationId: string,
    userId: string,
    useMemory: boolean,
  ): Promise<{ content: string }> {
    const modelConfig = JSON.parse(agent.modelConfig);
    const conversationHistory =
      await MessageService.getConversationMessages(conversationId);

    let systemPrompt = agent.systemPrompt;

    // Add memory context if enabled
    if (useMemory) {
      const relevantMemories = await SimplifiedMemoryService.retrieve(
        agent.id,
        5,
      );
      if (relevantMemories.length > 0) {
        const memoryContext = relevantMemories
          .map((memory) => `- ${memory.summary}: ${memory.content}`)
          .join("\n");
        systemPrompt += `\n\nRELEVANT CONTEXT:\n${memoryContext}`;
      }
    }

    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      ...conversationHistory
        .slice(-AI_DEFAULTS.MAX_CONVERSATION_HISTORY)
        .map((msg) => ({
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
      temperature: modelConfig.temperature || AI_DEFAULTS.TEMPERATURE,
      maxTokens: modelConfig.maxTokens || AI_DEFAULTS.MAX_TOKENS,
    });

    return { content: text };
  }

  private static async createConversationMemory(
    agentId: string,
    userId: string,
    conversationId: string,
    userMessage: string,
    agentResponse: string,
  ): Promise<string[]> {
    const memory = await SimplifiedMemoryService.store({
      agentId,
      userId,
      conversationId,
      content: `User: ${userMessage}\nAgent: ${agentResponse}`,
      summary: `Conversation: ${userMessage.substring(0, 50)}${userMessage.length > 50 ? "..." : ""}`,
      type: "conversation",
      importance: "medium",
      keywords: JSON.stringify([]),
      metadata: JSON.stringify({
        timestamp: new Date().toISOString(),
        interaction: true,
      }),
    });

    return [memory.id];
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
