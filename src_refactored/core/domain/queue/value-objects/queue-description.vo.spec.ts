// src_refactored/core/domain/queue/value-objects/queue-description.vo.spec.ts
import { describe, it, expect } from 'vitest';

import { ValueError } from '@/domain/common/errors';

import { QueueDescription } from './queue-description.vo';

describe('QueueDescription', () => {
  it('should create QueueDescription with a valid description string', () => {
    const description = 'This queue processes high-priority tasks.';
    const vo = QueueDescription.create(description);
    expect(vo).toBeInstanceOf(QueueDescription);
    expect(vo.value()).toBe(description);
  });

  it('should trim whitespace from description string', () => {
    const description = '  Handles urgent requests.  ';
    const vo = QueueDescription.create(description);
    expect(vo.value()).toBe('Handles urgent requests.');
  });

  it('should set value to null if description is null, undefined, or empty/whitespace string', () => {
    expect(QueueDescription.create(null).value()).toBeNull();
    expect(QueueDescription.create(undefined).value()).toBeNull();
    expect(QueueDescription.create('').value()).toBeNull();
    expect(QueueDescription.create('   ').value()).toBeNull();
  });

  it('should throw ValueError if description string is too long', () => {
    const longDescription = 'a'.repeat(256); // MAX_LENGTH = 255
    expect(() => QueueDescription.create(longDescription)).toThrow(ValueError);
    expect(() => QueueDescription.create(longDescription)).toThrow('Queue description must be no more than 255 characters long.');
  });

  it('should allow description at max length boundary (after trim)', () => {
    const maxDescription = 'a'.repeat(255);
    expect(() => QueueDescription.create(maxDescription)).not.toThrow();
    expect(QueueDescription.create(maxDescription).value()).toBe(maxDescription);

    const maxDescriptionSpaced = `  ${'a'.repeat(255)}  `;
    expect(() => QueueDescription.create(maxDescriptionSpaced)).not.toThrow(); // Trims to 255
  });

  it('should correctly compare two QueueDescriptions with the same value', () => {
    const description = 'General purpose queue.';
    const vo1 = QueueDescription.create(description);
    const vo2 = QueueDescription.create(` ${description} `);
    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should correctly compare two QueueDescriptions with different values', () => {
    const vo1 = QueueDescription.create('Description A');
    const vo2 = QueueDescription.create('Description B');
    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should correctly compare a description with value and one with null', () => {
    const vo1 = QueueDescription.create('Description A');
    const vo2 = QueueDescription.create(null);
    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should correctly compare two null QueueDescriptions', () => {
    const vo1 = QueueDescription.create(null);
    const vo2 = QueueDescription.create(undefined);
    expect(vo1.equals(vo2)).toBe(true);
  });
});
