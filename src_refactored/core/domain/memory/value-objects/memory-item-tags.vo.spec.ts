// src_refactored/core/domain/memory/value-objects/memory-item-tags.vo.spec.ts
import { describe, it, expect } from 'vitest';
import { MemoryItemTags } from './memory-item-tags.vo';
import { ValueError } from '../../../../common/errors';

describe('MemoryItemTags', () => {
  it('should create MemoryItemTags with a valid list of tags', () => {
    const tags = ['tag1', 'tag2', 'Tag Three'];
    const vo = MemoryItemTags.create(tags);
    expect(vo).toBeInstanceOf(MemoryItemTags);
    // Tags are trimmed and stored, comparison should be on processed values
    expect(vo.value()).toEqual(['tag1', 'tag2', 'Tag Three']);
  });

  it('should return an empty array if input is null, undefined, or empty array', () => {
    expect(MemoryItemTags.create(null).value()).toEqual([]);
    expect(MemoryItemTags.create(undefined).value()).toEqual([]);
    expect(MemoryItemTags.create([]).value()).toEqual([]);
  });

  it('should trim tags and remove duplicates', () => {
    const tags = ['  tag1  ', 'tag2  ', 'tag1', 'TAG2  ']; // Note: Set uniqueness is case-sensitive by default
    const vo = MemoryItemTags.create(tags);
    // The VO stores unique, trimmed tags. Order might not be guaranteed unless explicitly sorted by VO.
    // Current implementation makes them unique and keeps order of first occurrence.
    // For equality testing, we sort.
    expect(vo.value().sort()).toEqual(['tag1', 'tag2', 'TAG2'].sort());
  });

  it('should throw ValueError if too many tags are provided', () => {
    const tooManyTags = Array.from({ length: 21 }, (_, i) => `tag${i}`); // MAX_TAGS = 20
    expect(() => MemoryItemTags.create(tooManyTags)).toThrow(ValueError);
    expect(() => MemoryItemTags.create(tooManyTags)).toThrow('A memory item cannot have more than 20 tags.');
  });

  it('should throw ValueError if a tag is null or undefined in the list', () => {
    expect(() => MemoryItemTags.create(['tag1', null as any])).toThrow(ValueError);
    expect(() => MemoryItemTags.create(['tag1', null as any])).toThrow('Tag cannot be null or undefined.');
  });

  it('should throw ValueError if a tag is too short', () => {
    expect(() => MemoryItemTags.create(['tag1', ''])).toThrow(ValueError); // Empty string tag after trim
    expect(() => MemoryItemTags.create(['tag1', '  '])).toThrow(ValueError);
    expect(() => MemoryItemTags.create(['tag1', ''])).toThrow('Tag "" is too short. Minimum length is 1.');
  });

  it('should throw ValueError if a tag is too long', () => {
    const longTag = 'a'.repeat(51); // MAX_TAG_LENGTH = 50
    expect(() => MemoryItemTags.create(['tag1', longTag])).toThrow(ValueError);
    expect(() => MemoryItemTags.create(['tag1', longTag])).toThrow(`Tag "${longTag}" is too long. Maximum length is 50.`);
  });

  it('should throw ValueError for duplicate tags after cleaning', () => {
    expect(() => MemoryItemTags.create(['tag1', '  tag1  '])).toThrow(ValueError);
    expect(() => MemoryItemTags.create(['tag1', '  tag1  '])).toThrow('Duplicate tags are not allowed.');
  });

  it('should correctly compare two MemoryItemTags with the same tags (order insensitive)', () => {
    const tags1 = ['tag1', 'tag2'];
    const tags2 = ['tag2', 'tag1'];
    const vo1 = MemoryItemTags.create(tags1);
    const vo2 = MemoryItemTags.create(tags2);
    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should correctly compare two MemoryItemTags with different tags', () => {
    const vo1 = MemoryItemTags.create(['tag1', 'tag2']);
    const vo2 = MemoryItemTags.create(['tag1', 'tag3']);
    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should correctly compare when one has tags and other is empty', () => {
    const vo1 = MemoryItemTags.create(['tag1']);
    const vo2 = MemoryItemTags.create([]);
    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should correctly compare two empty MemoryItemTags', () => {
    const vo1 = MemoryItemTags.create([]);
    const vo2 = MemoryItemTags.create(null);
    expect(vo1.equals(vo2)).toBe(true);
  });
});
