// src_refactored/infrastructure/events/in-memory-job-event-emitter.ts
import { EventEmitter } from 'events';
import {
  JobEventType,
  JobEventPayloadMap,
  QueueName,
  JobId,
  WorkerId,
} from '../../core/domain/job/events/job-event.types';

// Interface for the event emitter to allow for different implementations later if needed
export interface IJobEventEmitter {
  emit<K extends JobEventType>(event: K, payload: JobEventPayloadMap[K]): boolean;

  on<K extends JobEventType>(
    event: K,
    listener: (payload: JobEventPayloadMap[K]) => void,
  ): this;

  off<K extends JobEventType>(
    event: K,
    listener: (payload: JobEventPayloadMap[K]) => void,
  ): this;

  once<K extends JobEventType>(
    event: K,
    listener: (payload: JobEventPayloadMap[K]) => void,
  ): this;

  removeAllListeners(event?: JobEventType): this;
  listenerCount(event: JobEventType): number;
}


export class InMemoryJobEventEmitter extends EventEmitter implements IJobEventEmitter {
  constructor() {
    super();
    // Increase max listeners if needed, default is 10
    // this.setMaxListeners(20);
  }

  // Provide strongly-typed wrappers

  public emit<K extends JobEventType>(event: K, payload: JobEventPayloadMap[K]): boolean {
    // The payload itself contains queueName, jobId etc. as per JobEventPayloadMap definitions
    return super.emit(event, payload);
  }

  public on<K extends JobEventType>(
    event: K,
    listener: (payload: JobEventPayloadMap[K]) => void,
  ): this {
    super.on(event, listener as (...args: any[]) => void); // Cast listener for compatibility
    return this;
  }

  public off<K extends JobEventType>(
    event: K,
    listener: (payload: JobEventPayloadMap[K]) => void,
  ): this {
    super.off(event, listener as (...args: any[]) => void); // Cast listener
    return this;
  }

  public once<K extends JobEventType>(
    event: K,
    listener: (payload: JobEventPayloadMap[K]) => void,
  ): this {
    super.once(event, listener as (...args: any[]) => void); // Cast listener
    return this;
  }

  // removeAllListeners and listenerCount can be inherited directly if their
  // signature matches EventEmitter's and is acceptable.
  // EventEmitter's removeAllListeners([eventName]) and listenerCount(eventName) are fine.
}

// Optional: Export a default instance if it's to be used as a singleton directly
// export const globalJobEventEmitter = new InMemoryJobEventEmitter();
// However, it's often better to let DI handle singleton creation and injection.
// For now, just exporting the class.
