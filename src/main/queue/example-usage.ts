// Example usage of the refactored queue/worker system
// Optimized for single worker with 15 concurrent jobs

import { getLogger } from "@/shared/services/logger/config";

import { Queue, Worker } from "./index";

import type { ProcessorFunction } from "./index";

const logger = getLogger("queue-example");

// Example job processor function
const processLLMJob: ProcessorFunction<unknown, string> = async ({
  id,
  data,
}) => {
  logger.info(`Processing LLM job ${id}:`, data);

  // Simulate LLM API call
  const delay = Math.random() * 5000 + 1000; // 1-6 seconds
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Simulate occasional failures for retry testing
  if (Math.random() < 0.1) {
    throw new Error("Simulated LLM API failure");
  }

  return `LLM response for job ${id}`;
};

// Example usage
export async function exampleQueueUsage() {
  // Create queue and worker
  const llmQueue = new Queue("llm-processing");
  const worker = new Worker("llm-processing", processLLMJob, {
    concurrency: 15, // Process up to 15 jobs concurrently
    pollInterval: 500, // Poll every 500ms for responsiveness
    stuckJobTimeout: 30000, // 30s timeout for stuck jobs
  });

  // Setup event listeners
  worker.on("active", ({ id }) => {
    logger.info(`Job ${id} started processing`);
  });

  worker.on("completed", ({ id, result, duration }) => {
    logger.info(`Job ${id} completed in ${duration}ms:`, result);
  });

  worker.on("failed", ({ id, error, duration }) => {
    logger.warn(`Job ${id} failed after ${duration}ms:`, error);
  });

  worker.on("stalled", ({ id }) => {
    logger.error(`Job ${id} is stalled and will be retried`);
  });

  // Start the worker
  logger.info("Starting optimized queue worker...");
  const workerPromise = worker.run();

  // Add some jobs
  logger.info("Adding jobs to queue...");
  const jobs = [];

  for (let jobIndex = 1; jobIndex <= 25; jobIndex++) {
    const jobData = {
      prompt: `Test prompt ${jobIndex}`,
      model: "gpt-4",
      temperature: 0.7,
    };

    const job = await llmQueue.add(jobData, {
      priority: jobIndex <= 5 ? 10 : 1, // High priority for first 5 jobs
      attempts: 3,
      delay: jobIndex > 20 ? 2000 : 0, // Delay last 5 jobs by 2 seconds
    });

    jobs.push(job);
    logger.debug(`Added job ${jobIndex} with ID: ${job.id}`);
  }

  // Monitor queue stats
  const statsInterval = setInterval(async () => {
    const queueStats = await llmQueue.getStats();
    const workerStats = worker.getStats();

    logger.info("Queue Stats:", queueStats);
    logger.info("Worker Stats:", workerStats);

    // Stop monitoring when all jobs are done
    if (
      queueStats.waiting === 0 &&
      queueStats.active === 0 &&
      queueStats.delayed === 0
    ) {
      clearInterval(statsInterval);
      logger.info("All jobs completed! Stopping worker...");
      await worker.close();
    }
  }, 2000);

  // Wait for worker to finish (will stop when all jobs are done)
  await workerPromise;

  // Final stats
  const finalStats = await llmQueue.getStats();
  logger.info("Final queue stats:", finalStats);

  // Clean up old completed jobs (keep jobs from last 5 minutes)
  const cleanedCompleted = await llmQueue.clean(5 * 60 * 1000, "completed");
  const cleanedFailed = await llmQueue.clean(5 * 60 * 1000, "failed");

  logger.info(
    `Cleaned up ${cleanedCompleted} completed and ${cleanedFailed} failed jobs`,
  );

  return {
    totalJobs: jobs.length,
    stats: finalStats,
  };
}

// Job data types for different queue examples
interface ImageJobData {
  imageUrl: string;
}

interface TextJobData {
  text: string;
}

interface CodeJobData {
  requirement: string;
}

// Type guards
function isImageJobData(data: unknown): data is ImageJobData {
  return typeof data === "object" && data !== null && "imageUrl" in data;
}

