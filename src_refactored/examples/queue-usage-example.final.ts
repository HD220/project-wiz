// src_refactored/examples/queue-usage-example.final.ts
import 'reflect-metadata'; // Required for Inversify, even if not using the container directly here
import { setTimeout as sleep } from 'node:timers/promises';

import { IJobRepository } from '../core/application/ports/job-repository.interface';
// import { AbstractQueue, getQueueServiceToken } from '../core/application/queue/abstract-queue'; // Not directly used
import { WorkerService } from '../core/application/worker/worker.service';
import { ILoggerService } from '../core/common/services/i-logger.service';
import { JobEntity } from '../core/domain/job/job.entity'; // JobStatus not directly used
// import { appContainer } from '../infrastructure/ioc/inversify.config'; // Not directly used
import { MAIN_QUEUE_NAME } from '../infrastructure/ioc/inversify.config';
// import { TYPES } from '../infrastructure/ioc/types'; // Not directly used
import { db as drizzleInstance } from '../infrastructure/persistence/drizzle/drizzle.client'; // Direct access for standalone example
import { DrizzleJobRepository } from '../infrastructure/persistence/drizzle/job/drizzle-job.repository';
import { DrizzleQueueService } from '../infrastructure/queue/drizzle/queue.service';
import { ConsoleLoggerService } from '../infrastructure/services/logger/console-logger.service';


// --- Payload and Result Types for this Example ---
interface MyJobPayload {
  message: string;
  attemptFailures?: number; // How many times this job should fail before succeeding
  shouldErrorProgress?: boolean; // If true, `updateProgress` will throw an error
  customId?: string;
}

interface MyJobResult {
  processedMessage: string;
  completedAt: string;
}

// --- Logger Setup (Manual for this example) ---
// In a real app, this would come from the container
const logger: ILoggerService = new ConsoleLoggerService();
logger.setContext('QueueExample');

// --- Repository and QueueService Setup (Manual for this example) ---
// In a real app, these would be resolved from appContainer
const jobRepository: IJobRepository = new DrizzleJobRepository(drizzleInstance);

const mainQueueService = new DrizzleQueueService<MyJobPayload, MyJobResult>(
  MAIN_QUEUE_NAME, // Use the same name as in inversify.config.ts
  jobRepository,
  {
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 }, // Default backoff: 1s, 2s, 4s
    },
    stalledJobs: { // Match Inversify config for consistency
        checkIntervalMs: 15000,
        olderThanMs: 30000,
        limitPerCheck: 10,
      }
  }
);
mainQueueService.startMaintenance(); // Start stalled job checker

// --- Processor Function Definition ---
let failureCount: { [jobId: string]: number } = {};

function simulateFailureIfNeeded(job: JobEntity<MyJobPayload, MyJobResult>, currentLogger: ILoggerService) {
  const jobId = job.id.value;
  if (job.payload.attemptFailures && job.payload.attemptFailures > 0) {
    failureCount[jobId] = failureCount[jobId] || 0;
    if (failureCount[jobId] < job.payload.attemptFailures) {
      failureCount[jobId]++;
      currentLogger.warn(`[Worker] Simulating failure for job ${jobId} (failure ${failureCount[jobId]}/${job.payload.attemptFailures})`);
      job.addLog(`Simulated failure ${failureCount[jobId]}`, 'WARN');
      throw new Error(`Simulated failure for job ${jobId} on attempt ${failureCount[jobId]}`);
    }
  }
}

