// src_refactored/core/application/use-cases/memory/search-memory-items.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchMemoryItemsUseCase } from './search-memory-items.use-case';
import { IMemoryRepository, IMemoryRepositoryToken } from '../../../domain/memory/ports/memory-repository.interface';
import { ILoggerService, ILoggerServiceToken } from '../../../common/services/i-logger.service';
import { MemoryItem } from '../../../domain/memory/memory-item.entity';
import { MemoryItemId } from '../../../domain/memory/value-objects/memory-item-id.vo';
import { MemoryItemContent } from '../../../domain/memory/value-objects/memory-item-content.vo';
import { MemoryItemTags } from '../../../domain/memory/value-objects/memory-item-tags.vo';
import { MemoryItemSource } from '../../../domain/memory/value-objects/memory-item-source.vo';
import { MemoryItemEmbedding } from '../../../domain/memory/value-objects/memory-item-embedding.vo';
import { Identity } from '../../../common/value-objects/identity.vo';
import { PaginatedMemoryItemsResult } from '../../../domain/memory/ports/memory-repository.types';
import { SearchMemoryItemsUseCaseInput } from './search-memory-items.schema';
import { Result, ok, error as resultError, isSuccess, isError } from '../../../../shared/result'; // Updated imports
import { ApplicationError, DomainError, ValueError } from '../../../common/errors'; // Added ValueError
import { Container } from 'inversify';
import 'reflect-metadata'; // Required for Inversify

const CONTENT_EXCERPT_LENGTH = 200;

// Mock implementations
const mockLoggerService: ILoggerService = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  setContext: vi.fn(),
};

const mockMemoryRepository: IMemoryRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  findByAgentId: vi.fn(),
  delete: vi.fn(),
  searchSimilar: vi.fn(),
  listAll: vi.fn(),
  search: vi.fn(),
};

