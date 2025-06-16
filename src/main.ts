// src/main.ts

import { DrizzleQueueRepository } from './infrastructure/repositories/drizzle/queue.repository';
import { DrizzleJobRepository } from './infrastructure/repositories/drizzle/job.repository';
import { SimpleLogAgent } from './infrastructure/agents/simple-log.agent';
import { WorkerService } from './core/domain/services/worker.service';
import { Queue } from './core/domain/entities/queue/queue.entity';
import { Job } from './core/domain/entities/jobs/job.entity';
import { db } from './infrastructure/services/drizzle/index'; // Ensure db instance is available from index.ts

// --- Configuration ---
const QUEUE_NAME = 'my-logging-queue';
const CONCURRENCY = 2;

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

  console.log('WorkerService is running. Press Ctrl+C to stop.');

  // Graceful shutdown handling
  process.on('SIGINT', async () => {
    console.log('SIGINT received. Stopping WorkerService...');
    workerService.stop();
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Exiting.');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Stopping WorkerService...');
    workerService.stop();
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Exiting.');
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Error during application startup or execution:', error);
  process.exit(1);
});
