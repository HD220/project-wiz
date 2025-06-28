// src_refactored/examples/queue-usage-example.ts
import fs from 'node:fs';
import path from 'node:path';

import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import { JobEventType } from '@/core/application/queue/events/job-event.types'; // JobEventPayloadMap removed
import { JobQueueService } from '@/core/application/queue/job-queue.service';
import { ConsoleLoggerService } from '@/infrastructure/services/logger/console-logger.service';
import { InMemoryJobEventEmitter } from '@/infrastructure/events/in-memory-job-event-emitter';
import { DrizzleJobRepository } from '@/infrastructure/persistence/drizzle/job/drizzle-job.repository';

import { JobWorkerService } from '@/core/application/queue/job-worker.service';
import { QueueSchedulerService } from '@/core/application/queue/queue-scheduler.service';
import { ProcessorFunction } from '@/core/application/queue/queue.types';
import { JobEntity } from '@/core/domain/job/job.entity';
// import { IJobOptions } from '@/core/domain/job/value-objects/job-options.vo'; // Unused

// Drizzle specific imports for example DB

import * as schema from '@/infrastructure/persistence/drizzle/schema'; // All tables


// 1. Definir Payloads e Resultados de Exemplo
export interface SimpleJobPayload {
  message: string;
  succeed: boolean;
  idToSucceedOnAttempt?: number;
  delayMs?: number;
}

export interface SimpleJobResult {
  processedMessage: string;
  status: string;
  attemptsMade?: number;
}

// 2. Implementar JobProcessorFunction de Exemplo
export const exampleJobProcessor: ProcessorFunction<SimpleJobPayload, SimpleJobResult> = async (
  job: JobEntity<SimpleJobPayload, SimpleJobResult>
): Promise<SimpleJobResult> => {
  const { message, succeed, idToSucceedOnAttempt } = job.payload;
  const jobId = job.id.value;

  console.log(`[Processor][${jobId}] Starting job. Attempt: ${job.attemptsMade}. Message: "${message}"`);
  await job.addLogToExecution(`Processor started. Attempt: ${job.attemptsMade}.`);

  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  await job.updateProgress(50);
  console.log(`[Processor][${jobId}] Reached 50% progress.`);
  await job.addLogToExecution('Processing at 50%.');

  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

  if (idToSucceedOnAttempt) {
    if (job.attemptsMade >= idToSucceedOnAttempt) {
      console.log(`[Processor][${jobId}] Job succeeding on attempt ${job.attemptsMade} as configured.`);
      await job.updateProgress(100);
      await job.addLogToExecution('Job will succeed on this attempt.');
      return {
        processedMessage: `Job "${message}" succeeded on attempt ${job.attemptsMade}.`,
        status: 'SUCCESS',
        attemptsMade: job.attemptsMade,
      };
    }
      console.log(`[Processor][${jobId}] Job configured to fail on attempt ${job.attemptsMade} (will succeed on ${idToSucceedOnAttempt}).`);
      await job.addLogToExecution(`Job failing on attempt ${job.attemptsMade} as per configuration.`);
      throw new Error(`Job "${message}" failed intentionally on attempt ${job.attemptsMade}.`);

  } else if (!succeed) {
    console.log(`[Processor][${jobId}] Job configured to fail permanently.`);
    await job.addLogToExecution('Job failing permanently as per configuration.');
    throw new Error(`Job "${message}" failed permanently as configured.`);
  }

  await job.updateProgress(100);
  await job.addLogToExecution('Job completed successfully.');
  console.log(`[Processor][${jobId}] Job completed successfully.`);
  return {
    processedMessage: `Successfully processed: ${message}`,
    status: 'SUCCESS',
    attemptsMade: job.attemptsMade,
  };
};

