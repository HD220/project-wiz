// Worker process entry point for autonomous LLM job processing
import { getLogger } from "@/shared/services/logger/config";
import { createDatabaseConnection } from "@/shared/config/database";
import { agentsTable } from "@/main/schemas/agent.schema";
import { usersTable } from "@/main/schemas/user.schema";
import { eq, and, isNull } from "drizzle-orm";

import { agentProcessor } from "./processors/agent-processor";
import { MessageHandler } from "./queue/message-handler";
import { Worker } from "./queue/worker";
import { MainProcessAPI } from "./services/main-process-api";


const { getDatabase } = createDatabaseConnection(true);
const logger = getLogger("worker-main");

logger.info("🔄 LLM Worker process starting...");
logger.info("🔄 Process info:", {
  pid: process.pid,
  argv: process.argv,
  isConnectedToParent: !!process.send,
  parentProcess: process.ppid,
});

const messageHandler = new MessageHandler();

// Keep track of individual agent processors (for graceful shutdown)
const agentProcessors = new Map<string, Worker>();

/**
 * Get all active agents to create individual workers
 */
async function getActiveAgents() {
  const db = getDatabase();

  const activeAgents = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
    })
    .from(agentsTable)
    .innerJoin(usersTable, eq(agentsTable.id, usersTable.id))
    .where(
      and(
        isNull(usersTable.deactivatedAt), // User not deactivated
        eq(usersTable.type, "agent"), // Only agents
      ),
    );

  return activeAgents;
}

/**
 * Create individual workers for each active agent
 */
async function createAgentWorkers() {
  const activeAgents = await getActiveAgents();

  logger.info(
    `🤖 Found ${activeAgents.length} active agents, creating individual workers...`,
  );

  for (const agent of activeAgents) {
    const queueName = `agent-${agent.id}`;
    const worker = new Worker(queueName, agentProcessor);
    agentProcessors.set(agent.id, worker);

    logger.info(
      `🤖 Created worker for agent ${agent.name} (${agent.id}) -> queue: ${queueName}`,
    );
  }
}

async function main() {
  try {
    logger.info("🚀 Worker initialized");

    // Create individual workers for each active agent
    await createAgentWorkers();

    // Start all processors
    const processors = Array.from(agentProcessors.values()).map((worker) =>
      worker.start(),
    );

    logger.info(`🚀 Starting ${processors.length} job processors...`);

    // Wait for all processors to start
    await Promise.all(processors);
  } catch (error) {
    logger.error("💥 Worker startup failed:", error);
    process.exit(1);
  }
}

// Handle messages from main process via parentPort
if (process.parentPort) {
  logger.info("🔄 parentPort available, setting up IPC");

  process.parentPort.on("message", async (event) => {
    const message = event.data;
    logger.debug("🔴 [WORKER] Received message via parentPort:", message);

    try {
      // Check if this is a response to one of our IPC requests
      if (message.requestId && (message.hasOwnProperty('success') || message.hasOwnProperty('error'))) {
        const handled = MainProcessAPI.handleIPCResponse(message);
        if (handled) {
          logger.debug("🔴 [WORKER] IPC response handled by MainProcessAPI");
          return;
        }
      }

      // Handle domain operation requests (from main process TO worker)
      if (message.requestId && message.action) {
        logger.debug("🔴 [WORKER] Processing domain operation request:", message.action);
        const result = await handleDomainOperation(message);
        
        const response = {
          success: true,
          result,
          requestId: message.requestId,
        };
        logger.debug("🔴 [WORKER] Sending domain operation response:", response);
        process.parentPort?.postMessage(response);
        return;
      }

      // Handle queue operations (add jobs, get stats, etc)
      logger.debug("🔴 [WORKER] Processing queue operation");
      const result = await messageHandler.handleMessage(message);
      logger.debug("🔴 [WORKER] Queue operation completed:", result);
      
      const response = { success: true, result };
      logger.debug("🔴 [WORKER] Sending queue response:", response);
      process.parentPort?.postMessage(response);
    } catch (error) {
      logger.error("🔴 [WORKER] Error processing message:", error);

      const response = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        requestId: message.requestId, // Include requestId if present for domain operations
      };
      logger.debug(
        "🔴 [WORKER] Sending error response back via parentPort:",
        response,
      );
      process.parentPort?.postMessage(response);
    }
  });
} else {
  logger.error("🚨 No parentPort available - worker IPC not working!");
}

