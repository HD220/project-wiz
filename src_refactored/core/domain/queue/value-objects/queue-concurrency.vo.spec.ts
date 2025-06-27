// src_refactored/core/domain/queue/value-objects/queue-concurrency.vo.spec.ts
import { describe, it, expect } from 'vitest';

import { ValueError } from '@/domain/common/errors';

import { QueueConcurrency } from './queue-concurrency.vo';

describe('QueueConcurrency', () => {
  it('should create a QueueConcurrency with a valid integer value', () => {
    const value = 5;
    const vo = QueueConcurrency.create(value);
    expect(vo).toBeInstanceOf(QueueConcurrency);
    expect(vo.value()).toBe(value);
  });

  it('should throw ValueError if value is null or undefined', () => {
    expect(() => QueueConcurrency.create(null as any)).toThrow(ValueError);
    expect(() => QueueConcurrency.create(undefined as any)).toThrow(ValueError);
  });

  it('should throw ValueError if value is not an integer', () => {
    expect(() => QueueConcurrency.create(5.5)).toThrow(ValueError);
    expect(() => QueueConcurrency.create(NaN)).toThrow(ValueError);
  });

  it('should throw ValueError if value is less than MIN_VALUE (1)', () => {
    expect(() => QueueConcurrency.create(0)).toThrow(ValueError);
    expect(() => QueueConcurrency.create(-1)).toThrow(ValueError);
  });

  it('should throw ValueError if value is greater than MAX_VALUE (100)', () => {
    expect(() => QueueConcurrency.create(101)).toThrow(ValueError);
  });

  it('should allow values at min and max boundaries', () => {
    expect(() => QueueConcurrency.create(1)).not.toThrow();
    expect(QueueConcurrency.create(1).value()).toBe(1);
    expect(() => QueueConcurrency.create(100)).not.toThrow();
    expect(QueueConcurrency.create(100).value()).toBe(100);
  });

  it('should correctly compare two QueueConcurrencys with the same value', () => {
    const value = 10;
    const vo1 = QueueConcurrency.create(value);
    const vo2 = QueueConcurrency.create(value);
    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should correctly compare two QueueConcurrencys with different values', () => {
    const vo1 = QueueConcurrency.create(5);
    const vo2 = QueueConcurrency.create(15);
    expect(vo1.equals(vo2)).toBe(false);
  });
});
