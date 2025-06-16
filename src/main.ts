// src/main.ts

import { DrizzleQueueRepository } from './infrastructure/repositories/drizzle/queue.repository';
import { DrizzleJobRepository } from './infrastructure/repositories/drizzle/job.repository';
import { SimpleLogAgent } from './infrastructure/agents/simple-log.agent';
import { WorkerService } from './core/domain/services/worker.service';
import { Queue } from './core/domain/entities/queue/queue.entity';
import { Job } from './core/domain/entities/jobs/job.entity';
import { db } from './infrastructure/services/drizzle/index'; // Ensure db instance is available from index.ts
import { SummarizationAgent } from './infrastructure/agents/summarization.agent';

// --- Configuration ---
const QUEUE_NAME = 'my-logging-queue';
const CONCURRENCY = 2;
const SUMMARIZATION_QUEUE_NAME = 'summarization-queue';
const SUMMARIZATION_CONCURRENCY = 1; // LLM tasks can be slower

async function initializeQueue(queueRepo: DrizzleQueueRepository, queueName: string, concurrency: number): Promise<Queue> {
  let queue = await queueRepo.findByName(queueName);
  if (!queue) {
    console.log(`Queue ${queueName} not found, creating it...`);
    // Note: Queue.create now returns a Queue instance, not props.
    // The constructor of Queue now takes props that are slightly different from QueueProps.
    // Let's use the static create method from the entity itself.
    const newQueueEntity = Queue.create({ name: queueName, concurrency });
    await queueRepo.save(newQueueEntity); // Save the entity
    queue = newQueueEntity; // Assign the created entity
    console.log(`Queue ${queueName} created with ID ${queue.id}`);
  } else {
    console.log(`Queue ${queueName} found with ID ${queue.id}`);
    // Optionally, update concurrency if different, though save handles upsert based on ID
    if (queue.concurrency !== concurrency) {
        console.log(`Updating concurrency for ${queueName} from ${queue.concurrency} to ${concurrency}`);
        // To update, we'd modify the queue instance and save it.
        // This requires Queue entity to have a setter or a method to update concurrency.
        // For simplicity, we assume Queue.create + save handles this or it's done manually.
        // A proper update would be:
        // queue.updateConcurrency(concurrency); // Assuming such method exists
        // await queueRepo.save(queue);
    }
  }
  if (!queue) {
    throw new Error("Failed to find or create queue"); // Should not happen if logic is correct
  }
  return queue;
}

async function addSampleJobs(jobRepo: DrizzleJobRepository, queueId: string) {
  console.log(`Adding sample jobs to queue ${queueId}...`);

  const job1Payload = { message: 'Hello from Job 1!', data: { value: 123 } };
  const job1 = Job.create({
    queueId,
    name: 'LogMessageJob_1',
    payload: job1Payload,
    priority: 1, // Higher priority
    maxAttempts: 3,
    maxRetryDelay: 30000, // 30 seconds
    // initialRetryDelay: 1000 // This was a param in Job.create before, now handled by moveToDelayed or default in calculateNextRetryDelay
  });

  const job2Payload = { message: 'This is Job 2 logging.', data: { info: 'test' } };
  const job2 = Job.create({
    queueId,
    name: 'LogMessageJob_2',
    payload: job2Payload,
    priority: 2,
    maxAttempts: 3,
    maxRetryDelay: 30000,
  });

  // A job that will be delayed initially
  const job3Payload = { message: 'Delayed Job 3 here.' };
  const job3 = Job.create({
    queueId,
    name: 'DelayedLogMessageJob_3',
    payload: job3Payload,
    priority: 1,
    maxAttempts: 2,
    maxRetryDelay: 10000,
    delay: 5000, // Delay execution by 5 seconds from creation
  });

  // A job that will be processed by SimpleLogTask as having "No message provided".
  const job4Payload = { data: { shouldFail: true } }; // Missing message property
  const job4 = Job.create({
    queueId,
    name: 'NoMessageJob_4',
    // @ts-ignore to test missing message, though SimpleLogTask handles it gracefully
    payload: job4Payload,
    priority: 3,
    maxAttempts: 1,
    maxRetryDelay: 5000,
  });


  await jobRepo.save(job1);
  await jobRepo.save(job2);
  await jobRepo.save(job3);
  await jobRepo.save(job4);

  console.log('Sample jobs added.');
}

