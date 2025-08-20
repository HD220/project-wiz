import { generateText } from "ai";
import type { CoreMessage } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createDeepSeek } from "@ai-sdk/deepseek";

import { getLogger } from "@/shared/services/logger/config";

import type { ProcessorFunction } from "../worker";
import type { JobInstance } from "../job";

const logger = getLogger("agent-response.processor");

export interface AgentResponseJobData {
  // Agent configuration
  agentId: string;
  agentName: string;
  agentRole: string;
  agentGoal: string;
  agentBackstory: string;

  // Provider configuration
  providerType: "openai" | "anthropic" | "google" | "deepseek";
  providerApiKey: string;

  // Model configuration
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;

  // Message data
  dmConversationId: string;
  conversationHistory: CoreMessage[];
}

export interface AgentResponseResult {
  agentResponse: string;
  finishReason: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    reasoningTokens?: number;
    cachedInputTokens?: number;
  };
}

// Helper function to create provider instances
function createProviderInstance(
  providerType: AgentResponseJobData["providerType"],
  apiKey: string,
) {
  switch (providerType) {
    case "openai":
      return createOpenAI({ apiKey });
    case "anthropic":
      return createAnthropic({ apiKey });
    case "google":
      return createGoogleGenerativeAI({ apiKey });
    case "deepseek":
      return createDeepSeek({ apiKey });
    default:
      throw new Error(`Unsupported provider type: ${providerType}`);
  }
}

/**
 * Processor for agent response jobs
 *
 * Pure function that takes all data needed and generates AI response
 * No database operations - that's handled by the worker/caller
 */
export const processAgentResponse: ProcessorFunction<AgentResponseResult> = async (job: JobInstance) => {
  const data = job.data;

  logger.debug("Processing agent response job", {
    jobId: job.id,
    agentId: data.agentId,
    dmConversationId: data.dmConversationId,
    providerType: data.providerType,
    model: data.model,
  });

  try {
    // 1. Build system prompt from agent configuration
    const systemPrompt = `You are ${data.agentName}, an AI agent with the following characteristics:

Role: ${data.agentRole}
Goal: ${data.agentGoal}
Backstory: ${data.agentBackstory}

Always respond in character and be helpful while staying true to your role and goals. Keep responses conversational and engaging.`;

    // 2. Prepare messages for LLM
    const messages = data.conversationHistory;

    logger.debug("Generating agent response", {
      jobId: job.id,
      agentId: data.agentId,
      providerType: data.providerType,
      model: data.model,
      messageCount: messages.length,
    });

    // 3. Create provider instance and generate response
    const provider = createProviderInstance(
      data.providerType,
      data.providerApiKey,
    );

    const result = await generateText({
      model: provider(data.model),
      system: systemPrompt,
      messages,
    });

    logger.debug("Agent response generated", {
      jobId: job.id,
      agentId: data.agentId,
      responseLength: result.text.length,
      finishReason: result.finishReason,
      usage: result.usage,
    });

    return {
      agentResponse: result.text,
      finishReason: result.finishReason,
      usage: result.totalUsage
        ? {
            inputTokens: result.totalUsage.inputTokens || 0,
            outputTokens: result.totalUsage.outputTokens || 0,
            totalTokens: result.totalUsage.totalTokens || 0,
            reasoningTokens: result.totalUsage.reasoningTokens,
            cachedInputTokens: result.totalUsage.cachedInputTokens,
          }
        : undefined,
    };
  } catch (error) {
    logger.error("Agent response generation failed", {
      jobId: job.id,
      agentId: data.agentId,
      providerType: data.providerType,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};
