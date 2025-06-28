// src_refactored/infrastructure/events/in-memory-job-event-emitter.ts
import { EventEmitter } from 'events';
import { injectable } from 'inversify';

import { IJobEventEmitter } from '@/core/application/ports/events/i-job-event-emitter.interface';
import {
  JobEventType,
  JobEventPayloadMap,
  // QueueName, // Removed
  // JobId, // Removed
  // WorkerId, // Removed
} from '@/core/application/queue/events/job-event.types';


@injectable()
export class InMemoryJobEventEmitter extends EventEmitter implements IJobEventEmitter {
  constructor() {
    super();
    // Increase max listeners if needed, default is 10
    // this.setMaxListeners(20);
  }

  // Provide strongly-typed wrappers

  public emit<K extends JobEventType>(event: K, payload: JobEventPayloadMap[K]): boolean {
    return super.emit(event, payload);
  }

  public on<K extends JobEventType>(
    event: K,
    listener: (payload: JobEventPayloadMap[K]) => void,
  ): this {
    super.on(event, listener as (...args: any[]) => void);
    return this;
  }

  public off<K extends JobEventType>(
    event: K,
    listener: (payload: JobEventPayloadMap[K]) => void,
  ): this {
    super.off(event, listener as (...args: any[]) => void);
    return this;
  }

  public once<K extends JobEventType>(
    event: K,
    listener: (payload: JobEventPayloadMap[K]) => void,
  ): this {
    super.once(event, listener as (...args: any[]) => void);
    return this;
  }
}
