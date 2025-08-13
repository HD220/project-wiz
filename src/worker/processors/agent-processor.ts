import { generateText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { createDatabaseConnection } from "@/shared/config/database";

const { getDatabase } = createDatabaseConnection(true);
import { getLogger } from "@/shared/services/logger/config";
import { QueueClient } from "@/shared/services/queue-client";

import { usersTable } from "@/main/schemas/user.schema";
import { agentsTable } from "@/main/schemas/agent.schema";
import { llmProvidersTable } from "@/main/schemas/llm-provider.schema";
import { messagesTable } from "@/main/schemas/message.schema";

import { MainProcessAPI } from "../services/main-process-api";

import { loadProvider } from "../llm/provider-load";
import { MemoryService } from "../services/memory.service";

import type { JobFunction, Job } from "../queue/job.types";

export interface AgentJobData {
  agentId: string;
  messageId?: string;
  conversationId?: string;
  conversationType?: "dm" | "channel";
  projectId?: string;
  type: "message_response" | "management_task" | "periodic_checkin";
  context?: any;
}

const logger = getLogger("agent-processor");

export const agentProcessor: JobFunction<AgentJobData, string> = async (
  job: Job<AgentJobData>,
) => {
  logger.info("🤖 [AgentProcessor] Starting job processing:", job.id);

  const {
    agentId,
    messageId,
    conversationId,
    conversationType,
    projectId,
    type,
    context,
  } = job.data;
  const db = getDatabase();

  try {
    // Get agent with provider and user data
    const agentData = await db
      .select({
        agent: agentsTable,
        provider: llmProvidersTable,
        user: usersTable,
      })
      .from(agentsTable)
      .innerJoin(usersTable, eq(agentsTable.id, usersTable.id)) // Agent IS a user (extends user table)
      .innerJoin(
        llmProvidersTable,
        eq(agentsTable.providerId, llmProvidersTable.id),
      )
      .where(eq(agentsTable.id, agentId))
      .get();

    if (!agentData) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const { agent, provider, user } = agentData;

    // Get conversation context if available
    let conversationContext = "";
    let userMessage = "";
    if (messageId && conversationId) {
      const message = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.id, messageId))
        .get();

      if (message) {
        userMessage = message.content;
        conversationContext = `User message: "${message.content}"`;
      }
    }

    // Get relevant memories using semantic search
    const memories = await MemoryService.getRelevantMemories(
      agentId,
      projectId,
      userMessage || context?.query, // Use message or context as query for semantic search
    );

    // Build system prompt with agent personality and memories
    const memoryContext = [
      ...(memories.agent.length > 0
        ? [
            `Personal memories: ${memories.agent.map((m) => m.content).join("; ")}`,
          ]
        : []),
      ...(memories.team.length > 0
        ? [`Team knowledge: ${memories.team.map((m) => m.content).join("; ")}`]
        : []),
      ...(memories.project.length > 0
        ? [
            `Project knowledge: ${memories.project.map((m) => m.content).join("; ")}`,
          ]
        : []),
    ].join("\n");

    const systemPrompt = `You are ${user.name}, ${agent.role}. ${agent.backstory}

Your goal: ${agent.goal}

${memoryContext ? `Context from your memory:\n${memoryContext}` : ""}

Instructions:
- Respond according to your personality and role
- Use your memories to provide contextual responses
- Use tools when necessary to save important knowledge or send messages
- Focus on being helpful while staying true to your character`;

    // Load provider and model - get decrypted API key first
    const modelConfig = JSON.parse(agent.modelConfig);
    
    // Get decrypted API key via MainProcessAPI
    if (!provider.id) {
      throw new Error(`Provider ID is missing for agent ${agentId}`);
    }
    if (!agent.ownerId) {
      throw new Error(`Owner ID is missing for agent ${agentId}`);
    }
    
    const { apiKey: decryptedApiKey } = await MainProcessAPI.getDecryptedApiKey({
      providerId: provider.id,
      ownerId: agent.ownerId,
    });
    
    const model = loadProvider(
      provider.type,
      modelConfig.model,
      decryptedApiKey,
    );

    // Define tools available to the agent
    const tools = {
      saveMemory: tool({
        description: "Save important knowledge to memory for future reference",
        inputSchema: z.object({
          content: z.string().describe("The knowledge or insight to save"),
          level: z
            .enum(["agent", "team", "project"])
            .describe(
              "Memory level: agent (personal), team (shared with team), project (global)",
            ),
        }),
        execute: async ({ content, level }) => {
          const memoryId = await MemoryService.save(content, level, agentId, {
            agentId: level === "agent" ? agentId : undefined,
            projectId: level !== "agent" ? projectId : undefined,
          });
          logger.info(`Agent ${agentId} saved ${level} memory: ${memoryId}`);
          return { saved: true, memoryId };
        },
      }),

      sendMessage: tool({
        description: "Send a message to the conversation",
        inputSchema: z.object({
          content: z.string().describe("The message content"),
        }),
        execute: async ({ content }) => {
          if (!conversationId || !conversationType) {
            return { error: "No active conversation context" };
          }

          try {
            let result: { messageId: string };

            // Use MainProcessAPI to send message via proper IPC channels
            if (conversationType === "dm") {
              result = await MainProcessAPI.sendDMMessage({
                dmId: conversationId,
                content,
                authorId: agentId,
              });
            } else if (conversationType === "channel") {
              result = await MainProcessAPI.sendChannelMessage({
                channelId: conversationId,
                content,
                authorId: agentId,
              });
            } else {
              return {
                error: `Unsupported conversation type: ${conversationType}`,
              };
            }

            logger.info(
              `Agent ${agentId} sent message to ${conversationType}: ${conversationId}`,
            );
            return { sent: true, messageId: result.messageId };
          } catch (error) {
            logger.error(`Failed to send message for agent ${agentId}:`, error);
            return {
              error: `Failed to send message: ${error instanceof Error ? error.message : String(error)}`,
            };
          }
        },
      }),

      createManagementTask: tool({
        description:
          "Create a management task for yourself or coordinate with other agents",
        inputSchema: z.object({
          description: z.string().describe("What needs to be done"),
          targetAgentId: z
            .string()
            .optional()
            .describe("Agent to assign task to (default: self)"),
          priority: z
            .number()
            .optional()
            .default(10)
            .describe("Task priority (higher = more urgent)"),
          delayMinutes: z
            .number()
            .optional()
            .describe("Delay before executing (in minutes)"),
        }),
        execute: async ({
          description,
          targetAgentId = agentId,
          priority,
          delayMinutes,
        }) => {
          const targetQueue = new QueueClient(`agent-${targetAgentId}`);

          const delay = delayMinutes ? delayMinutes * 60 * 1000 : undefined;

          const result = await targetQueue.add(
            {
              agentId: targetAgentId,
              type: "management_task",
              context: {
                description,
                requestedBy: agentId,
                originalJobId: job.id,
              },
              projectId,
            },
            {
              priority,
              delay,
            },
          );

          logger.info(
            `Agent ${agentId} created management task for ${targetAgentId}: ${result.jobId}`,
          );
          return { created: true, taskId: result.jobId };
        },
      }),
    };

    // Prepare prompt based on job type
    let prompt: string;
    switch (type) {
      case "message_response":
        prompt =
          conversationContext || "Respond to the current conversation context.";
        break;
      case "management_task":
        prompt = `Management task: ${context?.description || "Handle this management task"}\n\nContext: ${JSON.stringify(context, null, 2)}`;
        break;
      case "periodic_checkin":
        prompt =
          "This is your periodic check-in. Review the current project status, your recent work, and decide if there are any tasks you should create or actions you should take.";
        break;
      default:
        prompt = context?.prompt || "How can I help?";
    }

    logger.debug(
      "🤖 [AgentProcessor] Calling generateText with system prompt and tools",
    );

    // Generate response
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt,
      tools,
      stopWhen: stepCountIs(1), // Only 1 step per job execution as per PRD
      temperature: modelConfig.temperature || 0.7,
    });

    logger.info("🤖 [AgentProcessor] Job completed successfully:", job.id);

    // Return the text response for job result
    return result.text;
  } catch (error) {
    logger.error("❌ [AgentProcessor] Error during processing:", error);
    logger.error("❌ [AgentProcessor] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      agentId,
      jobId: job.id,
    });

    throw error;
  }
};
