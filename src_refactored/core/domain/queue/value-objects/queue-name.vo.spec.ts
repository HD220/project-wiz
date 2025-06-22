// src_refactored/core/domain/queue/value-objects/queue-name.vo.spec.ts
import { describe, it, expect } from 'vitest';
import { QueueName } from './queue-name.vo';
import { ValueError } from '../../../../common/errors';

describe('QueueName', () => {
  it('should create a QueueName with a valid name and convert to lowercase', () => {
    const name = 'My_Queue-123';
    const vo = QueueName.create(name);
    expect(vo).toBeInstanceOf(QueueName);
    expect(vo.value()).toBe('my_queue-123');
  });

  it('should trim whitespace and convert to lowercase', () => {
    const name = '  My_Queue-123  ';
    const vo = QueueName.create(name);
    expect(vo.value()).toBe('my_queue-123');
  });

  it('should throw ValueError if name is null or undefined', () => {
    expect(() => QueueName.create(null as any)).toThrow(ValueError);
    expect(() => QueueName.create(undefined as any)).toThrow(ValueError);
  });

  it('should throw ValueError if name is empty after trim', () => {
    expect(() => QueueName.create('')).toThrow(ValueError);
    expect(() => QueueName.create('   ')).toThrow(ValueError);
  });

  it('should throw ValueError if name is too short', () => {
    expect(() => QueueName.create('a')).toThrow(ValueError);
    expect(() => QueueName.create('ab')).toThrow(ValueError);
  });

  it('should throw ValueError if name is too long', () => {
    const longName = 'a'.repeat(51);
    expect(() => QueueName.create(longName)).toThrow(ValueError);
  });

  it('should allow names at min and max length boundaries', () => {
    const minName = 'abc';
    expect(() => QueueName.create(minName)).not.toThrow();
    const maxName = 'a'.repeat(50);
    expect(() => QueueName.create(maxName)).not.toThrow();
  });

  it('should throw ValueError for names with invalid characters or structure', () => {
    expect(() => QueueName.create('Queue Name')).toThrow(ValueError); // Space
    expect(() => QueueName.create('queue.name')).toThrow(ValueError); // Dot
    expect(() => QueueName.create('!queuename')).toThrow(ValueError); // Starts with !
    expect(() => QueueName.create('queuename!')).toThrow(ValueError); // Ends with !
    expect(() => QueueName.create('-queue')).toThrow(ValueError);
    expect(() => QueueName.create('queue-')).toThrow(ValueError);
    expect(() => QueueName.create('_queue')).toThrow(ValueError);
    expect(() => QueueName.create('queue_')).toThrow(ValueError);
  });

  it('should allow names with hyphens and underscores in the middle', () => {
    expect(() => QueueName.create('queue-name')).not.toThrow();
    expect(() => QueueName.create('queue_name_123')).not.toThrow();
  });

  it('should correctly compare two QueueNames with the same value (case-insensitive)', () => {
    const name1 = 'TestQueue';
    const name2 = 'testqueue';
    const vo1 = QueueName.create(name1);
    const vo2 = QueueName.create(name2);
    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should correctly compare two QueueNames with different values', () => {
    const vo1 = QueueName.create('Queue1');
    const vo2 = QueueName.create('Queue2');
    expect(vo1.equals(vo2)).toBe(false);
  });
});
