import { getLogger } from "../../../infrastructure/logger";
import { findAgentById } from "../../agents/functions/agent.functions";
import { TextGenerationService } from "../../llm/text-generation.service";

import { findConversationById } from "./conversation.functions";
import {
  createDirectMessage,
  getConversationMessages,
} from "./direct-message.functions";

import type { MessageDto } from "../../../../shared/types/message.types";
import type { CoreMessage } from "ai";

const logger = getLogger("AIMessagingFunctions");

export async function processUserMessage(
  conversationId: string,
  userMessage: string,
  userId: string = "user",
): Promise<MessageDto | null> {
  try {
    const _savedUserMessage = await createDirectMessage({
      content: userMessage,
      senderId: userId,
      senderName: "User",
      senderType: "user",
      conversationId,
    });

    const conversation = await findConversationById(conversationId);
    if (!conversation) {
      return null;
    }

    const agentId = extractAgentFromParticipants(
      conversation.participants,
      userId,
    );
    if (!agentId) {
      return null;
    }

    const agent = await findAgentById(agentId);
    if (!agent?.isValidForExecution()) {
      return null;
    }

    const conversationHistory = await buildConversationContext(conversationId);
    const aiResponse = await generateAgentResponse(
      agent,
      conversationHistory,
      userMessage,
    );

    if (!aiResponse) {
      return null;
    }

    return await createDirectMessage({
      content: aiResponse,
      senderId: agentId,
      senderName: agent.getName(),
      senderType: "agent",
      conversationId,
    });
  } catch (error) {
    logger.error("Error processing user message", { error });
    return null;
  }
}

function extractAgentFromParticipants(
  participants: string[],
  userId: string,
): string | null {
  return participants.find((participant) => participant !== userId) || null;
}

async function buildConversationContext(
  conversationId: string,
): Promise<CoreMessage[]> {
  const messages = await getConversationMessages(conversationId, 20, 0);

  return messages.reverse().map((msg) => ({
    role:
      msg.senderType === "user" ? ("user" as const) : ("assistant" as const),
    content: msg.content,
  }));
}

async function generateAgentResponse(
  agent: import("../../agents/entities").Agent,
  conversationHistory: CoreMessage[],
  currentMessage: string,
): Promise<string | null> {
  try {
    const textGenService = new TextGenerationService();

    const messages: CoreMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: currentMessage,
      },
    ];

    const systemPrompt = agent.generateSystemPrompt();
    const defaultProvider = await textGenService.getDefaultProvider();

    return await textGenService.generateText(
      defaultProvider!,
      messages,
      systemPrompt,
    );
  } catch (error) {
    logger.error("Error generating agent response", { error });
    return null;
  }
}
