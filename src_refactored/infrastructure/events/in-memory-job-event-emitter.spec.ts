// src_refactored/infrastructure/events/in-memory-job-event-emitter.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { InMemoryJobEventEmitter, IJobEventEmitter } from './in-memory-job-event-emitter';
import { JobEventPayloadMap, JobId, QueueName, WorkerId } from '../../core/domain/job/events/job-event.types';
import { JobEntity } from '../../core/domain/job/job.entity';
import { JobExecutionLogEntryProps } from '../../core/domain/job/value-objects/job-execution-log-entry.vo';

describe('InMemoryJobEventEmitter', () => {
  let eventEmitter: IJobEventEmitter;

  beforeEach(() => {
    eventEmitter = new InMemoryJobEventEmitter();
  });

  it('should allow subscribing to and emitting an event', () => {
    const listener = vi.fn();
    const payload: JobEventPayloadMap['job.added'] = {
      queueName: 'test-queue' as QueueName,
      jobId: 'job-123' as JobId,
      // Mock a minimal JobEntity or use a simpler object if JobEntity is too complex to mock
      job: { id: { value: 'job-123' } } as unknown as JobEntity<any, any>,
    };

    eventEmitter.on('job.added', listener);
    eventEmitter.emit('job.added', payload);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(payload);
  });

  it('should call multiple listeners for the same event', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const payload: JobEventPayloadMap['queue.paused'] = {
      queueName: 'another-queue' as QueueName,
    };

    eventEmitter.on('queue.paused', listener1);
    eventEmitter.on('queue.paused', listener2);
    eventEmitter.emit('queue.paused', payload);

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener1).toHaveBeenCalledWith(payload);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledWith(payload);
  });

  it('should remove a specific listener using off()', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn(); // This one will remain
    const payload: JobEventPayloadMap['job.removed'] = {
      queueName: 'test-queue' as QueueName,
      jobId: 'job-456' as JobId,
    };

    eventEmitter.on('job.removed', listener1);
    eventEmitter.on('job.removed', listener2);

    eventEmitter.off('job.removed', listener1);
    eventEmitter.emit('job.removed', payload);

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledWith(payload);
  });

  it('should call a listener subscribed with once() only once', () => {
    const listener = vi.fn();
    const payload: JobEventPayloadMap['job.completed'] = {
      queueName: 'test-queue' as QueueName,
      jobId: 'job-789' as JobId,
      result: { message: 'done' },
    };

    eventEmitter.once('job.completed', listener);
    eventEmitter.emit('job.completed', payload);
    eventEmitter.emit('job.completed', payload); // Emit a second time

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(payload);
  });

  it('should correctly report listener count', () => {
    const listener1 = () => {};
    const listener2 = () => {};

    expect(eventEmitter.listenerCount('job.failed')).toBe(0);

    eventEmitter.on('job.failed', listener1);
    expect(eventEmitter.listenerCount('job.failed')).toBe(1);

    eventEmitter.on('job.failed', listener2);
    expect(eventEmitter.listenerCount('job.failed')).toBe(2);

    eventEmitter.off('job.failed', listener1);
    expect(eventEmitter.listenerCount('job.failed')).toBe(1);
  });

  it('should remove all listeners for a specific event', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const payload: JobEventPayloadMap['worker.error'] = {
        queueName: 'email-queue' as QueueName,
        workerId: 'worker-abc' as WorkerId,
        error: new Error('Worker crashed')
    };

    eventEmitter.on('worker.error', listener1);
    eventEmitter.on('worker.error', listener2);

    eventEmitter.removeAllListeners('worker.error');
    eventEmitter.emit('worker.error', payload);

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
    expect(eventEmitter.listenerCount('worker.error')).toBe(0);
  });

  it('should remove all listeners if no event is specified in removeAllListeners', () => {
    const jobAddedListener = vi.fn();
    const queuePausedListener = vi.fn();

    eventEmitter.on('job.added', jobAddedListener);
    eventEmitter.on('queue.paused', queuePausedListener);

    eventEmitter.removeAllListeners();

    eventEmitter.emit('job.added', { queueName: 'q1', jobId: 'j1', job: {} } as JobEventPayloadMap['job.added']);
    eventEmitter.emit('queue.paused', { queueName: 'q2'} as JobEventPayloadMap['queue.paused']);

    expect(jobAddedListener).not.toHaveBeenCalled();
    expect(queuePausedListener).not.toHaveBeenCalled();
    expect(eventEmitter.listenerCount('job.added')).toBe(0);
    expect(eventEmitter.listenerCount('queue.paused')).toBe(0);
  });

  it('should handle events with different payload structures correctly', () => {
    const jobLogListener = vi.fn();
    const jobStalledListener = vi.fn();

    const logPayload: JobEventPayloadMap['job.log_added'] = {
        queueName: "log_queue" as QueueName,
        jobId: "log_job_1" as JobId,
        logEntry: { timestamp: Date.now(), message: "Log message", level: 'INFO' } as JobExecutionLogEntryProps
    };
    const stalledPayload: JobEventPayloadMap['job.stalled'] = {
        queueName: "stalled_queue" as QueueName,
        jobId: "stalled_job_1" as JobId,
    };

    eventEmitter.on('job.log_added', jobLogListener);
    eventEmitter.on('job.stalled', jobStalledListener);

    eventEmitter.emit('job.log_added', logPayload);
    eventEmitter.emit('job.stalled', stalledPayload);

    expect(jobLogListener).toHaveBeenCalledWith(logPayload);
    expect(jobStalledListener).toHaveBeenCalledWith(stalledPayload);
  });
});
