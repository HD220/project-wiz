// src_refactored/core/domain/memory/memory-item.entity.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';

import { EntityError, ValueError } from '@/core/common/errors';
import { Identity } from '@/core/common/value-objects/identity.vo';

import { MemoryItem, MemoryItemProps } from './memory-item.entity';
import { MemoryItemContent } from './value-objects/memory-item-content.vo';
import { MemoryItemEmbedding } from './value-objects/memory-item-embedding.vo';
import { MemoryItemId } from './value-objects/memory-item-id.vo';
import { MemoryItemSource } from './value-objects/memory-item-source.vo';
import { MemoryItemTags } from './value-objects/memory-item-tags.vo';

describe('MemoryItem Entity', () => {
  let validProps: MemoryItemProps;

  beforeEach(() => {
    validProps = {
      id: MemoryItemId.generate(),
      content: MemoryItemContent.create('Test memory content.'),
      tags: MemoryItemTags.create(['test', 'memory']),
      source: MemoryItemSource.create('test_source'),
      embedding: MemoryItemEmbedding.create([0.1, 0.2, 0.3]),
      agentId: Identity.generate(),
    };
  });

  it('should create a MemoryItem entity with all properties', () => {
    const item = MemoryItem.create(validProps);
    expect(item).toBeInstanceOf(MemoryItem);
    expect(item.id().equals(validProps.id)).toBe(true);
    expect(item.content().value()).toBe('Test memory content.');
    expect(item.tags().value()).toEqual(['test', 'memory']);
    expect(item.source().value()).toBe('test_source');
    expect(item.embedding().value()).toEqual([0.1, 0.2, 0.3]);
    expect(item.agentId()?.equals(validProps.agentId!)).toBe(true);
    expect(item.createdAt()).toBeInstanceOf(Date);
    expect(item.updatedAt()).toBeInstanceOf(Date);
  });

  it('should create with default VOs for tags, source, embedding if not provided', () => {
    const minimalProps: MemoryItemProps = {
      id: MemoryItemId.generate(),
      content: MemoryItemContent.create('Minimal content.'),
      // tags, source, embedding, agentId are undefined
    } as any; // Cast to bypass strict check for explicit undefined VOs

    const item = MemoryItem.create(minimalProps);
    expect(item.tags().value()).toEqual([]);
    expect(item.source().value()).toBeNull();
    expect(item.embedding().value()).toBeNull();
    expect(item.agentId()).toBeNull();
  });

  it('should throw EntityError if required properties (id, content) are missing', () => {
    expect(() => MemoryItem.create({ ...validProps, id: undefined } as any)).toThrow(EntityError);
    expect(() => MemoryItem.create({ ...validProps, content: undefined } as any)).toThrow(EntityError);
  });

  describe('updateContent', () => {
    it('should update content and change updatedAt', async () => {
      const item = MemoryItem.create(validProps);
      const originalUpdatedAt = item.updatedAt();
      const newContent = MemoryItemContent.create('Updated content.');

      await new Promise(resolve => setTimeout(resolve, 10)); // Ensure time passes
      const updatedItem = item.updateContent(newContent);

      expect(updatedItem.content().equals(newContent)).toBe(true);
      expect(updatedItem.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should throw ValueError if new content is null', () => {
      const item = MemoryItem.create(validProps);
      expect(() => item.updateContent(null as any)).toThrow(ValueError);
    });
  });

  describe('updateTags', () => {
    it('should update tags and change updatedAt', async () => {
      const item = MemoryItem.create(validProps);
      const originalUpdatedAt = item.updatedAt();
      const newTags = MemoryItemTags.create(['updated', 'tag']);

      await new Promise(resolve => setTimeout(resolve, 10));
      const updatedItem = item.updateTags(newTags);

      expect(updatedItem.tags().equals(newTags)).toBe(true);
      expect(updatedItem.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('updateSource', () => {
    it('should update source and change updatedAt', async () => {
      const item = MemoryItem.create(validProps);
      const originalUpdatedAt = item.updatedAt();
      const newSource = MemoryItemSource.create('new_test_source');

      await new Promise(resolve => setTimeout(resolve, 10));
      const updatedItem = item.updateSource(newSource);

      expect(updatedItem.source().equals(newSource)).toBe(true);
      expect(updatedItem.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });


  describe('setEmbedding', () => {
    it('should set embedding and change updatedAt', async () => {
      const item = MemoryItem.create(validProps);
      const originalUpdatedAt = item.updatedAt();
      const newEmbedding = MemoryItemEmbedding.create([0.4, 0.5, 0.6]);

      await new Promise(resolve => setTimeout(resolve, 10));
      const updatedItem = item.setEmbedding(newEmbedding);

      expect(updatedItem.embedding().equals(newEmbedding)).toBe(true);
      expect(updatedItem.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('assignAgent', () => {
    it('should assign agentId and change updatedAt', async () => {
      const item = MemoryItem.create({...validProps, agentId: null});
      const originalUpdatedAt = item.updatedAt();
      const newAgentId = Identity.generate();

      await new Promise(resolve => setTimeout(resolve, 10));
      const updatedItem = item.assignAgent(newAgentId);

      expect(updatedItem.agentId()?.equals(newAgentId)).toBe(true);
      expect(updatedItem.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should set agentId to null and change updatedAt', async () => {
      const item = MemoryItem.create(validProps); // Assuming agentId is not null here
      const originalUpdatedAt = item.updatedAt();

      await new Promise(resolve => setTimeout(resolve, 10));
      const updatedItem = item.assignAgent(null);

      expect(updatedItem.agentId()).toBeNull();
      expect(updatedItem.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('equals', () => {
    it('should return true for entities with the same ID', () => {
      const id = MemoryItemId.generate();
      const item1 = MemoryItem.create({ ...validProps, id });
      const item2 = MemoryItem.create({ ...validProps, id, content: MemoryItemContent.create('Diff content') });
      expect(item1.equals(item2)).toBe(true);
    });

    it('should return false for entities with different IDs', () => {
      const item1 = MemoryItem.create(validProps);
      const item2 = MemoryItem.create({ ...validProps, id: MemoryItemId.generate() });
      expect(item1.equals(item2)).toBe(false);
    });
  });
});
