// src_refactored/examples/queue-usage-example.final.ts
import 'reflect-metadata';
import { AbstractQueue, getQueueServiceToken } from '@/core/application/queue/abstract-queue';
import { WorkerService } from '@/core/application/worker/worker.service';
import { JobEntity } from '@/core/domain/job/job.entity';

import { appContainer } from '@/infrastructure/ioc/inversify.config';

async function main() {
  const queue = appContainer.get<AbstractQueue<{ email: string }, { status: string }>>(getQueueServiceToken('default'));

  const processor = async (job: JobEntity<{ email: string }, { status: string }>): Promise<{ status: string }> => {
    console.log(`Processing job ${job.id.value} for email: ${job.payload.email}`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work
    if (Math.random() > 0.8) {
      throw new Error('Random failure!');
    }
    job.updateProgress(50);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate more work
    job.addLog('Halfway done!');
    job.updateProgress(100);
    return { status: 'Email sent' };
  };

  const worker = new WorkerService(queue, processor, { concurrency: 3, lockDuration: 10000 });

  queue.on('job.added', (job) => console.log(`Job added: ${job.id.value}`));
  queue.on('job.completed', (job) => console.log(`Job completed: ${job.id.value}`));
  queue.on('job.failed', (job) => console.log(`Job failed: ${job.id.value}, reason: ${job.failedReason}`));
  worker.on('worker.job.active', (job) => console.log(`Worker processing job: ${job.id.value}`));

  await queue.add('send-email', { email: 'test1@example.com' });
  await queue.add('send-email', { email: 'test2@example.com' }, { delay: 5000 });
  await queue.add('send-email', { email: 'test3@example.com' }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });

  worker.run();
  queue.startMaintenance();

  setTimeout(async () => {
    await worker.close();
    await queue.close();
    console.log('Worker and queue closed.');
    process.exit(0);
  }, 30000);
}

main().catch(console.error);