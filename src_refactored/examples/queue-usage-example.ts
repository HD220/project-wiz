// src_refactored/examples/queue-usage-example.ts
import { JobEntity } from '@/core/domain/job/job.entity';
import { ProcessorFunction } from '@/core/application/queue/queue.types'; // Assumed path
import { ConsoleLoggerService } from '@/infrastructure/services/logger/console-logger.service';
import { InMemoryJobEventEmitter } from '@/infrastructure/events/in-memory-job-event-emitter';

// --- Imports for the NEW Refactored Queue System (Conceptual) ---
// These classes would be the result of the refactoring based on user's request
// For now, their internal implementation details might differ from current ones.

// Placeholder for the refactored QueueDrizzle (which would encapsulate repository logic)
// For this example, we'll use JobQueueService and assume it's been refactored
// to match the QueueDrizzle API style.
import { JobQueueService as QueueDrizzle } from '@/core/application/queue/job-queue.service';
import { DrizzleJobRepository } from '@/infrastructure/persistence/drizzle/job/drizzle-job.repository'; // Used by QueueDrizzle internally

// Placeholder for the refactored Worker
// For this example, we'll use JobWorkerService and assume its constructor
// and methods match the new desired API.
import { JobWorkerService as Worker } from '@/core/application/queue/job-worker.service';
import { WorkerOptions } from '@/core/application/queue/dtos/worker-options.dto';


import { QueueSchedulerService } from '@/core/application/queue/queue-scheduler.service';
import { IJobOptions } from '@/core/domain/job/value-objects/job-options.vo';
import { JobEventType } from '@/core/application/queue/events/job-event.types';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';

// Drizzle specific imports for example DB
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@/infrastructure/persistence/drizzle/schema';
import path from 'node:path';
import fs from 'node:fs';

// 1. Definir Payloads e Resultados de Exemplo
export interface SimpleJobPayload {
  message: string;
  succeed: boolean;
  idToSucceedOnAttempt?: number;
  targetWorker?: string; // Example: to simulate directing to a specific worker if system supports
}

export interface SimpleJobResult {
  processedMessage: string;
  status: string;
  workerId?: string;
  attemptsMade?: number;
}

// 2. Implementar JobProcessorFunction de Exemplo
// The JobEntity here is a plain data object from the QueueDrizzle's perspective.
// The processor updates its state in memory. The Worker then tells QueueDrizzle about these changes.
export const exampleJobProcessor: ProcessorFunction<SimpleJobPayload, SimpleJobResult> = async (
  job: JobEntity<SimpleJobPayload, SimpleJobResult> // JobEntity is passed by the Worker
): Promise<SimpleJobResult> => {
  const { message, succeed, idToSucceedOnAttempt } = job.payload;
  const jobId = job.id.value;

  console.log(`[Processor][${jobId}] Starting job. Attempt: ${job.attemptsMade}. Message: "${message}"`);
  // These calls now only update the in-memory JobEntity state.
  // The Worker will be responsible for calling queue.updateJobProgress or queue.addJobLog.
  job.addLog('Processor started.', 'INFO');

  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
  job.setProgress(50);
  console.log(`[Processor][${jobId}] Reached 50% progress.`);
  job.addLog('Processing at 50%.', 'INFO');

  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

  if (idToSucceedOnAttempt) {
    if (job.attemptsMade >= idToSucceedOnAttempt) {
      console.log(`[Processor][${jobId}] Job succeeding on attempt ${job.attemptsMade} as configured.`);
      job.setProgress(100);
      job.addLog('Job will succeed on this attempt.', 'INFO');
      return {
        processedMessage: `Job "${message}" succeeded on attempt ${job.attemptsMade}.`,
        status: 'SUCCESS',
        attemptsMade: job.attemptsMade,
      };
    } else {
      console.log(`[Processor][${jobId}] Job configured to fail on attempt ${job.attemptsMade}.`);
      job.addLog(`Job failing on attempt ${job.attemptsMade} as per configuration.`, 'WARN');
      throw new Error(`Job "${message}" failed intentionally on attempt ${job.attemptsMade}.`);
    }
  } else if (!succeed) {
    console.log(`[Processor][${jobId}] Job configured to fail permanently.`);
    job.addLog('Job failing permanently as per configuration.', 'ERROR');
    throw new Error(`Job "${message}" failed permanently as configured.`);
  }

  job.setProgress(100);
  job.addLog('Job completed successfully.', 'INFO');
  console.log(`[Processor][${jobId}] Job completed successfully.`);
  return {
    processedMessage: `Successfully processed: ${message}`,
    status: 'SUCCESS',
    attemptsMade: job.attemptsMade,
  };
};

