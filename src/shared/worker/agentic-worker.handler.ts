import { EventEmitter } from "events";
import { QueueClient } from "@/main/features/queue-client/queue-client";
import { eventBus, type SystemEventData } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";
import { AgentService } from "@/main/features/agent/agent.service";
import { LlmProviderService } from "@/main/features/llm-provider/llm-provider.service";
import { messageService } from "@/main/features/message/message.service";

const logger = getLogger("agentic-worker-handler");

// Job context tracking interface
export interface JobContext {
  jobId: string;
  conversationId: string;
  conversationType: "dm" | "channel";
  agentIds: string[];
  timestamp: Date;
  userMessageId: string;
}

// Complete job data interface for multiple agents
export interface CompleteJobData {
  conversationId: string;
  conversationType: "dm" | "channel";
  userMessageId: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  agents: Array<{
    id: string;
    name: string;
    role: string;
    backstory: string;
    goal: string;
    systemPrompt: string;
    provider: string;
    model: string;
    apiKey: string;
  }>;
}

/**
 * AgenticWorkerHandler - Central orchestration layer for AI integration
 * 
 * This class serves as the bridge between the event system and the worker queue,
 * handling the complete flow from user messages to agent responses.
 */
export class AgenticWorkerHandler extends EventEmitter {
  private queueClient: QueueClient;
  private activeJobs = new Map<string, JobContext>();

  constructor() {
    super();
    this.queueClient = new QueueClient("llm-jobs");
    logger.info("🔄 AgenticWorkerHandler initialized");
    
    this.setupEventListeners();
    this.setupWorkerListeners();
  }

  /**
   * Setup listeners for system events
   */
  private setupEventListeners(): void {
    logger.debug("👂 Setting up event listeners");

    // Listen to user message events
    eventBus.on("user-sent-message", (data) => {
      this.handleUserMessage(data).catch((error) => {
        logger.error("❌ Error handling user message:", error);
      });
    });

    // Listen to agent status change events
    eventBus.on("agent-status-changed", (data) => {
      this.handleAgentStatusChanged(data);
    });

    logger.info("✅ Event listeners setup complete");
  }

  /**
   * Setup listeners for worker/queue events
   */
  private setupWorkerListeners(): void {
    logger.debug("👂 Setting up worker listeners");
    
    // Listen to QueueClient events
    this.queueClient.on("job-completed", (data) => {
      this.handleJobCompleted(data.jobId, data.result).catch((error) => {
        logger.error("❌ Error handling job completion:", error);
      });
    });

    this.queueClient.on("job-failed", (data) => {
      this.handleJobFailed(data.jobId, data.error).catch((error) => {
        logger.error("❌ Error handling job failure:", error);
      });
    });

    this.queueClient.on("job-progress", (data) => {
      this.handleJobProgress(data.jobId, data.progress);
    });
    
    logger.info("✅ Worker listeners setup complete");
  }

