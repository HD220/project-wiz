import { AgentService } from "@/main/features/agent/agent.service";
import { messageService } from "@/main/features/message/message.service";
import { LlmProviderService } from "@/main/features/llm-provider/llm-provider.service";

import { llmJobQueueService } from "./llm-job-queue.service";

import type { ProcessMessageJobData } from "./llm-job-queue.types";

/**
 * LLM Message Processor Service
 * 
 * Handles LLM job submission for chat messages and agent responses.
 * Integrates with existing message and agent systems to submit processing jobs
 * instead of making direct LLM API calls.
 */
export const llmMessageProcessorService = {
  /**
   * Process a user message by submitting an LLM job
   * This replaces direct LLM API calls with async job submission
   */
  async processUserMessage(
    userId: string,
    sourceType: "dm" | "channel",
    sourceId: string,
    content: string,
    options?: {
      systemPrompt?: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
      priority?: number;
    }
  ): Promise<{
    messageId: string;
    jobId: string;
  }> {
    // First, save the user message
    const userMessage = await messageService.send({
      sourceType,
      sourceId,
      authorId: userId,
      content,
    });

    // Get conversation history for context
    const previousMessages = await messageService.getMessages(
      sourceType,
      sourceId,
      false // Only active messages
    );

    // Build conversation context
    const conversationContext = previousMessages
      .slice(-10) // Last 10 messages for context
      .map(msg => ({
        role: msg.authorId === userId ? "user" as const : "assistant" as const,
        content: msg.content,
        timestamp: msg.createdAt,
      }));

    // Prepare job data
    const jobData: ProcessMessageJobData = {
      userId,
      conversationId: sourceId,
      sourceType,
      sourceId,
      message: content,
      messageId: userMessage.id,
      context: {
        previousMessages: conversationContext,
        systemPrompt: options?.systemPrompt,
        model: options?.model,
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      }
    };

    // Submit job to queue
    const jobId = await llmJobQueueService.addJob(
      "process-message",
      jobData,
      {
        priority: options?.priority || 100, // High priority for user messages
      }
    );

    return {
      messageId: userMessage.id,
      jobId,
    };
  },

  /**
   * Process an agent response by submitting an LLM job
   * Used when agents need to respond to messages or participate in conversations
   */
  async processAgentMessage(
    agentId: string,
    sourceType: "dm" | "channel",
    sourceId: string,
    triggerMessageId: string,
    options?: {
      priority?: number;
      customInstruction?: string;
    }
  ): Promise<{
    jobId: string;
  }> {
    // Get agent details with provider
    const agentWithProvider = await AgentService.getWithProvider(agentId);
    if (!agentWithProvider) {
      throw new Error("Agent not found or inactive");
    }

    // Get the trigger message
    const triggerMessage = await messageService.findById(triggerMessageId);
    if (!triggerMessage) {
      throw new Error("Trigger message not found");
    }

    // Get conversation history for context
    const previousMessages = await messageService.getMessages(
      sourceType,
      sourceId,
      false // Only active messages
    );

    // Build conversation context
    const conversationContext = previousMessages
      .slice(-15) // More context for agents
      .map(msg => ({
        role: msg.authorId === agentWithProvider.userId ? "assistant" as const : "user" as const,
        content: msg.content,
        timestamp: msg.createdAt,
      }));

    // Prepare job data
    const jobData: ProcessMessageJobData = {
      userId: agentWithProvider.userId,
      conversationId: sourceId,
      sourceType,
      sourceId,
      message: triggerMessage.content,
      messageId: triggerMessageId,
      context: {
        previousMessages: conversationContext,
        systemPrompt: agentWithProvider.systemPrompt,
        model: agentWithProvider.provider.defaultModel,
        temperature: 0.7, // Default for agent responses
        maxTokens: 2000, // Default for agent responses
      }
    };

    // Submit job to queue
    const jobId = await llmJobQueueService.addJob(
      "process-message",
      jobData,
      {
        priority: options?.priority || 75, // Medium-high priority for agent responses
      }
    );

    return { jobId };
  },

  /**
   * Process code analysis request by submitting an LLM job
   * Used for code review, explanation, or testing
   */
  async processCodeAnalysis(
    userId: string,
    code: string,
    language: string,
    analysisType: "review" | "explain" | "test-generation" | "refactor",
    options?: {
      fileName?: string;
      relatedFiles?: string[];
      requirements?: string;
      projectId?: string;
      priority?: number;
    }
  ): Promise<{
    jobId: string;
  }> {
    // Get user's default provider for LLM configuration
    const defaultProvider = await LlmProviderService.getDefaultProvider(userId);
    if (!defaultProvider) {
      throw new Error("No default LLM provider configured for user");
    }

    // Prepare job data
    const jobData = {
      userId,
      projectId: options?.projectId,
      code,
      language,
      analysisType,
      context: {
        fileName: options?.fileName,
        relatedFiles: options?.relatedFiles,
        requirements: options?.requirements,
      }
    };

    // Submit job to queue
    const jobId = await llmJobQueueService.addJob(
      "analyze-code",
      jobData,
      {
        priority: options?.priority || 50, // Medium priority for code analysis
      }
    );

    return { jobId };
  },

  /**
   * Get job result and create response message
   * Called after a job completes to deliver the result back to the conversation
   */
  async handleJobCompletion(jobId: string): Promise<void> {
    const jobStatus = await llmJobQueueService.getJobStatus(jobId);
    if (!jobStatus) {
      throw new Error("Job not found");
    }

    if (jobStatus.status !== "completed") {
      throw new Error(`Job not completed. Status: ${jobStatus.status}`);
    }

    if (!jobStatus.result) {
      throw new Error("Job completed but has no result");
    }

    // Parse job result
    const result = jobStatus.result as any;
    
    if (jobStatus.name === "process-message") {
      // Handle message processing result
      await this.handleMessageProcessingResult(jobId, result);
    } else if (jobStatus.name === "analyze-code") {
      // Handle code analysis result
      await this.handleCodeAnalysisResult(jobId, result);
    }
  },

  /**
   * Handle message processing job result
   * Creates a response message in the conversation
   */
  async handleMessageProcessingResult(_jobId: string, result: any): Promise<void> {
    // Extract response from LLM result
    const responseContent = result.content || result.message || "I couldn't generate a response.";
    const originalJobData = result.originalData;

    if (!originalJobData) {
      throw new Error("Missing original job data in result");
    }

    // Create response message in the same conversation
    await messageService.sendWithLlmData({
      messageInput: {
        sourceType: originalJobData.sourceType,
        sourceId: originalJobData.sourceId,
        authorId: originalJobData.userId,
        content: responseContent,
      },
      llmData: {
        role: "assistant",
        content: responseContent,
      }
    });
  },

  /**
   * Handle code analysis job result
   * For now, this could create a message or be handled differently
   */
  async handleCodeAnalysisResult(_jobId: string, result: any): Promise<void> {
    // Code analysis results might be handled differently
    // For now, we'll just log them - in the future this could:
    // - Create a report message
    // - Update a project analysis record
    // - Trigger follow-up jobs
    console.log(`Code analysis job completed:`, result);
  },

  /**
   * Get active agent for a conversation
   * Determines which agent should respond to a message
   */
  async getActiveAgentForConversation(
    _sourceType: "dm" | "channel",
    sourceId: string
  ): Promise<string | null> {
    // For now, get the first active agent
    // In the future, this could be more sophisticated:
    // - Check conversation participants
    // - Use agent assignment rules
    // - Consider agent expertise/context
    const activeAgents = await AgentService.getActiveAgentsForConversation(sourceId);
    
    return activeAgents.length > 0 ? activeAgents[0]?.id || null : null;
  }
};