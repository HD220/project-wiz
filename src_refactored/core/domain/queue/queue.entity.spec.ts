// src_refactored/core/domain/queue/queue.entity.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';

import { EntityError, ValueError } from '@/core/common/errors';

import { Queue, QueueProps } from './queue.entity';
import { QueueConcurrency } from './value-objects/queue-concurrency.vo';
import { QueueDescription } from './value-objects/queue-description.vo';
import { QueueId } from './value-objects/queue-id.vo';
import { QueueName } from './value-objects/queue-name.vo';

describe('Queue Entity', () => {
  let validProps: QueueProps;

  beforeEach(() => {
    validProps = {
      id: QueueId.generate(),
      name: QueueName.create('default-queue'),
      concurrency: QueueConcurrency.create(5),
      description: QueueDescription.create('This is the default queue.'),
    };
  });

  it('should create a Queue entity with all properties', () => {
    const queue = Queue.create(validProps);
    expect(queue).toBeInstanceOf(Queue);
    expect(queue.id().equals(validProps.id)).toBe(true);
    expect(queue.name().value()).toBe('default-queue');
    expect(queue.concurrency().value()).toBe(5);
    expect(queue.description().value()).toBe('This is the default queue.');
    expect(queue.createdAt()).toBeInstanceOf(Date);
    expect(queue.updatedAt()).toBeInstanceOf(Date);
  });

  it('should create with default QueueDescription if not provided', () => {
    const minimalProps: QueueProps = {
      id: QueueId.generate(),
      name: QueueName.create('minimal-queue'),
      concurrency: QueueConcurrency.create(1),
      // description is undefined
    } as any;

    const queue = Queue.create(minimalProps);
    expect(queue.description().value()).toBeNull();
  });

  it('should throw EntityError if required properties (id, name, concurrency) are missing', () => {
    expect(() => Queue.create({ ...validProps, id: undefined } as any)).toThrow(EntityError);
    expect(() => Queue.create({ ...validProps, name: undefined } as any)).toThrow(EntityError);
    expect(() => Queue.create({ ...validProps, concurrency: undefined } as any)).toThrow(EntityError);
  });

  describe('updateDetails', () => {
    it('should update name and description, and change updatedAt', async () => {
      const queue = Queue.create(validProps);
      const originalUpdatedAt = queue.updatedAt();
      const newName = QueueName.create('updated-queue');
      const newDescription = QueueDescription.create('Updated description.');

      await new Promise(resolve => setTimeout(resolve, 10)); // Ensure time passes
      const updatedQueue = queue.updateDetails({ name: newName, description: newDescription });

      expect(updatedQueue.name().equals(newName)).toBe(true);
      expect(updatedQueue.description().equals(newDescription)).toBe(true);
      expect(updatedQueue.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should update only name if only name is provided', async () => {
      const queue = Queue.create(validProps);
      const originalDescription = queue.description();
      const newName = QueueName.create('name-only-update');

      await new Promise(resolve => setTimeout(resolve, 10));
      const updatedQueue = queue.updateDetails({ name: newName });

      expect(updatedQueue.name().equals(newName)).toBe(true);
      expect(updatedQueue.description().equals(originalDescription)).toBe(true); // Description unchanged
    });

    it('should return the same instance if no properties are changed', () => {
      const queue = Queue.create(validProps);
      const updatedQueue = queue.updateDetails({ name: validProps.name });
      expect(updatedQueue).toBe(queue);
      expect(updatedQueue.updatedAt()).toEqual(queue.updatedAt());
    });
  });

  describe('setConcurrency', () => {
    it('should update concurrency and change updatedAt', async () => {
      const queue = Queue.create(validProps);
      const originalUpdatedAt = queue.updatedAt();
      const newConcurrency = QueueConcurrency.create(10);

      await new Promise(resolve => setTimeout(resolve, 10));
      const updatedQueue = queue.setConcurrency(newConcurrency);

      expect(updatedQueue.concurrency().equals(newConcurrency)).toBe(true);
      expect(updatedQueue.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should throw ValueError if new concurrency is null', () => {
      const queue = Queue.create(validProps);
      expect(() => queue.setConcurrency(null as any)).toThrow(ValueError);
    });
  });

  describe('equals', () => {
    it('should return true for entities with the same ID', () => {
      const id = QueueId.generate();
      const queue1 = Queue.create({ ...validProps, id });
      const queue2 = Queue.create({ ...validProps, id, name: QueueName.create('another-name') });
      expect(queue1.equals(queue2)).toBe(true);
    });

    it('should return false for entities with different IDs', () => {
      const queue1 = Queue.create(validProps);
      const queue2 = Queue.create({ ...validProps, id: QueueId.generate() });
      expect(queue1.equals(queue2)).toBe(false);
    });
  });
});