/**
 * Handle domain operations requested by agent processors
 */
async function handleDomainOperation(message: {
  requestId: string;
  action: string;
  payload: any;
}): Promise<any> {
  const { action, payload } = message;

  switch (action) {
    case "sendDMMessage":
      return await handleSendDMMessage(payload);

    case "sendChannelMessage":
      return await handleSendChannelMessage(payload);

    case "getDMConversation":
      return await handleGetDMConversation(payload);

    case "getDecryptedApiKey":
      return await handleGetDecryptedApiKey(payload);

    default:
      throw new Error(`Unknown domain operation: ${action}`);
  }
}

/**
 * Handle DM message sending by using DM queries directly
 */
async function handleSendDMMessage(payload: {
  dmId: string;
  content: string;
  authorId: string;
}): Promise<{ messageId: string }> {
  // Import and use the DM queries directly
  const { sendDMMessage } = await import("@/main/ipc/dm/queries");

  // Call sendDMMessage directly with proper parameters
  const result = await sendDMMessage({
    authorId: payload.authorId,
    sourceType: "dm",
    sourceId: payload.dmId,
    content: payload.content,
  });

  return { messageId: result.id };
}

/**
 * Handle channel message sending by using Channel queries directly
 */
async function handleSendChannelMessage(payload: {
  channelId: string;
  content: string;
  authorId: string;
}): Promise<{ messageId: string }> {
  // Import and use the channel queries directly
  const { sendChannelMessage } = await import("@/main/ipc/channel/queries");

  // Call sendChannelMessage directly with proper parameters
  const result = await sendChannelMessage({
    sourceType: "channel",
    sourceId: payload.channelId,
    ownerId: payload.authorId, // For now assume author owns the channel (TODO: get actual owner)
    authorId: payload.authorId,
    content: payload.content,
  });

  return { messageId: result.id };
}

/**
 * Handle DM conversation retrieval
 */
async function handleGetDMConversation(payload: {
  dmId: string;
  ownerId: string;
}): Promise<any> {
  const { findDMConversation } = await import("@/main/ipc/dm/queries");

  const result = await findDMConversation(payload.dmId, payload.ownerId);

  return result;
}

/**
 * Handle decrypted API key retrieval
 */
async function handleGetDecryptedApiKey(payload: {
  providerId: string;
  ownerId: string;
}): Promise<{ apiKey: string }> {
  const { getDecryptedApiKey } = await import("@/main/ipc/llm-provider/queries");

  const decryptedApiKey = await getDecryptedApiKey(
    payload.providerId,
    payload.ownerId,
  );

  return { apiKey: decryptedApiKey };
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  logger.info("🛑 Shutting down worker...");

  // Stop all individual agent workers
  const stopPromises = Array.from(agentProcessors.values()).map((worker) =>
    worker.stop(),
  );

  await Promise.all(stopPromises);
  logger.info("🛑 All processors stopped");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("🛑 Shutting down worker...");

  // Stop all individual agent workers
  const stopPromises = Array.from(agentProcessors.values()).map((worker) =>
    worker.stop(),
  );

  await Promise.all(stopPromises);
  logger.info("🛑 All processors stopped");
  process.exit(0);
});

// Remove old IPC handler - now using MessagePort

// Start the worker
main().catch((error) => {
  logger.error("💥 Fatal worker error:", error);
  process.exit(1);
});
