import { deepseek } from "@ai-sdk/deepseek";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { AgentService } from "@/main/agents/agent.service";
import type { SelectAgent } from "@/main/agents/agents.schema";
import { LlmProviderService } from "@/main/agents/llm-providers/llm-provider.service";
import type { SelectLlmProvider } from "@/main/agents/llm-providers/llm-providers.schema";
import { AgentMemoryService } from "@/main/agents/memory/agent-memory.service";
import type {
  MemoryContextWindow,
  MemoryCreationInput,
} from "@/main/agents/memory/agent-memory.types";

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

    // Build memory context for this conversation
    const memoryContext = await this.buildMemoryContext(
      input.agentId,
      input.userId,
      conversation.id,
      input.content,
    );

    const userMessage = await MessageService.send({
      conversationId: conversation.id,
      authorId: input.userId,
      content: input.content,
    });

    const agentResponse = await this.generateAgentResponseWithMemory(
      agent,
      provider,
      input.content,
      conversation.id,
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
          memoryContextUsed: true,
          relevantMemoriesCount: memoryContext.relevantMemories.length,
        }),
      },
    });

    // Create memories from this interaction
    const memoriesCreated = await this.createMemoriesFromInteraction(
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
   * Build memory context for agent response generation
   */
  private static async buildMemoryContext(
    agentId: string,
    userId: string,
    conversationId: string,
    userMessage: string,
  ): Promise<MemoryContextWindow> {
    // Get conversation-specific memories
    const conversationMemories = await AgentMemoryService.getByConversation(
      conversationId,
      10,
    );

    // Search for relevant memories based on the user message
    const relevantMemories = await AgentMemoryService.search({
      agentId,
      userId,
      query: userMessage,
      limit: 15,
      includeArchived: false,
    });

    // Get user preferences
    const userPreferences = await AgentMemoryService.search({
      agentId,
      userId,
      type: "preference",
      limit: 10,
      includeArchived: false,
    });

    // Get recent learnings
    const recentLearnings = await AgentMemoryService.search({
      agentId,
      userId,
      type: "learning",
      limit: 5,
      includeArchived: false,
    });

    return {
      conversationMemories,
      relevantMemories,
      userPreferences: userPreferences.map((score) => score.memory),
      recentLearnings: recentLearnings.map((score) => score.memory),
    };
  }

  /**
   * Generate agent response with memory context
   */
  private static async generateAgentResponseWithMemory(
    agent: SelectAgent,
    provider: SelectLlmProvider,
    userMessage: string,
    conversationId: string,
    memoryContext: MemoryContextWindow,
  ): Promise<string> {
    const modelConfig = JSON.parse(agent.modelConfig);
    const conversationHistory =
      await MessageService.getConversationMessages(conversationId);

    // Build enhanced system prompt with memory context
    const memoryContextPrompt = this.buildMemoryContextPrompt(memoryContext);
    const enhancedSystemPrompt = `${agent.systemPrompt}

${memoryContextPrompt}

Remember to use this context naturally in your responses. Reference past conversations, learned preferences, and relevant facts when appropriate.`;

    const messages = [
      {
        role: "system" as const,
        content: enhancedSystemPrompt,
      },
      ...conversationHistory.slice(-8).map((msg) => ({
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

  /**
   * Build memory context prompt for the agent
   */
  private static buildMemoryContextPrompt(
    memoryContext: MemoryContextWindow,
  ): string {
    const sections: string[] = [];

    if (memoryContext.userPreferences.length > 0) {
      sections.push("USER PREFERENCES:");
      memoryContext.userPreferences.forEach((memory) => {
        sections.push(`- ${memory.summary || memory.content}`);
      });
    }

    if (memoryContext.conversationMemories.length > 0) {
      sections.push("\nCONVERSATION CONTEXT:");
      memoryContext.conversationMemories.forEach((memory) => {
        sections.push(`- ${memory.summary || memory.content}`);
      });
    }

    if (memoryContext.relevantMemories.length > 0) {
      sections.push("\nRELEVANT MEMORIES:");
      memoryContext.relevantMemories
        .slice(0, 5)
        .forEach(({ memory, relevanceScore }) => {
          sections.push(
            `- ${memory.summary || memory.content} (relevance: ${relevanceScore.toFixed(2)})`,
          );
        });
    }

    if (memoryContext.recentLearnings.length > 0) {
      sections.push("\nRECENT LEARNINGS:");
      memoryContext.recentLearnings.forEach((memory) => {
        sections.push(`- ${memory.summary || memory.content}`);
      });
    }

    return sections.length > 0
      ? `\nMEMORY CONTEXT:\n${sections.join("\n")}`
      : "";
  }

  /**
   * Create memories from user-agent interaction
   */
  private static async createMemoriesFromInteraction(
    agentId: string,
    userId: string,
    conversationId: string,
    userMessage: string,
    agentResponse: string,
  ): Promise<string[]> {
    const memoriesCreated: string[] = [];

    try {
      // Analyze user message for preferences and learnings
      const userAnalysis = await this.analyzeMessageForMemories(
        userMessage,
        "user",
      );
      const agentAnalysis = await this.analyzeMessageForMemories(
        agentResponse,
        "agent",
      );

      // Create conversation memory
      const conversationMemory = await AgentMemoryService.create({
        agentId,
        userId,
        conversationId,
        content: `User: ${userMessage}\nAgent: ${agentResponse}`,
        summary: `Conversation exchange about ${this.extractTopics(userMessage)[0] || "general topic"}`,
        type: "conversation",
        importance: "medium",
        keywords: JSON.stringify([
          ...this.extractTopics(userMessage),
          ...this.extractTopics(agentResponse),
        ]),
        metadata: JSON.stringify({
          interaction: true,
          timestamp: new Date().toISOString(),
        }),
      });
      memoriesCreated.push(conversationMemory.id);

      // Create preference memories if detected
      for (const preference of userAnalysis.preferences) {
        const preferenceMemory = await AgentMemoryService.create({
          agentId,
          userId,
          conversationId,
          content: preference.content,
          summary: preference.summary,
          type: "preference",
          importance: preference.importance,
          keywords: JSON.stringify(preference.keywords || []),
          metadata: JSON.stringify({
            detectedFrom: "user_message",
            confidence: (preference as any).confidence || 0.7,
          }),
        });
        memoriesCreated.push(preferenceMemory.id);
      }

      // Create learning memories from agent responses
      for (const learning of agentAnalysis.learnings) {
        const learningMemory = await AgentMemoryService.create({
          agentId,
          userId,
          conversationId,
          content: learning.content,
          summary: learning.summary,
          type: "learning",
          importance: learning.importance,
          keywords: JSON.stringify(learning.keywords || []),
          metadata: JSON.stringify({
            detectedFrom: "agent_response",
            confidence: (learning as any).confidence || 0.8,
          }),
        });
        memoriesCreated.push(learningMemory.id);
      }
    } catch (error) {
      console.error("Error creating memories from interaction:", error);
    }

    return memoriesCreated;
  }

  /**
   * Analyze message content for memory opportunities
   */
  private static async analyzeMessageForMemories(
    message: string,
    source: "user" | "agent",
  ): Promise<{
    preferences: MemoryCreationInput[];
    learnings: MemoryCreationInput[];
    facts: MemoryCreationInput[];
  }> {
    // Simple heuristic-based analysis (could be enhanced with LLM analysis)
    const preferences: MemoryCreationInput[] = [];
    const learnings: MemoryCreationInput[] = [];
    const facts: MemoryCreationInput[] = [];

    const messageLower = message.toLowerCase();

    // Detect preferences
    const preferenceIndicators = [
      "i prefer",
      "i like",
      "i don't like",
      "i hate",
      "i love",
      "my favorite",
      "i usually",
      "i always",
      "i never",
    ];

    for (const indicator of preferenceIndicators) {
      if (messageLower.includes(indicator)) {
        const sentence = this.extractSentenceContaining(message, indicator);
        if (sentence) {
          preferences.push({
            content: sentence,
            summary: `User preference: ${sentence.substring(0, 50)}...`,
            type: "preference",
            importance: "medium",
            keywords: this.extractTopics(sentence),
            metadata: { indicator, confidence: 0.7 } as any,
          });
        }
      }
    }

    // Detect learnings (from agent responses)
    if (source === "agent") {
      const learningIndicators = [
        "learned that",
        "discovered",
        "found out",
        "realized",
        "it turns out",
        "the key is",
        "remember that",
      ];

      for (const indicator of learningIndicators) {
        if (messageLower.includes(indicator)) {
          const sentence = this.extractSentenceContaining(message, indicator);
          if (sentence) {
            learnings.push({
              content: sentence,
              summary: `Learning: ${sentence.substring(0, 50)}...`,
              type: "learning",
              importance: "high",
              keywords: this.extractTopics(sentence),
              metadata: { indicator, confidence: 0.8 } as any,
            });
          }
        }
      }
    }

    return { preferences, learnings, facts };
  }

  /**
   * Extract sentence containing a specific phrase
   */
  private static extractSentenceContaining(
    text: string,
    phrase: string,
  ): string | null {
    const sentences = text.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(phrase.toLowerCase())) {
        return sentence.trim();
      }
    }
    return null;
  }

  /**
   * Extract topics/keywords from text
   */
  private static extractTopics(text: string): string[] {
    // Simple keyword extraction (could be enhanced with NLP)
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3);

    const stopWords = new Set([
      "this",
      "that",
      "with",
      "have",
      "will",
      "from",
      "they",
      "know",
      "want",
      "been",
      "good",
      "much",
      "some",
      "time",
      "very",
      "when",
      "come",
      "here",
      "just",
      "like",
      "long",
      "make",
      "many",
      "over",
      "such",
      "take",
      "than",
      "them",
      "well",
      "were",
    ]);

    return words.filter((word) => !stopWords.has(word)).slice(0, 5); // Return top 5 keywords
  }

  /**
   * Get agent conversation with memory context
   */
  static async getAgentConversationWithMemory(userId: string, agentId: string) {
    const conversation = await ConversationService.getOrCreateAgentConversation(
      userId,
      agentId,
    );

    const messages = await MessageService.getConversationMessages(
      conversation.id,
    );

    const memoryContext = await this.buildMemoryContext(
      agentId,
      userId,
      conversation.id,
      "", // Empty query for general context
    );

    return {
      conversation,
      messages,
      memoryContext,
    };
  }
}
