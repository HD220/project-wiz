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
appContainer.bind('drizzle').toConstantValue(db);


import { db } from '@/infrastructure/persistence/drizzle/drizzle.client';

appContainer.bind<IJobRepository>(JOB_REPOSITORY_TOKEN).toConstantValue(new DrizzleJobRepository(db));
appContainer.bind<AbstractQueue<any, any>>(getQueueServiceToken('default')).toDynamicValue((context) => {
  const jobRepository = appContainer.get<IJobRepository>(JOB_REPOSITORY_TOKEN);
  return new QueueService('default', jobRepository);
}).inSingletonScope();
