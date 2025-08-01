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
let messagePort: MessagePort | null = null;

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

// Handle MessagePort setup from main process
process.on("message", (message: any, handle?: any) => {
  console.log("🔄 Received setup message from main process:", message);
  
  if (message.port && handle) {
    console.log("🔄 Setting up MessagePort for IPC");
    messagePort = handle;
    
    // Set up message handler for MessagePort
    messagePort.on("message", async (data: any) => {
      console.log("🔴 [WORKER] Received message via MessagePort:", data);
      try {
        console.log("🔴 [WORKER] Processing message with messageHandler");
        const result = await messageHandler.handleMessage(data);
        console.log("🔴 [WORKER] Message processed successfully, result:", result);
        
        if (messagePort) {
          const response = { success: true, result };
          console.log("🔴 [WORKER] Sending response back via MessagePort:", response);
          messagePort.postMessage(response);
        }
      } catch (error) {
        console.error("🔴 [WORKER] Error processing message:", error);
        
        if (messagePort) {
          const response = { success: false, error: error instanceof Error ? error.message : String(error) };
          console.log("🔴 [WORKER] Sending error response back via MessagePort:", response);
          messagePort.postMessage(response);
        }
      }
    });
    
    messagePort.start();
    console.log("🔄 MessagePort started and ready for messages");
  }
});

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