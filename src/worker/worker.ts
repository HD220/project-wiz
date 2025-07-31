// Worker process entry point for autonomous LLM job processing
import { JobProcessor } from "./features/llm-jobs/llm-jobs.service";

console.log("🔄 LLM Worker process starting...");

const processor = new JobProcessor();

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