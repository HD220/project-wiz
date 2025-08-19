import { Queue, Worker } from "../index";
import { processAgentResponse, type AgentResponseJobData, type AgentResponseResult } from "./agent-response.processor";

import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("queue.processors");

// Queue instances
let agentResponseQueue: Queue | null = null;
let agentResponseWorker: Worker<AgentResponseJobData, AgentResponseResult> | null = null;

/**
 * Get or create the agent response queue
 */
export function getAgentResponseQueue(): Queue {
  if (!agentResponseQueue) {
    agentResponseQueue = new Queue("agent-response");
    logger.debug("Agent response queue created");
  }
  return agentResponseQueue;
}

/**
 * Start the agent response worker
 */
export async function startAgentResponseWorker(): Promise<void> {
  if (agentResponseWorker) {
    logger.warn("Agent response worker already running");
    return;
  }

  agentResponseWorker = new Worker("agent-response", processAgentResponse, {
    concurrency: 10, // Moderate concurrency for LLM calls
    minPollInterval: 1000, // 1s minimum interval when jobs are available
    maxPollInterval: 15000, // 15s maximum interval when idle
    stuckJobTimeout: 30000, // 30s timeout for stuck jobs
    heartbeatInterval: 10000, // 10s heartbeat for active jobs
  });

  // Setup event listeners
  agentResponseWorker.on("active", ({ id, data }) => {
    logger.info("Agent response job started", { jobId: id, agentId: data?.agentId });
  });

  agentResponseWorker.on("completed", ({ id, result, duration }) => {
    logger.info("Agent response job completed", { 
      jobId: id, 
      duration,
      messageId: result?.messageId 
    });
  });

  agentResponseWorker.on("failed", ({ id, error, duration }) => {
    logger.error("Agent response job failed", { jobId: id, duration, error });
  });

  agentResponseWorker.on("stalled", ({ id }) => {
    logger.warn("Agent response job stalled", { jobId: id });
  });

  // Start the worker
  logger.info("Starting agent response worker...");
  agentResponseWorker.run().catch((error) => {
    logger.error("Agent response worker error:", error);
  });
}

/**
 * Stop the agent response worker
 */
export async function stopAgentResponseWorker(): Promise<void> {
  if (agentResponseWorker) {
    logger.info("Stopping agent response worker...");
    await agentResponseWorker.close();
    agentResponseWorker = null;
    logger.info("Agent response worker stopped");
  }
}

/**
 * Get worker stats
 */
export function getWorkerStats() {
  return {
    agentResponse: agentResponseWorker ? agentResponseWorker.getStats() : null,
  };
}