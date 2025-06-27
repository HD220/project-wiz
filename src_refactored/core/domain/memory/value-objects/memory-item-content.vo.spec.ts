// src_refactored/core/domain/memory/value-objects/memory-item-content.vo.spec.ts
import { describe, it, expect } from 'vitest';

import { ValueError } from '@/domain/common/errors';

import { MemoryItemContent } from './memory-item-content.vo';

describe('MemoryItemContent', () => {
  it('should create a MemoryItemContent with valid content', () => {
    const content = 'This is valid memory content.';
    const vo = MemoryItemContent.create(content);
    expect(vo).toBeInstanceOf(MemoryItemContent);
    expect(vo.value()).toBe(content);
  });

  it('should throw ValueError if content is null or undefined', () => {
    expect(() => MemoryItemContent.create(null as any)).toThrow(ValueError);
    expect(() => MemoryItemContent.create(undefined as any)).toThrow(ValueError);
  });

  it('should throw ValueError if trimmed content is empty', () => {
    expect(() => MemoryItemContent.create('')).toThrow(ValueError);
    expect(() => MemoryItemContent.create('   ')).toThrow(ValueError);
  });

  it('should throw ValueError if content is too long', () => {
    const longContent = 'a'.repeat(10001); // MAX_LENGTH = 10000
    expect(() => MemoryItemContent.create(longContent)).toThrow(ValueError);
  });

  it('should allow content at min and max length boundaries (after trimming)', () => {
    const minContent = 'A';
    expect(() => MemoryItemContent.create(minContent)).not.toThrow();
    const minContentSpaced = '  A  ';
    expect(() => MemoryItemContent.create(minContentSpaced)).not.toThrow();

    const maxContent = 'a'.repeat(10000);
    expect(() => MemoryItemContent.create(maxContent)).not.toThrow();
  });

  it('should correctly compare two MemoryItemContents with the same value', () => {
    const content = 'Identical content.';
    const vo1 = MemoryItemContent.create(content);
    const vo2 = MemoryItemContent.create(content);
    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should correctly compare two MemoryItemContents with different values', () => {
    const vo1 = MemoryItemContent.create('Content One');
    const vo2 = MemoryItemContent.create('Content Two');
    expect(vo1.equals(vo2)).toBe(false);
  });
});
