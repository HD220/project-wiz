// src_refactored/core/domain/memory/value-objects/memory-item-embedding.vo.spec.ts
import { describe, it, expect } from 'vitest';

import { ValueError } from '@/domain/common/errors';

import { MemoryItemEmbedding } from './memory-item-embedding.vo';

describe('MemoryItemEmbedding', () => {
  it('should create MemoryItemEmbedding with a valid array of numbers', () => {
    const embedding = [0.1, 0.2, 0.3, 0.4];
    const vo = MemoryItemEmbedding.create(embedding);
    expect(vo).toBeInstanceOf(MemoryItemEmbedding);
    expect(vo.value()).toEqual(embedding);
    expect(vo.value()).not.toBe(embedding); // Ensure it's a copy
  });

  it('should set value to null if embedding is null or undefined', () => {
    expect(MemoryItemEmbedding.create(null).value()).toBeNull();
    expect(MemoryItemEmbedding.create(undefined).value()).toBeNull();
  });

  it('should throw ValueError if embedding array is empty', () => {
    expect(() => MemoryItemEmbedding.create([])).toThrow(ValueError);
    expect(() => MemoryItemEmbedding.create([])).toThrow('Embedding array cannot be empty if provided. Use null for no embedding.');
  });

  it('should throw ValueError if any element in embedding array is not a finite number', () => {
    expect(() => MemoryItemEmbedding.create([0.1, NaN, 0.3])).toThrow(ValueError);
    expect(() => MemoryItemEmbedding.create([0.1, Infinity, 0.3])).toThrow(ValueError);
    expect(() => MemoryItemEmbedding.create([0.1, -Infinity, 0.3])).toThrow(ValueError);
    expect(() => MemoryItemEmbedding.create([0.1, 'not-a-number' as any, 0.3])).toThrow(ValueError);
    expect(() => MemoryItemEmbedding.create([0.1, NaN, 0.3])).toThrow('All elements in the embedding array must be finite numbers.');
  });

  // Optional: Test for specific dimension if it were enforced
  // it('should throw ValueError if embedding dimension is incorrect', () => {
  //   // Assuming EXPECTED_DIMENSION = 3 for this test in VO
  //   expect(() => MemoryItemEmbedding.create([0.1, 0.2])).toThrow(ValueError);
  //   expect(() => MemoryItemEmbedding.create([0.1, 0.2, 0.3, 0.4])).toThrow(ValueError);
  // });

  it('should correctly compare two MemoryItemEmbeddings with the same numeric array values', () => {
    const embedding = [0.5, -0.5, 1.0];
    const vo1 = MemoryItemEmbedding.create(embedding);
    const vo2 = MemoryItemEmbedding.create([...embedding]); // Create with a copy
    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should correctly compare two MemoryItemEmbeddings with different array values', () => {
    const vo1 = MemoryItemEmbedding.create([0.1, 0.2]);
    const vo2 = MemoryItemEmbedding.create([0.3, 0.4]);
    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should correctly compare two MemoryItemEmbeddings with arrays of different lengths', () => {
    const vo1 = MemoryItemEmbedding.create([0.1, 0.2]);
    const vo2 = MemoryItemEmbedding.create([0.1, 0.2, 0.3]);
    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should correctly compare an embedding with value and one with null', () => {
    const vo1 = MemoryItemEmbedding.create([0.1, 0.2]);
    const vo2 = MemoryItemEmbedding.create(null);
    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should correctly compare two null MemoryItemEmbeddings', () => {
    const vo1 = MemoryItemEmbedding.create(null);
    const vo2 = MemoryItemEmbedding.create(undefined);
    expect(vo1.equals(vo2)).toBe(true);
  });

  it('value() should return a copy of the array', () => {
    const originalEmbedding = [1, 2, 3];
    const vo = MemoryItemEmbedding.create(originalEmbedding);
    const val = vo.value();
    expect(val).toEqual(originalEmbedding);
    expect(val).not.toBe(originalEmbedding); // Must be a copy

    if (val) { // Type guard
      val.push(4); // Modify the copy
    }
    expect(vo.value()).toEqual(originalEmbedding); // Original in VO should be unchanged
  });

  it('value() should return null if internal value is null', () => {
    const vo = MemoryItemEmbedding.create(null);
    expect(vo.value()).toBeNull();
  });
});
