// src_refactored/core/application/use-cases/memory/save-memory-item.use-case.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ZodError } from 'zod';


import { Identity } from '@/core/common/value-objects/identity.vo';

import { MemoryItem } from '@/domain/memory/memory-item.entity';
import { IMemoryRepository } from '@/domain/memory/ports/memory-repository.interface';
import { MemoryItemContent } from '@/domain/memory/value-objects/memory-item-content.vo';
import { MemoryItemEmbedding } from '@/domain/memory/value-objects/memory-item-embedding.vo';
import { MemoryItemId } from '@/domain/memory/value-objects/memory-item-id.vo';
import { MemoryItemSource } from '@/domain/memory/value-objects/memory-item-source.vo';
import { MemoryItemTags } from '@/domain/memory/value-objects/memory-item-tags.vo';

import { DomainError, NotFoundError, ValueError } from '@/application/common/errors'; // Or @/domain/common/errors

import { ok, error } from '@/shared/result';

import { SaveMemoryItemUseCaseInput } from './save-memory-item.schema';
import { SaveMemoryItemUseCase } from './save-memory-item.use-case';

const mockMemoryRepository: IMemoryRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  findByAgentId: vi.fn(), delete: vi.fn(), searchSimilar: vi.fn(), listAll: vi.fn(), search: vi.fn(), // Added search from IJobRepository for IMemoryRepository
};

