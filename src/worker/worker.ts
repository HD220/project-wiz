// Worker process entry point for autonomous LLM job processing
import { Worker } from "./queue/worker";
import { responseGenerator } from "./processors/response-generator";
import { MessageHandler } from "./queue/message-handler";

console.log("🔄 LLM Worker process starting...");
console.log("🔄 Process info:", {
  pid: process.pid,
  argv: process.argv,
  isConnectedToParent: !!process.send,
  parentProcess: process.ppid
});

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

// Handle messages from main process via parentPort
if (process.parentPort) {
  console.log("🔄 parentPort available, setting up IPC");
  
  process.parentPort.on("message", async (event) => {
    const message = event.data;
    console.log("🔴 [WORKER] Received message via parentPort:", message);
    
    try {
      console.log("🔴 [WORKER] Processing message with messageHandler");
      const result = await messageHandler.handleMessage(message);
      console.log("🔴 [WORKER] Message processed successfully, result:", result);
      
      const response = { success: true, result };
      console.log("🔴 [WORKER] Sending response back via parentPort:", response);
      process.parentPort?.postMessage(response);
    } catch (error) {
      console.error("🔴 [WORKER] Error processing message:", error);
      
      const response = { success: false, error: error instanceof Error ? error.message : String(error) };
      console.log("🔴 [WORKER] Sending error response back via parentPort:", response);
      process.parentPort?.postMessage(response);
    }
  });
} else {
  console.error("🚨 No parentPort available - worker IPC not working!");
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

// Remove old IPC handler - now using MessagePort

// Start the worker
main().catch((error) => {
  console.error("💥 Fatal worker error:", error);
  process.exit(1);
});