async function runExample() {
  console.log("===== Queue System Usage Example (Idealized API Style) =====");

  const EXAMPLE_QUEUE_NAME = "my-processing-queue";
  const EXAMPLE_DB_FILE_NAME = "data/example-ideal-queue.sqlite3";
  const MIGRATIONS_FOLDER = path.resolve(process.cwd(), 'src_refactored/infrastructure/persistence/drizzle/migrations');

  const logger = new ConsoleLoggerService('QueueExampleIdeal');
  const jobEventEmitter = new InMemoryJobEventEmitter();

  // Setup DB (this part remains largely the same)
  const dbFilePath = path.resolve(EXAMPLE_DB_FILE_NAME);
  const dbDir = path.dirname(dbFilePath);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  if (fs.existsSync(dbFilePath)) fs.unlinkSync(dbFilePath);
  const sqlite = new Database(dbFilePath);
  sqlite.pragma('journal_mode = WAL');
  const db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, { schema, logger: false });
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  logger.info(`Example SQLite DB initialized at ${dbFilePath}`);

  // Instantiate QueueDrizzle (which would internally use DrizzleJobRepository and db)
  // For this example, we still instantiate DrizzleJobRepository separately and pass it,
  // as JobQueueService (our stand-in for QueueDrizzle) expects it.
  // A true QueueDrizzle would encapsulate this.
  const jobRepository = new DrizzleJobRepository(db);
  const myQueue = new QueueDrizzle<SimpleJobPayload, SimpleJobResult>(
    EXAMPLE_QUEUE_NAME,
    jobRepository,
    jobEventEmitter,
    // logger.getSubLogger({ name: `QueueDrizzle-${EXAMPLE_QUEUE_NAME}` }) // Assuming QueueDrizzle takes a logger
  );
  logger.info(`QueueDrizzle for queue [${EXAMPLE_QUEUE_NAME}] initialized.`);

  // Scheduler still needed, and it would interact with QueueDrizzle's repository-like methods
  const scheduler = new QueueSchedulerService(
    jobRepository, // Scheduler would use the repository methods now part of QueueDrizzle
    jobEventEmitter,
    logger.getSubLogger({ name: 'QueueScheduler' }),
    { intervalMs: 1500, processingLimit: 5 }
  );
  logger.info("QueueSchedulerService initialized and started.");

  // Worker instantiation using the new API style
  // The Worker class itself would need to be refactored to accept QueueDrizzle
  // and use its methods (getNextJobToProcess, markJobAsCompleted, etc.)
  const workerOpts: WorkerOptions = {
    concurrency: 2,
    lockDuration: 15000, // 15s
    lockRenewTime: 7000,  // 7s
  };
  const myWorker = new Worker<SimpleJobPayload, SimpleJobResult>(
    myQueue, // <<<< Passing the QueueDrizzle instance
    exampleJobProcessor,
    workerOpts,
    // These would NOT be passed if Worker only takes QueueDrizzle
    // jobRepository,
    // jobEventEmitter,
    logger.getSubLogger({ name: 'MyWorker' })
  );
  logger.info(`Worker [${myWorker.id}] for queue [${myQueue.name}] initialized.`);

  // Register event listeners on the global emitter
  Object.values(JobEventType).forEach(eventName => {
    jobEventEmitter.on(eventName, (payload: any) => {
      if (payload.queueName && payload.queueName !== EXAMPLE_QUEUE_NAME) return;
      logger.info(`EVENT [${eventName}] for ${payload.jobId}: ${JSON.stringify(payload.error || payload.result || payload.progress || payload)}`);
    });
  });

  // Add jobs
  logger.info("Adding jobs...");
  const job1 = await myQueue.add("SuccessJob_1", { message: "This should succeed", succeed: true });
  const job2 = await myQueue.add("RetrySuccessJob_1", { message: "Fail once, then succeed", succeed: false, idToSucceedOnAttempt: 2 }, { attempts: 3 });
  const job3 = await myQueue.add("PermanentFailJob_1", { message: "This will fail all attempts", succeed: false }, { attempts: 2 });
  const job4 = await myQueue.add("DelayedJob_1", { message: "Delayed by 3s, then succeed", succeed: true }, { delay: 3000 });

  if(job1.isError()) logger.error("Failed to add job1", job1.error);
  if(job2.isError()) logger.error("Failed to add job2", job2.error);
  // ... and so on for other jobs

  logger.info("Jobs added. Starting worker...");
  myWorker.run(); // If worker doesn't autorun

  logger.info("Example running for 20 seconds to observe job processing...");
  await new Promise(resolve => setTimeout(resolve, 20000));

  logger.info("Example finished. Closing services...");
  await myWorker.close();
  scheduler.stop();
  sqlite.close();
  logger.info("Services closed. Exiting.");
  process.exit(0);
}

if (require.main === module) {
  runExample().catch(err => {
    console.error("CRITICAL ERROR IN EXAMPLE:", err);
    process.exit(1);
  });
}

export default runExample;
