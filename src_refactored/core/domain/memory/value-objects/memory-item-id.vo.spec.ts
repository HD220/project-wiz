// src_refactored/core/domain/memory/value-objects/memory-item-id.vo.spec.ts
import { describe, it, expect } from 'vitest';
import { MemoryItemId } from './memory-item-id.vo';
import { randomUUID } from 'crypto';

describe('MemoryItemId', () => {
  it('should create a MemoryItemId from a valid UUID string', () => {
    const validUUID = randomUUID();
    const memoryId = MemoryItemId.fromString(validUUID);
    expect(memoryId).toBeInstanceOf(MemoryItemId);
    expect(memoryId.value()).toBe(validUUID);
  });

  it('should generate a valid MemoryItemId', () => {
    const memoryId = MemoryItemId.generate();
    expect(memoryId).toBeInstanceOf(MemoryItemId);
    expect(memoryId.value()).toMatch(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
  });

  it('should throw an error if creating from an invalid UUID string', () => {
    const invalidUUID = 'not-a-uuid';
    expect(() => MemoryItemId.fromString(invalidUUID)).toThrow('Invalid UUID format');
  });

  it('should correctly compare two MemoryItemIds with the same value', () => {
    const uuid = randomUUID();
    const id1 = MemoryItemId.fromString(uuid);
    const id2 = MemoryItemId.fromString(uuid);
    expect(id1.equals(id2)).toBe(true);
  });

  it('should correctly compare two MemoryItemIds with different values', () => {
    const id1 = MemoryItemId.generate();
    const id2 = MemoryItemId.generate();
    expect(id1.equals(id2)).toBe(false);
  });
});
