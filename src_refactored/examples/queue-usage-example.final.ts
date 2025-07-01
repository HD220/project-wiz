// src_refactored/examples/queue-usage-example.final.ts
import { WorkerService } from "@/core/application/worker/worker.service";
import { JobEntity } from "@/core/domain/job/job.entity";

import { db } from "@/infrastructure/persistence/drizzle/drizzle.client";
import { DrizzleJobRepository } from "@/infrastructure/persistence/drizzle/job/drizzle-job.repository";
import { QueueService } from "@/infrastructure/queue/drizzle/queue.service";

type EmailJobPayload = { email: string };
type EmailJobResult = { status: string };

function setupProcessor(): (
  job: JobEntity<EmailJobPayload, EmailJobResult>
) => Promise<EmailJobResult> {
  return async (
    job: JobEntity<EmailJobPayload, EmailJobResult>
  ): Promise<EmailJobResult> => {
    process.stdout.write(
      `[Worker] Processing job ${job.id.value} (attempt ${job.attemptsMade}) for email: ${job.payload.email}\n`
    );

    for (let progressValue = 0; progressValue <= 100; progressValue += 25) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      job.updateProgress(progressValue);
      job.addLog(`Progress updated to ${progressValue}%`);
      process.stdout.write(
        `[Worker] Job ${job.id.value} progress: ${progressValue}%\n`
      );
    }

    if (job.attemptsMade < 3 && job.payload.email === "retry@example.com") {
      job.addLog("Simulating transient failure for retry job.", "ERROR");
      process.stdout.write(
        `[Worker] Job ${job.id.value} (retry job) failed. Attempts made: ${job.attemptsMade}\n`
      );
      throw new Error("Simulated transient error");
    }

    if (job.payload.email === "fail@example.com") {
      job.addLog("Simulating permanent failure.", "ERROR");
      process.stdout.write(
        `[Worker] Job ${job.id.value} (fail job) failed permanently.\n`
      );
      throw new Error("Simulated permanent error");
    }

    job.addLog("Job completed successfully.", "INFO");
    process.stdout.write(
      `[Worker] Job ${job.id.value} completed successfully.\n`
    );
    return { status: "Email sent" };
  };
}

function setupEventListeners(
  queue: QueueService<EmailJobPayload, EmailJobResult>,
  worker: WorkerService<EmailJobPayload, EmailJobResult>
): void {
  queue.on("job.added", (job) =>
    process.stdout.write(
      `[Queue] Job added: ${job.id.value} (Name: ${job.name}, Status: ${job.status})\n`
    )
  );
  queue.on("job.completed", (job) =>
    process.stdout.write(
      `[Queue] Job completed: ${job.id.value} (Result: ${JSON.stringify(job.returnValue)})\n`
    )
  );
  queue.on("job.failed", (job) =>
    process.stdout.write(
      `[Queue] Job failed: ${job.id.value} (Reason: ${job.failedReason}, Attempts: ${job.attemptsMade})\n`
    )
  );
  queue.on("job.active", (job) =>
    process.stdout.write(`[Queue] Job ${job.id.value} is now active.\n`)
  );
  queue.on("job.stalled", (job) =>
    process.stdout.write(`[Queue] Job ${job.id.value} stalled and re-queued.\n`)
  );
  queue.on("job.progress", (job) =>
    process.stdout.write(
      `[Queue] Job ${job.id.value} progress updated to ${job.progress}\n`
    )
  );
  queue.on("job.log", (job) =>
    process.stdout.write(
      `[Queue] Job ${job.id.value} log: ${job.logs[job.logs.length - 1].message}\n`
    )
  );

  worker.on("worker.job.active", (job) =>
    process.stdout.write(
      `[Worker] Worker started processing job: ${job.id.value}\n`
    )
  );
  worker.on("worker.job.processed", (job) =>
    process.stdout.write(
      `[Worker] Worker finished processing job: ${job.id.value}\n`
    )
  );
  worker.on("worker.job.errored", (job, error) =>
    process.stdout.write(
      `[Worker] Worker encountered error for job ${job.id.value}: ${error.message}\n`
    )
  );
}

async function addJobsAndRun(
  queue: QueueService<EmailJobPayload, EmailJobResult>,
  worker: WorkerService<EmailJobPayload, EmailJobResult>
): Promise<void> {
  await queue.add("send-email", { email: "success@example.com" });
  await queue.add(
    "send-email",
    { email: "delayed@example.com" },
    { delay: 7000 }
  );
  await queue.add(
    "send-email",
    { email: "retry@example.com" },
    { attempts: 3, backoff: { type: "exponential", delay: 1000 } }
  );
  await queue.add("send-email", { email: "fail@example.com" }, { attempts: 1 });

  worker.run();
  queue.startMaintenance();

  process.stdout.write(
    "Queue and Worker started. Waiting for jobs to complete...\n"
  );

  setTimeout(async () => {
    process.stdout.write("Shutting down worker and queue...\n");
    await worker.close();
    await queue.close();
    process.stdout.write("Worker and queue closed. Exiting.\n");
    process.exit(0);
  }, 60000); // Keep alive for 60 seconds
}

async function main() {
  const jobRepository = new DrizzleJobRepository(db);
  const queue = new QueueService<EmailJobPayload, EmailJobResult>(
    "default",
    jobRepository
  );
  const processor = setupProcessor();
  const worker = new WorkerService(queue, processor, {
    concurrency: 2,
    lockDuration: 15000,
    lockRenewTimeBuffer: 5000,
  });

  setupEventListeners(queue, worker);
  await addJobsAndRun(queue, worker);
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Application specific logging, throwing an error, or other logic here
  process.exit(1);
});

main().catch((err) => {
  console.error("Error in main execution:", err);
  process.exit(1);
});
