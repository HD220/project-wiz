// src_refactored/core/application/use-cases/memory/search-similar-memory-items.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchSimilarMemoryItemsUseCase } from './search-similar-memory-items.use-case';
import { IMemoryRepository, IMemoryRepositoryToken } from '../../../../domain/memory/ports/memory-repository.interface';
import { ILoggerService, ILoggerServiceToken } from '../../../common/services/i-logger.service';
import { SearchSimilarMemoryItemsUseCaseInput } from './search-similar-memory-items.schema';
import { MemoryItem } from '../../../../domain/memory/memory-item.entity';
import { MemoryItemId } from '../../../../domain/memory/value-objects/memory-item-id.vo';
import { MemoryItemContent } from '../../../../domain/memory/value-objects/memory-item-content.vo';
import { MemoryItemTags } from '../../../../domain/memory/value-objects/memory-item-tags.vo';
import { MemoryItemSource } from '../../../../domain/memory/value-objects/memory-item-source.vo';
import { MemoryItemEmbedding } from '../../../../domain/memory/value-objects/memory-item-embedding.vo';
import { Identity } from '../../../../common/value-objects/identity.vo';
import { Result, ok, error as resultError, isSuccess, isError } from '../../../../../shared/result';
import { ApplicationError, DomainError, ValueError } from '../../../../common/errors';
import { Container } from 'inversify';
import 'reflect-metadata';

// Mock implementations
const mockLoggerService: ILoggerService = {
  debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), setContext: vi.fn(),
};

const mockMemoryRepository: IMemoryRepository = {
  save: vi.fn(), findById: vi.fn(), findByAgentId: vi.fn(), delete: vi.fn(),
  searchSimilar: vi.fn(), listAll: vi.fn(), search: vi.fn(),
};