describe('SearchMemoryItemsUseCase', () => {
  let container: Container;
  let useCase: SearchMemoryItemsUseCase;

  beforeEach(() => {
    container = new Container({ defaultScope: 'Singleton' }); // Ensure singletons for mocks if needed elsewhere
    container.bind<IMemoryRepository>(IMemoryRepositoryToken).toConstantValue(mockMemoryRepository);
    container.bind<ILoggerService>(ILoggerServiceToken).toConstantValue(mockLoggerService);
    container.bind(SearchMemoryItemsUseCase).toSelf();

    useCase = container.get(SearchMemoryItemsUseCase);
    vi.clearAllMocks();
  });

  // Define some valid UUIDs for testing
  const VALID_UUID_1 = '123e4567-e89b-12d3-a456-426614174000';
  const VALID_UUID_2 = '987e6543-e21b-12d3-a456-426614174001';
  const VALID_AGENT_ID_1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';


  const createMockMemoryItem = (id: string, content: string, agentId?: string | null, tags?: string[], source?: string | null): MemoryItem => {
    const itemProps = {
      id: MemoryItemId.fromString(id),
      content: MemoryItemContent.create(content),
      tags: MemoryItemTags.create(tags || []),
      source: MemoryItemSource.create(source || null),
      embedding: MemoryItemEmbedding.create(null),
      agentId: agentId === undefined ? undefined : (agentId === null ? null : Identity.create(agentId)),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return MemoryItem.create(itemProps);
  };

  it('should return a successful result with paginated memory items on valid input', async () => {
    const input: SearchMemoryItemsUseCaseInput = { // Zod defaults will apply for page/pageSize
      queryText: 'test query',
      tags: ['tag1'],
      page: 1,
      pageSize: 10,
    };

    const mockItem1 = createMockMemoryItem(VALID_UUID_1, 'This is a test content for item 1 related to query.', VALID_AGENT_ID_1, ['tag1', 'tag2']);
    const mockItems: MemoryItem[] = [mockItem1];
    const mockRepoResult: PaginatedMemoryItemsResult = {
      items: mockItems,
      totalCount: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };
    (mockMemoryRepository.search as vi.Mock).mockResolvedValue(ok(mockRepoResult));

    const result = await useCase.execute(input);

    expect(isSuccess(result)).toBe(true);
    if (!isSuccess(result)) throw new Error("Test failed: expected success"); // Type guard
    const output = result.value;
    expect(output.items.length).toBe(1);
    expect(output.totalCount).toBe(1);
    expect(output.page).toBe(1);
    expect(output.pageSize).toBe(10);
    expect(output.totalPages).toBe(1);
    expect(output.items[0].id).toBe(VALID_UUID_1);
    expect(output.items[0].contentExcerpt).toBe('This is a test content for item 1 related to query.');
    expect(output.items[0].agentId).toBe(VALID_AGENT_ID_1);
    expect(output.items[0].tags).toEqual(['tag1', 'tag2']);

    expect(mockMemoryRepository.search).toHaveBeenCalledWith(
      expect.objectContaining({ queryText: 'test query', tags: ['tag1'] }),
      { page: 1, pageSize: 10 }
    );
  });

  it('should correctly create content excerpts', async () => {
    const longContent = 'a'.repeat(CONTENT_EXCERPT_LENGTH + 50);
    const expectedExcerpt = 'a'.repeat(CONTENT_EXCERPT_LENGTH) + '...';
    const input: SearchMemoryItemsUseCaseInput = { page: 1, pageSize: 10 }; // Zod defaults will apply
    const mockItem1 = createMockMemoryItem(VALID_UUID_1, longContent);
    const mockRepoResult: PaginatedMemoryItemsResult = {
      items: [mockItem1], totalCount: 1, page: 1, pageSize: 10, totalPages: 1,
    };
    (mockMemoryRepository.search as vi.Mock).mockResolvedValue(ok(mockRepoResult));

    const result = await useCase.execute(input);
    expect(isSuccess(result)).toBe(true);
    if (!isSuccess(result)) throw new Error("Test failed: expected success");
    expect(result.value.items[0].contentExcerpt).toBe(expectedExcerpt);
  });

  it('should handle empty search results successfully', async () => {
    const input: SearchMemoryItemsUseCaseInput = { queryText: 'nonexistent' };
    const mockRepoResult: PaginatedMemoryItemsResult = {
      items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0,
    };
    (mockMemoryRepository.search as vi.Mock).mockResolvedValue(ok(mockRepoResult));

    const result = await useCase.execute(input);

    expect(isSuccess(result)).toBe(true);
    if (!isSuccess(result)) throw new Error("Test failed: expected success");
    const output = result.value;
    expect(output.items.length).toBe(0);
    expect(output.totalCount).toBe(0);
    expect(output.totalPages).toBe(0);
  });

  it('should return a Failure on input validation error (e.g. invalid agentId format)', async () => {
    const input: SearchMemoryItemsUseCaseInput = { agentId: 'invalid-uuid' };
    const result = await useCase.execute(input);

    expect(isError(result)).toBe(true);
    if (!isError(result)) throw new Error("Test failed: expected error");
    expect(result.error).toBeInstanceOf(ApplicationError);
    expect(result.error.message).toContain('Invalid filter parameter: Invalid UUID format for Identity: invalid-uuid');
    expect(mockMemoryRepository.search).not.toHaveBeenCalled();
  });

  it('should return a Failure if agentId is provided as empty string (caught by UUID validation in Zod)', async () => {
    const input: SearchMemoryItemsUseCaseInput = { agentId: '' };
    const result = await useCase.execute(input);
    expect(isError(result)).toBe(true);
    if (!isError(result)) throw new Error("Test failed: expected error");
    expect(result.error).toBeInstanceOf(ApplicationError);
    expect(result.error.message).toContain('agentId: Invalid uuid');
  });

  it('should return a Failure if repository search fails', async () => {
    const input: SearchMemoryItemsUseCaseInput = { };
    const domainError = new DomainError('Repository database error');
    (mockMemoryRepository.search as vi.Mock).mockResolvedValue(resultError(domainError));

    const result = await useCase.execute(input);

    expect(isError(result)).toBe(true);
    if (!isError(result)) throw new Error("Test failed: expected error");
    expect(result.error).toBeInstanceOf(ApplicationError);
    expect(result.error.message).toContain('Search operation failed: Repository database error');
  });

  it('should return a Failure on unexpected error during repository call', async () => {
    const input: SearchMemoryItemsUseCaseInput = { };
    (mockMemoryRepository.search as vi.Mock).mockRejectedValue(new Error('Unexpected DB crash'));

    const result = await useCase.execute(input);

    expect(isError(result)).toBe(true);
    if (!isError(result)) throw new Error("Test failed: expected error");
    expect(result.error).toBeInstanceOf(ApplicationError);
    expect(result.error.message).toContain('An unexpected error occurred: Unexpected DB crash');
  });

  it('should pass agentId as Identity VO to repository if valid string', async () => {
    const validAgentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const input: SearchMemoryItemsUseCaseInput = { agentId: validAgentId };
    const mockRepoResult: PaginatedMemoryItemsResult = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 };
    (mockMemoryRepository.search as vi.Mock).mockResolvedValue(ok(mockRepoResult));

    await useCase.execute(input);

    const expectedAgentIdVO = Identity.create(validAgentId); // Identity.create throws on error
    expect(mockMemoryRepository.search).toHaveBeenCalledWith(
      expect.objectContaining({ agentId: expectedAgentIdVO }),
      expect.anything()
    );
  });

  it('should pass agentId as null to repository if input agentId is null', async () => {
    const input: SearchMemoryItemsUseCaseInput = { agentId: null };
    const mockRepoResult: PaginatedMemoryItemsResult = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 };
    (mockMemoryRepository.search as vi.Mock).mockResolvedValue(ok(mockRepoResult));

    await useCase.execute(input);

    expect(mockMemoryRepository.search).toHaveBeenCalledWith(
      expect.objectContaining({ agentId: null }),
      expect.anything()
    );
  });

  it('should pass agentId as undefined in filters if input agentId is undefined (not provided)', async () => {
    const input: SearchMemoryItemsUseCaseInput = { };
    const mockRepoResult: PaginatedMemoryItemsResult = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 };
    (mockMemoryRepository.search as vi.Mock).mockResolvedValue(ok(mockRepoResult));

    await useCase.execute(input);

    const calls = (mockMemoryRepository.search as vi.Mock).mock.calls;
    expect(calls[0][0].agentId).toBeUndefined();
  });


  it('should use default page and pageSize from Zod schema if not provided in input', async () => {
    const input: SearchMemoryItemsUseCaseInput = {};
    const mockRepoResult: PaginatedMemoryItemsResult = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 };
    (mockMemoryRepository.search as vi.Mock).mockResolvedValue(ok(mockRepoResult));

    await useCase.execute(input);

    expect(mockMemoryRepository.search).toHaveBeenCalledWith(
      expect.anything(),
      { page: 1, pageSize: 20 }
    );
  });

  it('should handle tags correctly in search filters', async () => {
    const input: SearchMemoryItemsUseCaseInput = { tags: ['test', 'another'] };
    const mockRepoResult: PaginatedMemoryItemsResult = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 };
    (mockMemoryRepository.search as vi.Mock).mockResolvedValue(ok(mockRepoResult));

    await useCase.execute(input);

    expect(mockMemoryRepository.search).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['test', 'another'] }),
      expect.objectContaining({ page: 1, pageSize: 20 })
    );
  });

  it('should correctly map MemoryItem without agentId to MemoryListItem with null agentId', async () => {
    const input: SearchMemoryItemsUseCaseInput = { };
    const mockItem = createMockMemoryItem(VALID_UUID_1, 'content', undefined);
    const mockRepoResult: PaginatedMemoryItemsResult = {
      items: [mockItem], totalCount: 1, page: 1, pageSize: 20, totalPages: 1,
    };
    (mockMemoryRepository.search as vi.Mock).mockResolvedValue(ok(mockRepoResult));

    const result = await useCase.execute(input);
    expect(isSuccess(result)).toBe(true);
    if (!isSuccess(result)) throw new Error("Test failed: expected success");
    expect(result.value.items[0].agentId).toBeNull();
  });

  it('should correctly map MemoryItem with null agentId to MemoryListItem with null agentId', async () => {
    const input: SearchMemoryItemsUseCaseInput = { };
    const mockItem = createMockMemoryItem(VALID_UUID_1, 'content', null);
    const mockRepoResult: PaginatedMemoryItemsResult = {
      items: [mockItem], totalCount: 1, page: 1, pageSize: 20, totalPages: 1,
    };
    (mockMemoryRepository.search as vi.Mock).mockResolvedValue(ok(mockRepoResult));

    const result = await useCase.execute(input);
    expect(isSuccess(result)).toBe(true);
    if (!isSuccess(result)) throw new Error("Test failed: expected success");
    expect(result.value.items[0].agentId).toBeNull();
  });

  it('should handle empty tags and source in MemoryItem correctly, mapping to empty array and null respectively', async () => {
    const input: SearchMemoryItemsUseCaseInput = {};
    const mockItem = createMockMemoryItem(VALID_UUID_2, 'content', VALID_AGENT_ID_1, [], null);
     const mockRepoResult: PaginatedMemoryItemsResult = {
      items: [mockItem], totalCount: 1, page: 1, pageSize: 20, totalPages: 1,
    };
    (mockMemoryRepository.search as vi.Mock).mockResolvedValue(ok(mockRepoResult));

    const result = await useCase.execute(input);
    expect(isSuccess(result)).toBe(true);
    if (!isSuccess(result)) throw new Error("Test failed: expected success");
    const listItem = result.value.items[0];
    expect(listItem.tags).toEqual([]);
    expect(listItem.source).toBeNull();
  });
});
