// Worker process entry point for autonomous LLM job processing
import { getLogger } from "@/shared/services/logger/config";

import { responseGenerator } from "./processors/response-generator";
import { MessageHandler } from "./queue/message-handler";
import { Worker } from "./queue/worker";

const logger = getLogger("worker-main");

logger.info("🔄 LLM Worker process starting...");
logger.info("🔄 Process info:", {
  pid: process.pid,
  argv: process.argv,
  isConnectedToParent: !!process.send,
  parentProcess: process.ppid,
});

const processor = new Worker("llm-jobs", responseGenerator);
const messageHandler = new MessageHandler();

async function main() {
  try {
    logger.info("🚀 LLM Worker initialized");

    // Start job processing loop
    await processor.start();
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
      logger.debug("🔴 [WORKER] Processing message with messageHandler");
      const result = await messageHandler.handleMessage(message);
      logger.debug(
        "🔴 [WORKER] Message processed successfully, result:",
        result,
      );

      const response = { success: true, result };
      logger.debug(
        "🔴 [WORKER] Sending response back via parentPort:",
        response,
      );
      process.parentPort?.postMessage(response);
    } catch (error) {
      logger.error("🔴 [WORKER] Error processing message:", error);

      const response = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
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

// Handle graceful shutdown
process.on("SIGINT", async () => {
  logger.info("🛑 Shutting down worker...");
  await processor.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("🛑 Shutting down worker...");
  await processor.stop();
  process.exit(0);
});

// Remove old IPC handler - now using MessagePort

// Start the worker
main().catch((error) => {
  logger.error("💥 Fatal worker error:", error);
  process.exit(1);
});