describe('SearchSimilarMemoryItemsUseCase', () => {
  let container: Container;
  let useCase: SearchSimilarMemoryItemsUseCase;

  const validEmbeddingArray = [0.1, 0.2, 0.3, 0.4, 0.5];
  const validAgentIdString = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const defaultLimit = 10;

  const createMockMemoryItem = (id: string, content: string, agentId?: string | null): MemoryItem => {
    return MemoryItem.create({
      id: MemoryItemId.fromString(id),
      content: MemoryItemContent.create(content),
      agentId: agentId === undefined ? undefined : (agentId === null ? null : Identity.fromString(agentId)),
      tags: MemoryItemTags.create(['test']),
      source: MemoryItemSource.create('test-source'),
      embedding: MemoryItemEmbedding.create(null), // Not relevant for output DTO here
      createdAt: new Date('2023-01-01T10:00:00Z'),
      updatedAt: new Date('2023-01-01T11:00:00Z'),
    });
  };

  beforeEach(() => {
    container = new Container({ defaultScope: 'Singleton' });
    container.bind<IMemoryRepository>(IMemoryRepositoryToken).toConstantValue(mockMemoryRepository);
    container.bind<ILoggerService>(ILoggerServiceToken).toConstantValue(mockLoggerService);
    container.bind(SearchSimilarMemoryItemsUseCase).toSelf();

    useCase = container.get(SearchSimilarMemoryItemsUseCase);
    vi.clearAllMocks();
  });

  it('should return similar memory items on successful search', async () => {
    const input: SearchSimilarMemoryItemsUseCaseInput = { queryEmbedding: validEmbeddingArray, limit: 5 };
    const mockItem1 = createMockMemoryItem('id1', 'Similar content 1', validAgentIdString);
    const mockItem2 = createMockMemoryItem('id2', 'Similar content 2', null);
    (mockMemoryRepository.searchSimilar as vi.Mock).mockResolvedValue(ok([mockItem1, mockItem2]));

    const result = await useCase.execute(input);

    expect(isSuccess(result)).toBe(true);
    if (!isSuccess(result)) throw new Error('Test failed');
    expect(result.value.items.length).toBe(2);
    expect(result.value.items[0].id).toBe('id1');
    expect(result.value.items[1].id).toBe('id2');
    expect(result.value.items[0].relevanceScore).toBeUndefined(); // As per current implementation
    expect(mockMemoryRepository.searchSimilar).toHaveBeenCalledWith(
      expect.any(MemoryItemEmbedding), // embeddingVo
      undefined, // agentIdVo (undefined as not in input)
      5, // limit
    );
    const calledEmbedding = (mockMemoryRepository.searchSimilar as vi.Mock).mock.calls[0][0] as MemoryItemEmbedding;
    expect(calledEmbedding.value()).toEqual(validEmbeddingArray);
  });

  it('should use default limit if not provided', async () => {
    const input: SearchSimilarMemoryItemsUseCaseInput = { queryEmbedding: validEmbeddingArray };
    (mockMemoryRepository.searchSimilar as vi.Mock).mockResolvedValue(ok([]));
    await useCase.execute(input);
    expect(mockMemoryRepository.searchSimilar).toHaveBeenCalledWith(
      expect.any(MemoryItemEmbedding), undefined, defaultLimit
    );
  });

  it('should pass agentId to repository if provided', async () => {
    const input: SearchSimilarMemoryItemsUseCaseInput = { queryEmbedding: validEmbeddingArray, agentId: validAgentIdString };
    (mockMemoryRepository.searchSimilar as vi.Mock).mockResolvedValue(ok([]));
    await useCase.execute(input);
    expect(mockMemoryRepository.searchSimilar).toHaveBeenCalledWith(
      expect.any(MemoryItemEmbedding),
      expect.objectContaining({ value: validAgentIdString }), // agentIdVo
      defaultLimit,
    );
  });

  it('should pass agentId as undefined to repository if input agentId is null', async () => {
    const input: SearchSimilarMemoryItemsUseCaseInput = { queryEmbedding: validEmbeddingArray, agentId: null };
    (mockMemoryRepository.searchSimilar as vi.Mock).mockResolvedValue(ok([]));
    await useCase.execute(input);
    expect(mockMemoryRepository.searchSimilar).toHaveBeenCalledWith(
      expect.any(MemoryItemEmbedding),
      undefined, // agentIdVo should be undefined for null input agentId
      defaultLimit,
    );
  });

  it('should return ZodError for invalid input (e.g., empty queryEmbedding)', async () => {
    const input: any = { queryEmbedding: [] }; // Invalid input
    const result = await useCase.execute(input);
    expect(isError(result)).toBe(true);
    if (!isError(result)) throw new Error('Test failed');
    expect(result.error.name).toBe('ZodError');
    expect(mockMemoryRepository.searchSimilar).not.toHaveBeenCalled();
  });

  it('should return ApplicationError for invalid agentId format (ValueError during VO creation)', async () => {
    const input: SearchSimilarMemoryItemsUseCaseInput = { queryEmbedding: validEmbeddingArray, agentId: 'invalid-uuid' };
    // Zod schema for agentId allows any string if optional, but Identity.fromString will throw
    // This test assumes Zod validation for UUID format is in the schema, otherwise this test would catch it.
    // If schema validates UUID, ZodError is returned first. This tests if VO creation itself fails.
    const originalFromString = Identity.fromString;
    Identity.fromString = vi.fn().mockImplementationOnce(() => { throw new ValueError("Mocked Identity error"); });

    const result = await useCase.execute(input);
    expect(isError(result)).toBe(true);
    if (!isError(result)) throw new Error('Test failed');
    expect(result.error).toBeInstanceOf(ApplicationError);
    expect(result.error.message).toContain('Invalid input parameter: Mocked Identity error');

    Identity.fromString = originalFromString; // Restore
  });

  it('should return ApplicationError if MemoryItemEmbedding.create throws ValueError', async () => {
    const input: SearchSimilarMemoryItemsUseCaseInput = { queryEmbedding: validEmbeddingArray };
    const originalCreate = MemoryItemEmbedding.create;
    MemoryItemEmbedding.create = vi.fn().mockImplementationOnce(() => { throw new ValueError("Mocked Embedding VO error"); });

    const result = await useCase.execute(input);
    expect(isError(result)).toBe(true);
    if (!isError(result)) throw new Error("Test failed");
    expect(result.error).toBeInstanceOf(ApplicationError);
    expect(result.error.message).toContain("Invalid input parameter: Mocked Embedding VO error");

    MemoryItemEmbedding.create = originalCreate; // Restore
  });


  it('should return ApplicationError if repository searchSimilar fails', async () => {
    const input: SearchSimilarMemoryItemsUseCaseInput = { queryEmbedding: validEmbeddingArray };
    const domainError = new DomainError('Vector DB unavailable');
    (mockMemoryRepository.searchSimilar as vi.Mock).mockResolvedValue(resultError(domainError));

    const result = await useCase.execute(input);
    expect(isError(result)).toBe(true);
    if (!isError(result)) throw new Error('Test failed');
    expect(result.error).toBeInstanceOf(ApplicationError);
    expect(result.error.message).toContain('Failed to search similar memory items: Vector DB unavailable');
  });

  it('should correctly map items, including excerpt and undefined relevanceScore', async () => {
    const longContent = "This is a very long string of text that is intended to be much longer than the standard excerpt length, which is typically around two hundred characters or so, to properly test the excerpt generation logic.";
    const mockItem = createMockMemoryItem('long-id', longContent, validAgentIdString);
    (mockMemoryRepository.searchSimilar as vi.Mock).mockResolvedValue(ok([mockItem]));
    const input: SearchSimilarMemoryItemsUseCaseInput = { queryEmbedding: validEmbeddingArray };

    const result = await useCase.execute(input);
    expect(isSuccess(result)).toBe(true);
    if (!isSuccess(result)) throw new Error('Test failed');
    const outputItem = result.value.items[0];
    expect(outputItem.id).toBe('long-id');
    expect(outputItem.contentExcerpt.length).toBeLessThan(longContent.length);
    expect(outputItem.contentExcerpt.endsWith('...')).toBe(true);
    expect(outputItem.relevanceScore).toBeUndefined();
  });
});
