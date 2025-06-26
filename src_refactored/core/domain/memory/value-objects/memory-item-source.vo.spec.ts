// src_refactored/core/domain/memory/value-objects/memory-item-source.vo.spec.ts
import { describe, it, expect } from 'vitest';
import { MemoryItemSource } from './memory-item-source.vo';
import { ValueError } from '../../../../common/errors';

describe('MemoryItemSource', () => {
  it('should create MemoryItemSource with a valid source string', () => {
    const source = 'user_interaction';
    const vo = MemoryItemSource.create(source);
    expect(vo).toBeInstanceOf(MemoryItemSource);
    expect(vo.value()).toBe(source);
  });

  it('should trim whitespace from source string', () => {
    const source = '  file_analysis  ';
    const vo = MemoryItemSource.create(source);
    expect(vo.value()).toBe('file_analysis');
  });

  it('should set value to null if source is null, undefined, or empty/whitespace string', () => {
    expect(MemoryItemSource.create(null).value()).toBeNull();
    expect(MemoryItemSource.create(undefined).value()).toBeNull();
    expect(MemoryItemSource.create('').value()).toBeNull();
    expect(MemoryItemSource.create('   ').value()).toBeNull();
  });

  it('should throw ValueError if source string is too long', () => {
    const longSource = 'a'.repeat(101); // MAX_LENGTH = 100
    expect(() => MemoryItemSource.create(longSource)).toThrow(ValueError);
    expect(() => MemoryItemSource.create(longSource)).toThrow('Memory item source must be no more than 100 characters long.');
  });

  it('should allow source at max length boundary', () => {
    const maxSource = 'a'.repeat(100);
    expect(() => MemoryItemSource.create(maxSource)).not.toThrow();
    expect(MemoryItemSource.create(maxSource).value()).toBe(maxSource);
  });

  it('should correctly compare two MemoryItemSources with the same value', () => {
    const source = 'external_api';
    const vo1 = MemoryItemSource.create(source);
    const vo2 = MemoryItemSource.create(` ${source} `); // Test trimming with comparison
    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should correctly compare two MemoryItemSources with different values', () => {
    const vo1 = MemoryItemSource.create('source1');
    const vo2 = MemoryItemSource.create('source2');
    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should correctly compare a source with value and one with null', () => {
    const vo1 = MemoryItemSource.create('source1');
    const vo2 = MemoryItemSource.create(null);
    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should correctly compare two null MemoryItemSources', () => {
    const vo1 = MemoryItemSource.create(null);
    const vo2 = MemoryItemSource.create(undefined);
    expect(vo1.equals(vo2)).toBe(true);
  });
});