async function runExample() {
  console.log("===== Queue System Usage Example =====");

  const EXAMPLE_QUEUE_NAME = "example-queue";
  const EXAMPLE_DB_FILE_NAME = "data/example-queue.sqlite3";
  const MIGRATIONS_FOLDER = path.resolve(process.cwd(), 'src_refactored/infrastructure/persistence/drizzle/migrations');

  const logger = new ConsoleLoggerService('QueueExample');
  logger.info("Logger initialized.");

  const jobEventEmitter = new InMemoryJobEventEmitter();
  logger.info("JobEventEmitter initialized.");

  const dbFilePath = path.resolve(EXAMPLE_DB_FILE_NAME);
  const dbDir = path.dirname(dbFilePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  if (fs.existsSync(dbFilePath)) {
    logger.info(`Deleting existing example database: ${dbFilePath}`);
    fs.unlinkSync(dbFilePath);
  }
  const sqlite = new Database(dbFilePath);
  sqlite.pragma('journal_mode = WAL');
  const db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, { schema, logger: false });
  logger.info(`Example SQLite DB initialized at ${dbFilePath} with WAL mode.`);

  try {
    logger.info(`Applying migrations from: ${MIGRATIONS_FOLDER}`);
    migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    logger.info("Migrations applied successfully for example DB.");
  } catch (error) {
    logger.error("Error applying migrations for example DB:", error);
    process.exit(1);
  }

  const jobRepository = new DrizzleJobRepository(db);
  logger.info("DrizzleJobRepository initialized.");

  const jobQueueService = new JobQueueService<SimpleJobPayload, SimpleJobResult>(
    EXAMPLE_QUEUE_NAME,
    jobRepository,
    jobEventEmitter
  );
  logger.info(`JobQueueService for queue [${EXAMPLE_QUEUE_NAME}] initialized.`);

  const scheduler = new QueueSchedulerService(
    jobRepository,
    jobEventEmitter,
    logger.getSubLogger({ name: 'QueueScheduler' }),
    { intervalMs: 2000, processingLimit: 10 }
  );
  logger.info("QueueSchedulerService initialized and started.");

  const worker = new JobWorkerService<SimpleJobPayload, SimpleJobResult>(
    EXAMPLE_QUEUE_NAME,
    exampleJobProcessor,
    { concurrency: 3, lockDuration: 10000, lockRenewTime: 4000, autorun: false },
    jobRepository,
    jobEventEmitter,
    logger.getSubLogger({ name: 'JobWorker' })
  );
  logger.info(`JobWorkerService for queue [${EXAMPLE_QUEUE_NAME}] initialized.`);

  // 3. Register event listeners
  logger.info("Registering event listeners...");
  (Object.keys(JobEventType) as Array<keyof typeof JobEventType>).forEach(key => {
    const eventName = JobEventType[key];
    jobEventEmitter.on(eventName, (payload: any) => {
      if (payload.queueName && payload.queueName !== EXAMPLE_QUEUE_NAME) return;
      logger.info(`EVENT [${eventName}]: ${JSON.stringify(payload)}`);
    });
  });

  // 4. Add various jobs
  logger.info("Adding jobs to the queue...");

  await jobQueueService.add("SuccessJob_1", { message: "This job will succeed on first attempt", succeed: true });
  await jobQueueService.add("RetryJob_1", { message: "This job will fail twice, then succeed", succeed: false, idToSucceedOnAttempt: 3 }, { attempts: 3 });
  await jobQueueService.add("FailJob_1", { message: "This job will fail all attempts", succeed: false }, { attempts: 2 });
  await jobQueueService.add("DelayedJob_1", { message: "This job is delayed by 5s", succeed: true }, { delay: 5000 });
  await jobQueueService.add("SuccessJob_2", { message: "Another successful job", succeed: true });
  await jobQueueService.add("SuccessJob_3_Prio1", { message: "High priority successful job", succeed: true }, { priority: 1 });


  logger.info("Jobs added. Starting worker...");
  // 5. Start worker
  worker.run();

  // 6. Observe logs and manage example lifecycle
  logger.info("Example running. Observe console for logs and events. Will stop in 30 seconds.");

  // 7. Clean up
  setTimeout(async () => {
    logger.info("Example finished. Closing services...");
    await worker.close();
    scheduler.stop();
    sqlite.close((err) => {
      if (err) {
        logger.error("Error closing SQLite connection:", err);
      } else {
        logger.info("SQLite connection closed.");
      }
      logger.info("Exiting example.");
      process.exit(0);
    });
  }, 30000);
}

if (require.main === module) {
  runExample().catch(err => {
    console.error("Error in example execution:", err);
    process.exit(1);
  });
}

export default runExample;
