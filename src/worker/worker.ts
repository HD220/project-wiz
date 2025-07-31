// Worker process entry point for autonomous LLM job processing
import { Worker } from "./queue/worker";
import { responseGenerator } from "./processors/response-generator";

console.log("🔄 LLM Worker process starting...");

const processor = new Worker("llm-jobs", responseGenerator);

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

// Start the worker
main().catch((error) => {
  console.error("💥 Fatal worker error:", error);
  process.exit(1);
});