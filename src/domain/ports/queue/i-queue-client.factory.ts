// src/domain/ports/queue/i-queue-client.factory.ts
import { IQueueClient } from './i-queue.client';

export interface IQueueClientFactory {
  /**
   * Gets or creates a QueueClient for the specified queue name.
   * @param queueName The name of the queue.
   * @returns An instance of IQueueClient configured for the given queue.
   */
  getClient(queueName: string): IQueueClient;
}