function isTextJobData(data: unknown): data is TextJobData {
  return typeof data === "object" && data !== null && "text" in data;
}

function isCodeJobData(data: unknown): data is CodeJobData {
  return typeof data === "object" && data !== null && "requirement" in data;
}

// Example of using queue for different job types
export async function multiQueueExample() {
  // Different queues for different purposes
  const imageQueue = new Queue("image-processing");
  const textQueue = new Queue("text-analysis");
  const codeQueue = new Queue("code-generation");

  // Image processing worker (CPU intensive, lower concurrency)
  const imageWorker = new Worker(
    "image-processing",
    async ({ id, data }) => {
      logger.info(`Processing image job ${id}`);
      if (!isImageJobData(data)) {
        throw new Error("Invalid image job data");
      }
      // Simulate image processing
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return { processedImageUrl: `processed_${data.imageUrl}` };
    },
    { concurrency: 5 },
  ); // Lower concurrency for CPU intensive tasks

  // Text analysis worker (I/O bound, higher concurrency)
  const textWorker = new Worker(
    "text-analysis",
    async ({ id, data }) => {
      logger.info(`Analyzing text job ${id}`);
      if (!isTextJobData(data)) {
        throw new Error("Invalid text job data");
      }
      // Simulate text analysis API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { sentiment: "positive", confidence: 0.85, text: data.text };
    },
    { concurrency: 15 },
  ); // Full concurrency for I/O bound

  // Code generation worker (LLM calls, medium concurrency)
  const codeWorker = new Worker(
    "code-generation",
    async ({ id, data }) => {
      logger.info(`Generating code job ${id}`);
      if (!isCodeJobData(data)) {
        throw new Error("Invalid code job data");
      }
      // Simulate code generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { generatedCode: `// Generated code for ${data.requirement}` };
    },
    { concurrency: 10 },
  ); // Medium concurrency

  // Start all workers
  const workers = [imageWorker.run(), textWorker.run(), codeWorker.run()];

  // Add jobs to different queues
  await Promise.all([
    imageQueue.add({ imageUrl: "image1.jpg" }),
    textQueue.add({ text: "This is amazing!" }),
    codeQueue.add({ requirement: "Create a login function" }),
  ]);

  logger.info("Multi-queue system running...");

  // For demo purposes, stop after 10 seconds
  setTimeout(async () => {
    await Promise.all([
      imageWorker.close(),
      textWorker.close(),
      codeWorker.close(),
    ]);
  }, 10000);

  await Promise.allSettled(workers);
  logger.info("Multi-queue example completed");
}

// Performance testing function
export async function performanceTest() {
  const queue = new Queue("performance-test");
  const worker = new Worker(
    "performance-test",
    async ({ id }) => {
      // Fast job for performance testing
      await new Promise((resolve) => setTimeout(resolve, 100));
      return `completed-${id}`;
    },
    {
      concurrency: 15,
      pollInterval: 100, // Very fast polling
    },
  );

  let completed = 0;
  let failed = 0;
  const startTime = Date.now();

  worker.on("completed", () => completed++);
  worker.on("failed", () => failed++);

  // Start worker
  const workerPromise = worker.run();

  // Add 100 jobs quickly
  const jobs = [];
  for (let jobCount = 0; jobCount < 100; jobCount++) {
    jobs.push(queue.add({ test: true }));
  }
  await Promise.all(jobs);

  // Wait for completion
  const checkCompletion = setInterval(async () => {
    const stats = await queue.getStats();
    if (stats.waiting === 0 && stats.active === 0) {
      clearInterval(checkCompletion);
      const duration = Date.now() - startTime;

      logger.info(`Performance test completed in ${duration}ms`);
      logger.info(`Processed ${completed} jobs, ${failed} failed`);
      logger.info(
        `Throughput: ${((100 / duration) * 1000).toFixed(2)} jobs/second`,
      );

      await worker.close();
    }
  }, 100);

  await workerPromise;
}
