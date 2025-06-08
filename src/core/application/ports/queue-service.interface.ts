import { Queue } from "../../domain/entities/queue/queue.entity";
import { QueueId } from "../../domain/entities/queue/value-objects/queue-id.vo";
import { Job } from "../../domain/entities/job/job.entity";

export interface QueueService {
  create(queue: Queue): Promise<Queue>;
  findById(id: QueueId): Promise<Queue>;
  enqueue(job: Job): Promise<void>;
  dequeue(): Promise<Job>;
  list(): Promise<Queue[]>;
}
