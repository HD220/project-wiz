// Worker process entry point for autonomous LLM job processing
import { Worker } from "./queue/worker";
import { responseGenerator } from "./processors/response-generator";
import { MessageHandler } from "./queue/message-handler";

console.log("🔄 LLM Worker process starting...");

const processor = new Worker("llm-jobs", responseGenerator);
const messageHandler = new MessageHandler();

async function main() {
  try {
    console.log("🚀 LLM Worker initialized");
    
    // Start job processing loop
    await processor.start();
  } catch (error) {
    console.error("💥 Worker startup failed:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down worker...");
  await processor.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🛑 Shutting down worker...");
  await processor.stop();
  process.exit(0);
});

// Handle messages from main process
process.on("message", async (message: any) => {
  console.log("🔴 [WORKER] Received message from main process:", message);
  try {
    console.log("🔴 [WORKER] Processing message with messageHandler");
    const result = await messageHandler.handleMessage(message);
    console.log("🔴 [WORKER] Message processed successfully, result:", result);
    
    if (process.send) {
      const response = { success: true, result };
      console.log("🔴 [WORKER] Sending response back to main:", response);
      process.send(response);
    } else {
      console.error("🔴 [WORKER] process.send is not available!");
    }
  } catch (error) {
    console.error("🔴 [WORKER] Error processing message:", error);
    
    if (process.send) {
      const response = { success: false, error: error instanceof Error ? error.message : String(error) };
      console.log("🔴 [WORKER] Sending error response back to main:", response);
      process.send(response);
    } else {
      console.error("🔴 [WORKER] process.send is not available for error response!");
    }
  }
});

// Start the worker
main().catch((error) => {
  console.error("💥 Fatal worker error:", error);
  process.exit(1);
});