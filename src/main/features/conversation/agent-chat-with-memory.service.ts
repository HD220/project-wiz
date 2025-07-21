import { generateText } from "ai";

import { AgentService } from "@/main/features/agent/agent.service";
import type { SelectAgent } from "@/main/features/agent/agent.types";
import { LlmProviderService } from "@/main/features/agent/llm-provider/llm-provider.service";
import type { SelectLlmProvider } from "@/main/features/agent/llm-provider/llm-provider.model";
import { LLMService } from "@/main/features/agent/llm-provider/llm.service";
import { AgentMemoryService } from "@/main/features/agent/memory/memory.service";
import type { MemoryContextWindow } from "@/main/features/agent/memory/memory.types";

import { ConversationService } from "./conversation.service";
import { MessageService } from "./message.service";

export interface SendAgentMessageInput {
  agentId: string;
  userId: string;
  content: string;
}

export interface AgentResponseWithMemory {
  content: string;
  conversationId: string;
  userMessageId: string;
  agentMessageId: string;
  memoriesCreated: string[];
  memoryContext: MemoryContextWindow;
}

/**
 * Simplified agent chat service following YAGNI principle.
 * Focuses on core chat functionality with basic memory logging.
 */
export class AgentChatWithMemoryService {
  static async sendMessageToAgent(
    input: SendAgentMessageInput,
  ): Promise<AgentResponseWithMemory> {
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

    // Get relevant memories for context
    const relevantMemories = await AgentMemoryService.search({
      agentId: input.agentId,
      userId: input.userId,
      query: input.content,
      limit: 5,
    });

    const memoryContext: MemoryContextWindow = {
      conversationMemories: [],
      relevantMemories,
      userPreferences: [],
      recentLearnings: [],
    };

    const userMessage = await MessageService.send({
      conversationId: conversation.id,
      authorId: input.userId,
      content: input.content,
    });

    const agentResponse = await this.generateAgentResponse(
      agent,
      provider,
      input.content,
      memoryContext,
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
          memoryContextUsed: memoryContext.relevantMemories.length > 0,
          relevantMemoriesCount: memoryContext.relevantMemories.length,
        }),
      },
    });

    // Simple conversation logging - create single memory record
    const memoriesCreated = await this.createConversationMemory(
      input.agentId,
      input.userId,
      conversation.id,
      input.content,
      agentResponse,
    );

    return {
      content: agentResponse,
      conversationId: conversation.id,
      userMessageId: userMessage.id,
      agentMessageId: agentMessage.id,
      memoriesCreated,
      memoryContext,
    };
  }

  /**
   * Generate agent response using dynamic provider registry
   */
  private static async generateAgentResponse(
    agent: SelectAgent,
    provider: SelectLlmProvider,
    userMessage: string,
    memoryContext: MemoryContextWindow,
  ): Promise<string> {
    const modelConfig = JSON.parse(agent.modelConfig);

    const model = await LLMService.getModel(
      agent.userId || "",
      provider.id,
      modelConfig.model,
    );

    const memoryPrompt = this.buildMemoryPrompt(memoryContext);
    const systemPrompt = `${agent.systemPrompt}${memoryPrompt}`;

    const { text } = await generateText({
      model,
      prompt: userMessage,
      system: systemPrompt,
      temperature: modelConfig.temperature || 0.7,
      maxTokens: modelConfig.maxTokens || 1000,
    });

    return text;
  }

  /**
   * Build memory context prompt
   */
  private static buildMemoryPrompt(context: MemoryContextWindow): string {
    if (context.relevantMemories.length === 0) {
      return "";
    }

    const memoryEntries = context.relevantMemories
      .map((item) => `- ${item.memory.summary}: ${item.memory.content}`)
      .join("\n");

    return `\n\nRELEVANT CONTEXT:\n${memoryEntries}`;
  }

  /**
   * Create simple conversation memory record
   */
  private static async createConversationMemory(
    agentId: string,
    userId: string,
    conversationId: string,
    userMessage: string,
    agentResponse: string,
  ): Promise<string[]> {
    const memory = await AgentMemoryService.create({
      agentId,
      userId,
      conversationId,
      content: `User: ${userMessage}\nAgent: ${agentResponse}`,
      summary: `Conversation about: ${userMessage.substring(0, 50)}${userMessage.length > 50 ? "..." : ""}`,
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
}