const myJobProcessor: (job: JobEntity<MyJobPayload, MyJobResult>) => Promise<MyJobResult> = async (job) => {
  const jobId = job.id.value;
  logger.info(`[Worker] Processing job ${job.name} (${jobId}) - Attempt ${job.attempts + 1}/${job.options.attempts ?? 'N/A'}`);
  logger.info(`[Worker] Payload for ${jobId}:`, job.payload);

  await sleep(1000); // Simulate some work

  simulateFailureIfNeeded(job, logger);

  // Simulate progress updates
  try {
    await job.updateProgress(50); // Update progress in JobEntity (in-memory)
    logger.info(`[Worker] Progress updated for ${jobId} to 50%`);
    if (job.payload.shouldErrorProgress) {
        logger.warn(`[Worker] Simulating error during progress update for ${jobId}`);
        throw new Error(`Simulated error after progress update for job ${jobId}`);
    }
    await sleep(500);
    await job.updateProgress(100);
    logger.info(`[Worker] Progress updated for ${jobId} to 100%`);
  } catch(err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[Worker] Error during progress update for ${jobId}: ${error.message}`);
    job.addLog(`Error during progress update: ${error.message}`, 'ERROR');
    throw error; // Re-throw to fail the job
  }


  job.addLog('Processing complete, preparing result.', 'INFO');
  logger.info(`[Worker] Job ${jobId} processed successfully.`);

  return {
    processedMessage: `Hello, ${job.payload.message}! (Processed by ${job.name})`,
    completedAt: new Date().toISOString(),
  };
};

// --- WorkerService Setup ---
const workerService = new WorkerService<MyJobPayload, MyJobResult>(
  mainQueueService,
  myJobProcessor,
  {
    concurrency: 2, // Process 2 jobs at a time
    lockDuration: 20000, // Lock jobs for 20 seconds
    lockRenewTimeBuffer: 5000, // Try to renew 5s before expiry
  }
);

// --- Event Listeners ---
function setupEventListeners() {
  logger.info('Setting up event listeners...');

  // Queue Events
  mainQueueService.on('job.added', ({ jobId, name }) => logger.info(`[Queue] Job Added: ${name} (${jobId})`));
  mainQueueService.on('job.locked', ({ jobId, workerId }) => logger.info(`[Queue] Job Locked: ${jobId} by ${workerId}`));
  mainQueueService.on('job.completed', ({ jobId, result }) => logger.info(`[Queue] Job Completed: ${jobId}`, result));
  mainQueueService.on('job.failed', ({ jobId, error }) => logger.error(`[Queue] Job Failed: ${jobId} - ${error}`));
  mainQueueService.on('job.retrying', ({ jobId, delay, attempt }) => logger.warn(`[Queue] Job Retrying: ${jobId} in ${delay}ms (attempt ${attempt})`));
  mainQueueService.on('job.progress', ({ jobId, progress }) => logger.info(`[Queue] Job Progress: ${jobId} - ${JSON.stringify(progress)}`));
  mainQueueService.on('job.log_added', ({ jobId, message, level }) => logger.info(`[Queue] Job Log [${level}]: ${jobId} - ${message}`));
  mainQueueService.on('job.stalled', ({ jobId }) => logger.warn(`[Queue] Job Stalled: ${jobId}`));
  mainQueueService.on('queue.paused', () => logger.info('[Queue] Queue Paused'));
  mainQueueService.on('queue.resumed', () => logger.info('[Queue] Queue Resumed'));
  mainQueueService.on('queue.cleaned', ({ count }) => logger.info(`[Queue] Cleaned ${count} jobs`));
  mainQueueService.on('queue.error', ({ error, queueName }) => logger.error(`[Queue:${queueName}] Error: ${error}`));
  mainQueueService.on('queue.stalled_check', ({ count }) => logger.info(`[Queue] Stalled check found ${count} potential jobs.`));


  // Worker Events
  workerService.on('worker.running', ({ workerId }) => logger.info(`[Worker] Worker Running: ${workerId}`));
  workerService.on('worker.job.fetched', ({ jobId }) => logger.info(`[Worker] Job Fetched: ${jobId}`));
  workerService.on('worker.job.active', ({ jobId, name }) => logger.info(`[Worker] Job Active: ${name} (${jobId})`));
  workerService.on('worker.job.processed', ({ jobId, result }) => logger.info(`[Worker] Job Processed: ${jobId}`, result));
  workerService.on('worker.job.errored', ({ jobId, error }) => logger.error(`[Worker] Job Errored: ${jobId} - ${error}`));
  workerService.on('worker.job.lock_renewed', ({ jobId }) => logger.info(`[Worker] Lock Renewed: ${jobId}`));
  workerService.on('worker.error', ({ error, jobId, isCritical }) => logger.error(`[Worker] Error (Job: ${jobId || 'N/A'}, Critical: ${isCritical}): ${error}`));
  workerService.on('worker.closing', () => logger.info('[Worker] Worker Closing...'));
  workerService.on('worker.closed', () => logger.info('[Worker] Worker Closed.'));
  workerService.on('worker.closed_timeout', () => logger.warn('[Worker] Worker Closed due to timeout.'));
}

// --- Main Execution Logic ---
async function main() {
  logger.info('--- Queue System Example ---');
  setupEventListeners();

  // Add some jobs
  await mainQueueService.add('simple-logger-1', { message: 'World 1' });
  await mainQueueService.add('delayed-logger-1', { message: 'Delayed Message' }, { delay: 5000 }); // Delay 5s
  await mainQueueService.add('retry-logger-1', { message: 'Retry Me', attemptFailures: 2 }, { attempts: 3 }); // Fail twice, succeed on 3rd
  await mainQueueService.add('retry-logger-custom-id', { message: 'Retry Me with Custom ID', customId: 'custom-job-123', attemptFailures: 1 }, { jobId: 'my-custom-id-1', attempts: 2 });
  await mainQueueService.add('progress-error-job', { message: 'Progress Error Test', shouldErrorProgress: true }, { attempts: 1 });
  await mainQueueService.add('simple-logger-2', { message: 'World 2' });
  await mainQueueService.add('simple-logger-3', { message: 'World 3' }); // To test concurrency

  logger.info('Jobs added to the queue.');

  // Start the worker
  logger.info('Starting worker...');
  workerService.run(); // Not awaiting this as it's a long-running process

  // Keep the script running for a while to see jobs processed
  logger.info('Example script will run for 60 seconds...');
  await sleep(60 * 1000);

  // Graceful shutdown
  logger.info('--- Initiating Shutdown ---');
  logger.info('Closing worker...');
  await workerService.close(10000); // Wait up to 10s for active jobs
  logger.info('Worker closed.');

  logger.info('Closing queue service...');
  await mainQueueService.close();
  logger.info('Queue service closed.');

  // Clean up failureCount for multiple runs if this becomes a test
  failureCount = {};

  logger.info('--- Example Finished ---');

  // In a real app, you might need to explicitly close the DB connection
  // For this example, Drizzle's client might manage it or it might be shared.
  // (drizzleInstance as any).close?.(); // If using a client that needs explicit close

  process.exit(0); // Ensure script exits cleanly
}

main().catch(async (error) => {
  logger.error('Unhandled error in main execution:', error);
  // Attempt to close services even on error
  try {
    await workerService.close(2000);
    await mainQueueService.close();
  } catch (shutdownError) {
    logger.error('Error during shutdown after unhandled error:', shutdownError);
  }
  process.exit(1);
});

/*
How to use with Inversify (in a real application):

1. Ensure `inversify.config.ts` has bindings for:
   - `IJobRepository` (to `DrizzleJobRepository`)
   - `AbstractQueue` (using `getQueueServiceToken(MAIN_QUEUE_NAME)`) to `DrizzleQueueService` (via factory)
   - `ILoggerService`

2. Get instances from the container:
   const logger = appContainer.get<ILoggerService>(LOGGER_SERVICE_TOKEN);
   const mainQueue = appContainer.get<AbstractQueue<MyJobPayload, MyJobResult>>(getQueueServiceToken(MAIN_QUEUE_NAME));

   // WorkerService would typically also be registered in Inversify or constructed manually
   // if its dependencies (queue, processorFn, options) are dynamic or configured outside IoC.
   // For example, if WorkerService itself was registered:
   // appContainer.bind<WorkerService<MyJobPayload, MyJobResult>>(TYPES.MyExampleWorkerService)
   //   .toDynamicValue(context => {
   //     const queue = context.container.get<AbstractQueue<MyJobPayload, MyJobResult>>(getQueueServiceToken(MAIN_QUEUE_NAME));
   //     return new WorkerService(queue, myJobProcessor, { concurrency: 2 });
   //   }).inSingletonScope();
   // const worker = appContainer.get<WorkerService<MyJobPayload, MyJobResult>>(TYPES.MyExampleWorkerService);

   // Or, if processorFn is very specific to this use case, manual instantiation is fine:
   const worker = new WorkerService(mainQueue, myJobProcessor, { concurrency: 2, ... });

3. The rest of the logic (adding jobs, event listeners, running worker) would be similar.
*/