describe('SaveMemoryItemUseCase', () => {
  let useCase: SaveMemoryItemUseCase;
  const testAgentId = Identity.generate();
  const existingItemId = MemoryItemId.generate();
  let existingMemoryItem: MemoryItem;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    useCase = new SaveMemoryItemUseCase(mockMemoryRepository);

    const now = new Date();
    vi.setSystemTime(now);
    existingMemoryItem = MemoryItem.create({
      id: existingItemId,
      content: MemoryItemContent.create('Original content'),
      agentId: testAgentId,
      tags: MemoryItemTags.create(['original', 'tag']),
      source: MemoryItemSource.create('initial_source'),
      embedding: MemoryItemEmbedding.create([0.1, 0.2]),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Creation Scenarios ---
  it('should successfully create a new memory item with all fields', async () => {
    (mockMemoryRepository.save as vi.Mock).mockImplementation(async (item: MemoryItem) => ok(item));
    const input: SaveMemoryItemUseCaseInput = {
      content: 'New memory content',
      agentId: testAgentId.value(),
      tags: ['new', 'test'],
      source: 'test_case',
      embedding: [0.3, 0.4, 0.5],
    };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(mockMemoryRepository.save).toHaveBeenCalledTimes(1);
    const savedItem = (mockMemoryRepository.save as vi.Mock).mock.calls[0][0] as MemoryItem;
    if (result.isOk()) {
      expect(result.value.memoryItemId).toBe(savedItem.id().value());
      expect(savedItem.content().value()).toBe('New memory content');
      expect(savedItem.agentId()?.equals(testAgentId)).toBe(true);
      expect(savedItem.tags().list()).toEqual(['new', 'test']);
      expect(savedItem.source().value()).toBe('test_case');
      expect(savedItem.embedding().value()).toEqual([0.3, 0.4, 0.5]);
    }
  });

  it('should create a new memory item with minimal required fields (content)', async () => {
    (mockMemoryRepository.save as vi.Mock).mockImplementation(async (item: MemoryItem) => ok(item));
    const input: SaveMemoryItemUseCaseInput = { content: 'Minimal content' };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const savedItem = (mockMemoryRepository.save as vi.Mock).mock.calls[0][0] as MemoryItem;
    expect(savedItem.content().value()).toBe('Minimal content');
    expect(savedItem.agentId()).toBeNull();
    expect(savedItem.tags().isEmpty()).toBe(true);
    expect(savedItem.source().value()).toBeNull();
    expect(savedItem.embedding().value()).toBeNull();
  });

  // --- Update Scenarios ---
  it('should successfully update an existing memory item content and embedding', async () => {
    (mockMemoryRepository.findById as vi.Mock).mockResolvedValue(ok(existingMemoryItem));
    (mockMemoryRepository.save as vi.Mock).mockImplementation(async (item: MemoryItem) => ok(item));
    const updateTime = new Date(Date.now() + 1000);
    vi.setSystemTime(updateTime);

    const input: SaveMemoryItemUseCaseInput = {
      id: existingItemId.value(),
      content: 'Updated content',
      embedding: [0.9, 0.8],
    };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(mockMemoryRepository.save).toHaveBeenCalledTimes(1);
    const savedItem = (mockMemoryRepository.save as vi.Mock).mock.calls[0][0] as MemoryItem;
    if (result.isOk()) {
      expect(result.value.memoryItemId).toBe(existingItemId.value());
      expect(savedItem.content().value()).toBe('Updated content');
      expect(savedItem.embedding().value()).toEqual([0.9, 0.8]);
      expect(new Date(result.value.updatedAt)).toEqual(updateTime);
      expect(new Date(result.value.createdAt)).toEqual(existingMemoryItem.createdAt());
    }
  });

  it('should update tags, source, and agentId of an existing item', async () => {
    (mockMemoryRepository.findById as vi.Mock).mockResolvedValue(ok(existingMemoryItem));
    (mockMemoryRepository.save as vi.Mock).mockImplementation(async (item: MemoryItem) => ok(item));
    const newAgentId = Identity.generate();
    const input: SaveMemoryItemUseCaseInput = {
      id: existingItemId.value(),
      content: existingMemoryItem.content().value(), // content same
      tags: ['updated_tag'],
      source: 'updated_source',
      agentId: newAgentId.value(),
    };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const savedItem = (mockMemoryRepository.save as vi.Mock).mock.calls[0][0] as MemoryItem;
    expect(savedItem.tags().list()).toEqual(['updated_tag']);
    expect(savedItem.source().value()).toBe('updated_source');
    expect(savedItem.agentId()?.equals(newAgentId)).toBe(true);
  });

   it('should clear optional fields (agentId, source, embedding, tags) if null/empty array is provided in input for update', async () => {
    (mockMemoryRepository.findById as vi.Mock).mockResolvedValue(ok(existingMemoryItem));
    (mockMemoryRepository.save as vi.Mock).mockImplementation(async (item: MemoryItem) => ok(item));
    const input: SaveMemoryItemUseCaseInput = {
      id: existingItemId.value(),
      content: existingMemoryItem.content().value(),
      agentId: null,
      tags: [],
      source: null,
      embedding: null,
    };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const savedItem = (mockMemoryRepository.save as vi.Mock).mock.calls[0][0] as MemoryItem;
    expect(savedItem.agentId()).toBeNull();
    expect(savedItem.tags().isEmpty()).toBe(true);
    expect(savedItem.source().value()).toBeNull();
    expect(savedItem.embedding().value()).toBeNull();
  });


  it('should return NotFoundError if memory item to update is not found', async () => {
    (mockMemoryRepository.findById as vi.Mock).mockResolvedValue(ok(null));
    const input: SaveMemoryItemUseCaseInput = { id: MemoryItemId.generate().value(), content: 'Text' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value).toBeInstanceOf(NotFoundError);
  });

  // --- Error Scenarios ---
  it('should return ZodError for invalid input (e.g., empty content)', async () => {
    const input: SaveMemoryItemUseCaseInput = { content: '' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ZodError);
      expect(result.value.errors[0].message).toBe("Memory content cannot be empty.");
    }
  });

  it('should return ZodError for invalid embedding (empty array)', async () => {
    const input: SaveMemoryItemUseCaseInput = { content: 'Valid content', embedding: [] };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ZodError);
      expect(result.value.errors[0].message).toBe("Embedding array cannot be empty if provided. Use null or omit for no embedding.");
    }
  });


  it('should return ValueError if a VO creation fails', async () => {
    const originalContentCreate = MemoryItemContent.create;
    MemoryItemContent.create = vi.fn().mockImplementation(() => { throw new ValueError("Mocked content VO error"); });
    const input: SaveMemoryItemUseCaseInput = { content: 'This will fail VO' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value).toBeInstanceOf(ValueError);
    MemoryItemContent.create = originalContentCreate;
  });

  it('should return DomainError if repository save fails', async () => {
    (mockMemoryRepository.save as vi.Mock).mockResolvedValue(error(new DomainError('DB save failed')));
    const input: SaveMemoryItemUseCaseInput = { content: 'Valid content' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value.message).toContain('Failed to save memory item');
  });
});