  /**
   * Handle user sent message events
   */
  private async handleUserMessage(data: SystemEventData<"user-sent-message">): Promise<void> {
    logger.info("📝 Processing user message event:", {
      messageId: data.messageId,
      conversationId: data.conversationId,
      conversationType: data.conversationType
    });

    try {
      // Build complete job data
      const completeJobData = await this.buildCompleteJobData(data);
      
      if (!completeJobData) {
        logger.warn("⚠️ No agents found for conversation, skipping job creation");
        return;
      }

      // Create individual jobs for each agent
      const jobPromises = completeJobData.agents.map(async (agent) => {
        try {
          // Build job data for single agent (compatible with current ResponseGenerator)
          const singleAgentJobData = {
            agent: {
              name: agent.name,
              role: agent.role,
              backstory: agent.backstory
            },
            messages: completeJobData.messages,
            provider: agent.provider,
            model: agent.model,
            apiKey: agent.apiKey
          };

          // Create job for this agent
          const result = await this.queueClient.add(singleAgentJobData, {
            priority: 1,
            attempts: 3
          });

          // Track job in activeJobs Map
          const jobContext: JobContext = {
            jobId: result.jobId,
            conversationId: data.conversationId,
            conversationType: data.conversationType,
            agentIds: [agent.id], // Single agent per job
            timestamp: data.timestamp,
            userMessageId: data.messageId
          };

          this.activeJobs.set(result.jobId, jobContext);

          logger.debug(`✅ Job created for agent ${agent.name}:`, result.jobId);
          return { agentId: agent.id, jobId: result.jobId };

        } catch (error) {
          logger.error(`❌ Failed to create job for agent ${agent.id}:`, error);
          return null;
        }
      });

      // Wait for all job creations to complete
      const jobResults = await Promise.allSettled(jobPromises);
      
      const successfulJobs = jobResults
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => (result as PromiseFulfilledResult<any>).value);

      const allAgentIds = completeJobData.agents.map(a => a.id);

      // Update agent status to 'busy' for all agents
      await this.updateAgentsStatus(allAgentIds, "busy", data.conversationId);

      logger.info("✅ Jobs created successfully:", {
        totalAgents: completeJobData.agents.length,
        successfulJobs: successfulJobs.length,
        failedJobs: jobResults.length - successfulJobs.length
      });

    } catch (error) {
      logger.error("❌ Failed to process user message:", error);
    }
  }

  /**
   * Handle agent status change events
   */
  private handleAgentStatusChanged(data: SystemEventData<"agent-status-changed">): void {
    logger.debug("🔄 Agent status changed:", {
      agentId: data.agentId,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus
    });

    // Log status changes for monitoring
    // Additional logic can be added here if needed
  }

  /**
   * Build complete job data with agent info, message history, and provider configs
   */
  private async buildCompleteJobData(messageData: SystemEventData<"user-sent-message">): Promise<CompleteJobData | null> {
    logger.debug("🔨 Building complete job data for message:", messageData.messageId);

    try {
      // 1. Get active agents in conversation
      const activeAgents = await AgentService.getActiveAgentsForConversation(messageData.conversationId);
      
      if (activeAgents.length === 0) {
        logger.info("⚠️ No active agents found for conversation:", messageData.conversationId);
        return null;
      }

      logger.debug(`📋 Found ${activeAgents.length} active agents for conversation`);

      // 2. Build complete agent data with provider configurations
      const completeAgents = await Promise.all(
        activeAgents.map(async (agent) => {
          try {
            // Get agent with provider info
            const agentWithProvider = await AgentService.getWithProvider(agent.id);
            if (!agentWithProvider) {
              logger.warn(`⚠️ Could not load provider for agent ${agent.id}`);
              return null;
            }

            // Decrypt API key
            const apiKey = await LlmProviderService.getDecryptedApiKey(agent.providerId);

            // Parse model config
            let modelConfig;
            try {
              modelConfig = typeof agent.modelConfig === 'string' 
                ? JSON.parse(agent.modelConfig) 
                : agent.modelConfig;
            } catch (error) {
              logger.warn(`⚠️ Invalid model config for agent ${agent.id}, using defaults`);
              modelConfig = { model: agentWithProvider.provider.defaultModel };
            }

            return {
              id: agent.id,
              name: agent.name,
              role: agent.role,
              backstory: agent.backstory,
              goal: agent.goal,
              systemPrompt: agent.systemPrompt,
              provider: agentWithProvider.provider.type,
              model: modelConfig.model || agentWithProvider.provider.defaultModel,
              apiKey: apiKey
            };
          } catch (error) {
            logger.error(`❌ Error processing agent ${agent.id}:`, error);
            return null;
          }
        })
      );

      // Filter out null results (failed agent processing)
      const validAgents = completeAgents.filter(agent => agent !== null);
      
      if (validAgents.length === 0) {
        logger.warn("⚠️ No valid agents could be processed");
        return null;
      }

      logger.debug(`✅ Successfully processed ${validAgents.length} agents`);

      // 3. Get recent message history (last 20 messages)
      const sourceType = messageData.conversationType === "dm" ? "dm" : "channel";
      const recentMessages = await messageService.getMessages(
        sourceType, 
        messageData.conversationId, 
        false // Don't include inactive messages
      );

      // Take last 20 messages and reverse to get chronological order
      const messageHistory = recentMessages.slice(-20);

      logger.debug(`📨 Retrieved ${messageHistory.length} recent messages`);

      // 4. Convert messages to LLM format
      const llmMessages = await Promise.all(
        messageHistory.map(async (msg) => {
          try {
            // Get LLM data if available
            const messageWithLlm = await messageService.getMessageWithLlmData(msg.id);
            
            if (messageWithLlm?.llmMessage) {
              // Use LLM-specific role and content (filter out tool role for now)
              const role = messageWithLlm.llmMessage.role;
              const safeRole = (role === "tool") ? "assistant" : role as "user" | "assistant" | "system";
              
              return {
                role: safeRole,
                content: messageWithLlm.llmMessage.content
              };
            } else {
              // Convert regular message to user role
              return {
                role: "user" as const,
                content: msg.content
              };
            }
          } catch (error) {
            logger.warn(`⚠️ Error processing message ${msg.id}:`, error);
            // Fallback to basic format
            return {
              role: "user" as const,
              content: msg.content
            };
          }
        })
      );

      // 5. Build complete job data
      const completeJobData: CompleteJobData = {
        conversationId: messageData.conversationId,
        conversationType: messageData.conversationType,
        userMessageId: messageData.messageId,
        messages: llmMessages,
        agents: validAgents
      };

      logger.info("✅ Complete job data built successfully:", {
        conversationId: messageData.conversationId,
        agentCount: validAgents.length,
        messageCount: llmMessages.length
      });

      return completeJobData;

    } catch (error) {
      logger.error("❌ Error building complete job data:", error);
      return null;
    }
  }

  /**
   * Update agent status utility method
   */
  private async updateAgentsStatus(agentIds: string[], status: "active" | "inactive" | "busy", conversationId?: string): Promise<void> {
    logger.debug("🔄 Updating agent status:", { agentIds, status, conversationId });

    try {
      // Update each agent's status
      const updateResults = await Promise.allSettled(
        agentIds.map(async (agentId) => {
          try {
            // Get current agent to check old status
            const currentAgent = await AgentService.findById(agentId);
            if (!currentAgent) {
              logger.warn(`⚠️ Agent ${agentId} not found, skipping status update`);
              return null;
            }

            const oldStatus = currentAgent.status;

            // Update status via AgentService
            const updatedAgent = await AgentService.updateStatus(agentId, status);

            // Emit agent-status-changed event
            eventBus.emit("agent-status-changed", {
              agentId: agentId,
              oldStatus: oldStatus,
              newStatus: status,
              conversationId: conversationId,
              timestamp: new Date()
            });

            logger.debug(`✅ Updated agent ${agentId} status: ${oldStatus} → ${status}`);
            return updatedAgent;

          } catch (error) {
            logger.error(`❌ Failed to update status for agent ${agentId}:`, error);
            return null;
          }
        })
      );

      // Count successful updates
      const successfulUpdates = updateResults.filter(
        result => result.status === 'fulfilled' && result.value !== null
      ).length;

      const failedUpdates = agentIds.length - successfulUpdates;

      if (failedUpdates > 0) {
        logger.warn(`⚠️ ${failedUpdates} agent status updates failed out of ${agentIds.length}`);
      }

      logger.info(`✅ Agent status updates completed: ${successfulUpdates}/${agentIds.length} successful`);

    } catch (error) {
      logger.error("❌ Error in updateAgentsStatus:", error);
      throw error;
    }
  }

  /**
   * Handle job completion (to be called when QueueClient emits job-completed)
   */
  public async handleJobCompleted(jobId: string, result: any): Promise<void> {
    logger.info("✅ Job completed:", { jobId });

    try {
      // Get job context
      const jobContext = this.activeJobs.get(jobId);
      if (!jobContext) {
        logger.warn("⚠️ Job context not found for completed job:", jobId);
        return;
      }

      // Route results based on action type
      await this.processJobResult(jobContext, result);

      // Clean up job tracking
      this.activeJobs.delete(jobId);

      logger.info("✅ Job completion processing finished:", jobId);

    } catch (error) {
      logger.error("❌ Error processing job completion:", error);
    }
  }

  /**
   * Handle job failure (to be called when QueueClient emits job-failed)
   */
  public async handleJobFailed(jobId: string, error: any): Promise<void> {
    logger.error("❌ Job failed:", { jobId, error });

    try {
      // Get job context
      const jobContext = this.activeJobs.get(jobId);
      if (!jobContext) {
        logger.warn("⚠️ Job context not found for failed job:", jobId);
        return;
      }

      // Handle final job failure
      await this.handleFinalJobFailure(jobContext, error);

      // Clean up job tracking
      this.activeJobs.delete(jobId);

    } catch (processError) {
      logger.error("❌ Error processing job failure:", processError);
    }
  }

  /**
   * Handle job progress updates
   */
  private handleJobProgress(jobId: string, progress: number): void {
    logger.debug("📊 Job progress update:", { jobId, progress });

    // Get job context for additional logging
    const jobContext = this.activeJobs.get(jobId);
    if (jobContext) {
      logger.debug("📊 Job progress details:", {
        jobId,
        progress,
        conversationId: jobContext.conversationId,
        agentCount: jobContext.agentIds.length
      });
    }

    // Additional progress handling logic can be added here
  }

  /**
   * Process job results based on action type
   */
  private async processJobResult(jobContext: JobContext, result: any): Promise<void> {
    logger.debug("🔄 Processing job result:", { jobId: jobContext.jobId, result });

    try {
      // Since each job now processes a single agent and returns a text response,
      // we can directly process it as an agent response
      if (typeof result === 'string' && result.trim().length > 0) {
        await this.processAgentResponse(jobContext, result);
      } else if (result && typeof result === 'object' && result.success === false) {
        // Handle error responses
        logger.warn(`⚠️ Job ${jobContext.jobId} returned error result:`, result);
        await this.handleJobError(jobContext, result.error || 'Unknown error');
      } else {
        // Handle unexpected result format
        logger.warn(`⚠️ Job ${jobContext.jobId} returned unexpected result format:`, result);
        await this.handleJobError(jobContext, 'Unexpected result format');
      }
    } catch (error) {
      logger.error(`❌ Error processing job result for ${jobContext.jobId}:`, error);
      await this.handleJobError(jobContext, error instanceof Error ? error.message : 'Processing error');
    }
  }

  /**
   * Process individual agent response
   */
  private async processAgentResponse(jobContext: JobContext, responseText: string): Promise<void> {
    logger.debug("🔄 Processing agent response:", { 
      jobId: jobContext.jobId, 
      responseLength: responseText.length,
      conversationId: jobContext.conversationId
    });

    try {
      // Get the agent ID (should be single agent per job)
      const agentId = jobContext.agentIds[0];
      if (!agentId) {
        throw new Error("No agent ID found in job context");
      }

      // Get agent info for the message author
      const agent = await AgentService.findById(agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      // Create agent response message using messageService.sendWithLlmData
      const messageInput = {
        sourceType: jobContext.conversationType,
        sourceId: jobContext.conversationId,
        authorId: agent.userId, // Use agent's user ID as author
        content: responseText
      };

      const llmData = {
        role: "assistant" as const,
        content: responseText,
        isActive: true
      };

      // Send message with LLM data
      const createdMessage = await messageService.sendWithLlmData({
        messageInput,
        llmData
      });

      // Update agent status back to 'active'
      await this.updateAgentsStatus([agentId], "active", jobContext.conversationId);

      // Notify renderer of conversation update
      this.notifyRenderer(jobContext.conversationId, jobContext.conversationType, "message-added", {
        messageId: createdMessage.id,
        agentId: agentId,
        responseLength: responseText.length
      });

      logger.info("✅ Agent response processed successfully:", {
        jobId: jobContext.jobId,
        messageId: createdMessage.id,
        agentId: agentId,
        conversationId: jobContext.conversationId
      });

    } catch (error) {
      logger.error(`❌ Error processing agent response for job ${jobContext.jobId}:`, error);
      throw error; // Re-throw to be handled by processJobResult
    }
  }

  /**
   * Handle job errors
   */
  private async handleJobError(jobContext: JobContext, errorMessage: string): Promise<void> {
    logger.error("💥 Handling job error:", { 
      jobId: jobContext.jobId, 
      error: errorMessage,
      conversationId: jobContext.conversationId
    });

    try {
      // Reset agent status to 'active' for all agents in this job
      await this.updateAgentsStatus(jobContext.agentIds, "active", jobContext.conversationId);

      // Optionally create an error message in the conversation
      // For now, just log and notify renderer
      this.notifyRenderer(jobContext.conversationId, jobContext.conversationType, "status-changed", {
        error: errorMessage,
        jobId: jobContext.jobId
      });

      logger.info("✅ Job error handled:", {
        jobId: jobContext.jobId,
        agentsReset: jobContext.agentIds.length
      });

    } catch (error) {
      logger.error(`❌ Error handling job error for ${jobContext.jobId}:`, error);
    }
  }


  /**
   * Handle final job failure - create error messages and reset agent status
   */
  private async handleFinalJobFailure(jobContext: JobContext, error: any): Promise<void> {
    logger.error("💥 Handling final job failure:", { 
      jobId: jobContext.jobId, 
      error 
    });

    try {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // 1. Create error messages from agents (optional - could create system error message)
      for (const agentId of jobContext.agentIds) {
        try {
          const agent = await AgentService.findById(agentId);
          if (agent) {
            const errorResponse = `I apologize, but I encountered an error while processing your request: ${errorMessage}. Please try again or contact support if the issue persists.`;
            
            const messageInput = {
              sourceType: jobContext.conversationType,
              sourceId: jobContext.conversationId,
              authorId: agent.userId,
              content: errorResponse
            };

            const llmData = {
              role: "assistant" as const,
              content: errorResponse,
              isActive: true
            };

            // Create error response message
            await messageService.sendWithLlmData({
              messageInput,
              llmData
            });

            logger.debug(`✅ Error message created for agent ${agent.name}`);
          }
        } catch (messageError) {
          logger.warn(`⚠️ Could not create error message for agent ${agentId}:`, messageError);
          // Continue with other agents even if one fails
        }
      }

      // 2. Reset agent status to 'active'
      await this.updateAgentsStatus(jobContext.agentIds, "active", jobContext.conversationId);

      // 3. Notify UI of conversation updates
      this.notifyRenderer(jobContext.conversationId, jobContext.conversationType, "status-changed", {
        type: "job-failed",
        error: errorMessage,
        jobId: jobContext.jobId,
        affectedAgents: jobContext.agentIds
      });

      logger.info("✅ Final job failure handled:", {
        jobId: jobContext.jobId,
        agentsReset: jobContext.agentIds.length,
        errorMessage
      });

    } catch (handlingError) {
      logger.error("❌ Error in final job failure handling:", handlingError);
      
      // Last resort - at least try to reset agent status
      try {
        await this.updateAgentsStatus(jobContext.agentIds, "active", jobContext.conversationId);
      } catch (statusError) {
        logger.error("❌ Could not reset agent status after failure handling error:", statusError);
      }
    }
  }

  /**
   * Notify renderer of conversation updates
   */
  private notifyRenderer(conversationId: string, conversationType: "dm" | "channel", updateType: "message-added" | "agent-response" | "status-changed", data?: any): void {
    logger.debug("📤 Notifying renderer:", { conversationId, conversationType, updateType, data });

    // Emit conversation-updated event
    eventBus.emit("conversation-updated", {
      conversationId,
      conversationType,
      updateType: updateType,
      data: data,
      timestamp: new Date()
    });

    // Send IPC message to renderer to invalidate cache/update UI
    try {
      // For now, we don't have direct access to the main window here
      // This could be enhanced by passing a renderer notification callback
      // or using the event bus to notify a service that has IPC access
      logger.debug("📤 Conversation update event emitted via EventBus");
    } catch (error) {
      logger.warn("⚠️ Could not send IPC notification to renderer:", error);
    }
  }

  /**
   * Get active job count for monitoring
   */
  public getActiveJobCount(): number {
    return this.activeJobs.size;
  }

  /**
   * Get active jobs for debugging
   */
  public getActiveJobs(): Map<string, JobContext> {
    return new Map(this.activeJobs);
  }

  /**
   * Shutdown - clean up resources
   */
  public shutdown(): void {
    logger.info("🛑 AgenticWorkerHandler shutting down");
    
    // Shutdown QueueClient
    this.queueClient.shutdown();
    
    // Remove all event listeners
    this.removeAllListeners();
    
    // Clear active jobs
    this.activeJobs.clear();
    
    logger.info("✅ AgenticWorkerHandler shutdown complete");
  }
}

// Global singleton instance
export const agenticWorkerHandler = new AgenticWorkerHandler();

// Export singleton initialization function
export function initializeAgenticWorkerHandler(): AgenticWorkerHandler {
  logger.info("🚀 AgenticWorkerHandler singleton initialized");
  return agenticWorkerHandler;
}