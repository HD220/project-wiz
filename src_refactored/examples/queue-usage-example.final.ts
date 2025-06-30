// src_refactored/examples/queue-usage-example.final.ts
import { WorkerService } from '@/core/application/worker/worker.service';
import { JobEntity } from '@/core/domain/job/job.entity';

import { db } from '@/infrastructure/persistence/drizzle/drizzle.client';
import { DrizzleJobRepository } from '@/infrastructure/persistence/drizzle/job/drizzle-job.repository';
import { QueueService } from '@/infrastructure/queue/drizzle/queue.service';

async function main() {
  const jobRepository = new DrizzleJobRepository(db);
  const queue = new QueueService('default', jobRepository);

  // Job processor function
  const processor = async (job: JobEntity<{ email: string }, { status: string }>): Promise<{ status: string }> => {
    process.stdout.write(`[Worker] Processing job ${job.id.value} (attempt ${job.attemptsMade}) for email: ${job.payload.email}\n`);

    // Simulate work with progress updates
    for (let i = 0; i <= 100; i += 25) {
      await new Promise(resolve => setTimeout(resolve, 500));
      job.updateProgress(i);
      job.addLog(`Progress updated to ${i}%`);
      process.stdout.write(`[Worker] Job ${job.id.value} progress: ${i}%\n`);
    }

    // Simulate retry logic: fail twice, then succeed
    if (job.attemptsMade < 3 && job.payload.email === 'retry@example.com') {
      job.addLog('Simulating transient failure for retry job.', 'ERROR');
      process.stdout.write(`[Worker] Job ${job.id.value} (retry job) failed. Attempts made: ${job.attemptsMade}\n`);
      throw new Error('Simulated transient error');
    }

    // Simulate permanent failure for a specific job
    if (job.payload.email === 'fail@example.com') {
      job.addLog('Simulating permanent failure.', 'ERROR');
      process.stdout.write(`[Worker] Job ${job.id.value} (fail job) failed permanently.\n`);
      throw new Error('Simulated permanent error');
    }

    job.addLog('Job completed successfully.', 'INFO');
    process.stdout.write(`[Worker] Job ${job.id.value} completed successfully.\n`);
    return { status: 'Email sent' };
  };

  const worker = new WorkerService(queue, processor, { concurrency: 2, lockDuration: 15000, lockRenewTimeBuffer: 5000 });

  // Event listeners for queue and worker
  queue.on('job.added', (job) => process.stdout.write(`[Queue] Job added: ${job.id.value} (Name: ${job.name}, Status: ${job.status})\n`));
  queue.on('job.completed', (job) => process.stdout.write(`[Queue] Job completed: ${job.id.value} (Result: ${JSON.stringify(job.returnValue)})\n`));
  queue.on('job.failed', (job) => process.stdout.write(`[Queue] Job failed: ${job.id.value} (Reason: ${job.failedReason}, Attempts: ${job.attemptsMade})\n`));
  queue.on('job.active', (job) => process.stdout.write(`[Queue] Job ${job.id.value} is now active.\n`));
  queue.on('job.stalled', (job) => process.stdout.write(`[Queue] Job ${job.id.value} stalled and re-queued.\n`));
  queue.on('job.progress', (job) => process.stdout.write(`[Queue] Job ${job.id.value} progress updated to ${job.progress}\n`));
  queue.on('job.log', (job) => process.stdout.write(`[Queue] Job ${job.id.value} log: ${job.logs[job.logs.length - 1].message}\n`));

  worker.on('worker.job.active', (job) => process.stdout.write(`[Worker] Worker started processing job: ${job.id.value}\n`));
  worker.on('worker.job.processed', (job) => process.stdout.write(`[Worker] Worker finished processing job: ${job.id.value}\n`));
  worker.on('worker.job.errored', (job, error) => process.stdout.write(`[Worker] Worker encountered error for job ${job.id.value}: ${error.message}\n`));

  // Add various job scenarios
  await queue.add('send-email', { email: 'success@example.com' }); // Succeeds on first attempt
  await queue.add('send-email', { email: 'delayed@example.com' }, { delay: 7000 }); // Delayed job
  await queue.add('send-email', { email: 'retry@example.com' }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } }); // Fails then retries
  await queue.add('send-email', { email: 'fail@example.com' }, { attempts: 1 }); // Fails permanently

  worker.run();
  queue.startMaintenance();

  process.stdout.write('Queue and Worker started. Waiting for jobs to complete...\n');

  // Keep the process alive for a while to observe job processing
  setTimeout(async () => {
    process.stdout.write('Shutting down worker and queue...\n');
    await worker.close();
    await queue.close();
    process.stdout.write('Worker and queue closed. Exiting.\n');
    process.exit(0);
  }, 60000); // Run for 60 seconds
}

main().catch(console.error);