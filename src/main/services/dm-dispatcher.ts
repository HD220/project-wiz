import { eq, and, isNull } from "drizzle-orm";

import { createDatabaseConnection } from "@/shared/config/database";

const { getDatabase } = createDatabaseConnection(true);
import { getLogger } from "@/shared/services/logger/config";
import { QueueClient } from "@/shared/services/queue-client";

import { dmParticipantsTable } from "@/main/schemas/dm-conversation.schema";
import { usersTable } from "@/main/schemas/user.schema";

const logger = getLogger("dm-dispatcher");

export class DMDispatcher {
  /**
   * Simple dispatcher for DM messages - no LLM, just route to all agents in conversation
   */
  static async dispatchMessage(data: {
    messageId: string;
    conversationId: string;
    authorId: string;
    content: string;
    timestamp: Date;
  }): Promise<void> {
    logger.debug("Dispatching DM message", {
      messageId: data.messageId,
      conversationId: data.conversationId,
      authorId: data.authorId,
    });

    const db = getDatabase();

    try {
      // Get all participants in this DM conversation (excluding message author)
      const participants = await db
        .select({
          participantId: dmParticipantsTable.participantId,
          userType: usersTable.type,
          userName: usersTable.name,
        })
        .from(dmParticipantsTable)
        .innerJoin(
          usersTable,
          eq(dmParticipantsTable.participantId, usersTable.id),
        )
        .where(
          and(
            eq(dmParticipantsTable.dmConversationId, data.conversationId),
            isNull(usersTable.deactivatedAt),
          ),
        );

      // Filter to get only agents (excluding the message author)
      const agents = participants.filter(
        (p) => p.userType === "agent" && p.participantId !== data.authorId,
      );

      if (agents.length === 0) {
        logger.debug("No agents found in DM conversation", {
          conversationId: data.conversationId,
          totalParticipants: participants.length,
          participants: participants.map((p) => ({
            id: p.participantId,
            type: p.userType,
          })),
        });
        return;
      }

      logger.debug("Found agents to dispatch to", {
        agentCount: agents.length,
        agents: agents.map((a) => ({ id: a.participantId, name: a.userName })),
      });

      // Create jobs for each agent (simple dispatch - no delay, no LLM decision)
      const dispatchPromises = agents.map(async (agent) => {
        const agentQueue = new QueueClient(`agent-${agent.participantId}`);

        try {
          const result = await agentQueue.add({
            agentId: agent.participantId,
            messageId: data.messageId,
            conversationId: data.conversationId,
            conversationType: "dm",
            type: "message_response",
            context: {
              userMessage: data.content,
              authorId: data.authorId,
              timestamp: data.timestamp,
            },
          });

          logger.info("Created job for agent", {
            agentId: agent.participantId,
            agentName: agent.userName,
            jobId: result.jobId,
            conversationId: data.conversationId,
          });

          return result;
        } catch (error) {
          logger.error("Failed to create job for agent", {
            agentId: agent.participantId,
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      });

      // Execute all dispatches in parallel
      await Promise.all(dispatchPromises);

      logger.info("DM message dispatched successfully", {
        messageId: data.messageId,
        conversationId: data.conversationId,
        agentsNotified: agents.length,
      });
    } catch (error) {
      logger.error("Failed to dispatch DM message", {
        messageId: data.messageId,
        conversationId: data.conversationId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
