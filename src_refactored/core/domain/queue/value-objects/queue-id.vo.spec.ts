// src_refactored/core/domain/queue/value-objects/queue-id.vo.spec.ts
import { randomUUID } from 'crypto';

import { describe, it, expect } from 'vitest';

import { QueueId } from './queue-id.vo';

describe('QueueId', () => {
  it('should create a QueueId from a valid UUID string', () => {
    const validUUID = randomUUID();
    const queueId = QueueId.fromString(validUUID);
    expect(queueId).toBeInstanceOf(QueueId);
    expect(queueId.value()).toBe(validUUID);
  });

  it('should generate a valid QueueId', () => {
    const queueId = QueueId.generate();
    expect(queueId).toBeInstanceOf(QueueId);
    expect(queueId.value()).toMatch(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
  });

  it('should throw an error if creating from an invalid UUID string', () => {
    const invalidUUID = 'not-a-uuid';
    expect(() => QueueId.fromString(invalidUUID)).toThrow('Invalid UUID format');
  });

  it('should correctly compare two QueueIds with the same value', () => {
    const uuid = randomUUID();
    const id1 = QueueId.fromString(uuid);
    const id2 = QueueId.fromString(uuid);
    expect(id1.equals(id2)).toBe(true);
  });

  it('should correctly compare two QueueIds with different values', () => {
    const id1 = QueueId.generate();
    const id2 = QueueId.generate();
    expect(id1.equals(id2)).toBe(false);
  });
});
