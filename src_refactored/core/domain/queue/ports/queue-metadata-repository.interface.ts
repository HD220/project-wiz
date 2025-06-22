// src_refactored/core/domain/queue/ports/queue-metadata-repository.interface.ts
import { Result } from '../../../../shared/result';
import { DomainError } from '../../../common/errors';
import { Queue } from '../queue.entity';
import { QueueId } from '../value-objects/queue-id.vo';
import { QueueName } from '../value-objects/queue-name.vo';

export interface IQueueMetadataRepository {
  /**
   * Saves a queue entity. Handles creation or updates.
   * @param queue The queue entity to save.
   * @returns A Result containing the saved queue or a DomainError.
   */
  save(queue: Queue): Promise<Result<Queue, DomainError>>;

  /**
   * Finds a queue by its ID.
   * @param id The QueueId of the queue.
   * @returns A Result containing the queue or null if not found, or a DomainError.
   */
  findById(id: QueueId): Promise<Result<Queue | null, DomainError>>;

  /**
   * Finds a queue by its name.
   * @param name The QueueName of the queue.
   * @returns A Result containing the queue or null if not found, or a DomainError.
   */
  findByName(name: QueueName): Promise<Result<Queue | null, DomainError>>;

  /**
   * Lists all queues.
   * @returns A Result containing an array of queues or a DomainError.
   */
  listAll(): Promise<Result<Queue[], DomainError>>;

  /**
   * Deletes a queue by its ID.
   * @param id The QueueId of the queue to delete.
   * @returns A Result containing void or a DomainError.
   */
  delete(id: QueueId): Promise<Result<void, DomainError>>;
}

export const IQueueMetadataRepositoryToken = Symbol('IQueueMetadataRepository');
