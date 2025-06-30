// src_refactored/infrastructure/ioc/inversify.config.ts
import 'reflect-metadata';

import { Container } from 'inversify';

import { IJobRepository, JOB_REPOSITORY_TOKEN } from '@/core/application/ports/job-repository.interface';
import { AbstractQueue, getQueueServiceToken } from '@/core/application/queue/abstract-queue';

import { db } from '@/infrastructure/persistence/drizzle/drizzle.client';
import { DrizzleJobRepository } from '@/infrastructure/persistence/drizzle/job/drizzle-job.repository';
import { QueueService } from '@/infrastructure/queue/drizzle/queue.service';


export const appContainer = new Container();

// Database Client
// The 'db' instance from drizzle.client is directly used in repository construction,
// so explicit binding of 'drizzle' symbol might not be strictly necessary unless used elsewhere.
// For now, we ensure db is available for DrizzleJobRepository.
// appContainer.bind('drizzle').toConstantValue(db); // This line can be kept or removed if db is only used for repo instantiation.

// Job Repository and Queue Service bindings
appContainer.bind<IJobRepository>(JOB_REPOSITORY_TOKEN).toConstantValue(new DrizzleJobRepository(db));
appContainer.bind<AbstractQueue<unknown, unknown>>(getQueueServiceToken('default')).toDynamicValue(() => { // Changed any to unknown
  const jobRepository = appContainer.get<IJobRepository>(JOB_REPOSITORY_TOKEN);
  return new QueueService('default', jobRepository);
}).inSingletonScope();
