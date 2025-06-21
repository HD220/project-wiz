import { IRepository } from '@/core/common/repository';
import { Queue } from '@/core/domain/entities/queue/queue.entity';

export type IQueueRepository = IRepository<typeof Queue>;
