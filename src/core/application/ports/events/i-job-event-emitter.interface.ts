// src/core/application/ports/events/i-job-event-emitter.interface.ts
import {
  JobEventType,
  JobEventPayloadMap,
} from "@/core/application/queue/events/job-event.types";
// Corrected path

export const JOB_EVENT_EMITTER_TOKEN = Symbol("IJobEventEmitter");

export interface IJobEventEmitter<P extends { userId?: string }, R = unknown> {
  emit<K extends JobEventType>(
    event: K,
    payload: JobEventPayloadMap<P, R>[K]
  ): boolean;

  on<K extends JobEventType>(
    event: K,
    listener: (payload: JobEventPayloadMap<P, R>[K]) => void
  ): this;

  off<K extends JobEventType>(
    event: K,
    listener: (payload: JobEventPayloadMap<P, R>[K]) => void
  ): this;

  once<K extends JobEventType>(
    event: K,
    listener: (payload: JobEventPayloadMap<P, R>[K]) => void
  ): this;

  removeAllListeners(event?: JobEventType): this;

  listenerCount(event: JobEventType): number;
}