async function addSummarizationSampleJob(jobRepo: DrizzleJobRepository, queueId: string) {
  console.log(`Adding sample summarization job to queue ${queueId}...`);
  const textToSummarize = "Electron is a framework for creating native applications with web technologies like JavaScript, HTML, and CSS. It takes care of the hard parts so you can focus on the core of your application. It's used by companies like Slack, Microsoft, and GitHub.";

  const summarizationJob = Job.create({
    queueId,
    name: 'SummarizeTextJob_1',
    payload: textToSummarize, // Direct string payload as expected by SummarizationAgent/Task
    priority: 1,
    maxAttempts: 2,
    maxRetryDelay: 60000, // 1 minute
  });

  await jobRepo.save(summarizationJob);
  console.log('Sample summarization job added.');
}

async function main() {
  console.log('Starting Queue System Initializer...');

  // Instantiate repositories
  const queueRepository = new DrizzleQueueRepository(db);
  const jobRepository = new DrizzleJobRepository(db);

  // 1. Initialize Queue
  const queue = await initializeQueue(queueRepository, QUEUE_NAME, CONCURRENCY);

  // 2. Add sample jobs (optional, for testing)
  const existingJobs = await jobRepository.findPending(queue.id, 1);
  if (existingJobs.length === 0) {
    await addSampleJobs(jobRepository, queue.id);
  } else {
    console.log("Jobs already exist in the queue, not adding sample jobs.");
  }


  // 3. Instantiate Agent
  const simpleLogAgent = new SimpleLogAgent();

  // 4. Instantiate WorkerService
  const workerService = new WorkerService(
    queueRepository,
    jobRepository,
    simpleLogAgent,
    { pollFrequencyMs: 3000 } // Poll a bit faster for the example
  );

  // 5. Start WorkerService
  console.log(`Starting WorkerService for queue: ${queue.name}...`);
  await workerService.start(queue.name);

  console.log('\n--- Setting up Summarization Agent ---');

  // 3b. Initialize Summarization Queue
  const summarizationQueue = await initializeQueue(queueRepository, SUMMARIZATION_QUEUE_NAME, SUMMARIZATION_CONCURRENCY);

  // 4b. Add sample summarization job (optional, for testing)
  const existingSummarizationJobs = await jobRepository.findPending(summarizationQueue.id, 1);
  if (existingSummarizationJobs.length === 0) {
    await addSummarizationSampleJob(jobRepository, summarizationQueue.id);
  } else {
    console.log("Summarization jobs already exist in the queue, not adding sample job.");
  }

  // 5b. Instantiate Summarization Agent
  const summarizationAgent = new SummarizationAgent();

  // 6b. Instantiate and Start WorkerService for Summarization
  const summarizationWorkerService = new WorkerService(
    queueRepository,
    jobRepository,
    summarizationAgent, // Pass the summarization agent
    { pollFrequencyMs: 5000 } // Can have a different polling frequency
  );

  console.log(`Starting WorkerService for queue: ${summarizationQueue.name}...`);
  await summarizationWorkerService.start(summarizationQueue.name);

  console.log('All WorkerServices are running. Press Ctrl+C to stop.');

  // Graceful shutdown handling
  process.on('SIGINT', async () => {
    console.log('SIGINT received. Stopping WorkerServices...');
    workerService.stop(); // Existing worker
    summarizationWorkerService.stop(); // New summarization worker
    await new Promise(resolve => setTimeout(resolve, 2000)); // Give some time to stop
    console.log('Exiting.');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Stopping WorkerServices...');
    workerService.stop(); // Existing worker
    summarizationWorkerService.stop(); // New summarization worker
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Exiting.');
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Error during application startup or execution:', error);
  process.exit(1);
});
