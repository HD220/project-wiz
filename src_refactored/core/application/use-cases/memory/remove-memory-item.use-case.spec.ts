// src_refactored/core/application/use-cases/memory/remove-memory-item.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RemoveMemoryItemUseCase } from './remove-memory-item.use-case';
import { IMemoryRepository, IMemoryRepositoryToken } from '../../../../domain/memory/ports/memory-repository.interface';
import { ILoggerService, ILoggerServiceToken } from '../../../common/services/i-logger.service';
import { RemoveMemoryItemUseCaseInput } from './remove-memory-item.schema';
import { Result, ok, error as resultError, isSuccess, isError } from '../../../../../shared/result';
import { ApplicationError, DomainError, ValueError } from '../../../../common/errors';
import { MemoryItemId } from '../../../../domain/memory/value-objects/memory-item-id.vo';
import { Container } from 'inversify';
import 'reflect-metadata'; // Required for Inversify

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

describe('RemoveMemoryItemUseCase', () => {
  let container: Container;
  let useCase: RemoveMemoryItemUseCase;

  const validMemoryItemId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  beforeEach(() => {
    container = new Container({ defaultScope: 'Singleton' });
    container.bind<IMemoryRepository>(IMemoryRepositoryToken).toConstantValue(mockMemoryRepository);
    container.bind<ILoggerService>(ILoggerServiceToken).toConstantValue(mockLoggerService);
    container.bind(RemoveMemoryItemUseCase).toSelf();

    useCase = container.get(RemoveMemoryItemUseCase);
    vi.clearAllMocks();
  });

  it('should return success true when memory item is deleted successfully', async () => {
    const input: RemoveMemoryItemUseCaseInput = { memoryItemId: validMemoryItemId };
    (mockMemoryRepository.delete as vi.Mock).mockResolvedValue(ok(undefined)); // `delete` returns Result<void, DomainError>

    const result = await useCase.execute(input);

    expect(isSuccess(result)).toBe(true);
    if (!isSuccess(result)) throw new Error('Test failed: expected success');
    expect(result.value.memoryItemId).toBe(validMemoryItemId);
    expect(result.value.success).toBe(true);
    expect(mockMemoryRepository.delete).toHaveBeenCalledWith(expect.any(MemoryItemId));
    expect((mockMemoryRepository.delete as vi.Mock).mock.calls[0][0].value).toBe(validMemoryItemId);
    expect(mockLoggerService.info).toHaveBeenCalledWith(
      `RemoveMemoryItemUseCase: Memory item ${validMemoryItemId} processed for deletion.`
    );
  });

  it('should return success true even if item did not exist (idempotency)', async () => {
    // Assuming repository.delete is idempotent and returns ok() if item not found,
    // or does not throw a specific "NotFound" error that the use case would treat differently.
    // The current use case logic returns success:true if repo.delete returns ok().
    const input: RemoveMemoryItemUseCaseInput = { memoryItemId: validMemoryItemId };
    (mockMemoryRepository.delete as vi.Mock).mockResolvedValue(ok(undefined));

    const result = await useCase.execute(input);

    expect(isSuccess(result)).toBe(true);
    if (!isSuccess(result)) throw new Error('Test failed: expected success');
    expect(result.value.success).toBe(true);
    expect(result.value.memoryItemId).toBe(validMemoryItemId);
  });

  it('should return a ZodError if input validation fails (e.g. invalid memoryItemId format)', async () => {
    const input: RemoveMemoryItemUseCaseInput = { memoryItemId: 'invalid-uuid-format' };
    const result = await useCase.execute(input);

    expect(isError(result)).toBe(true);
    if (!isError(result)) throw new Error('Test failed: expected error');
    expect(result.error.name).toBe('ZodError'); // ZodError is directly returned
    expect(mockMemoryRepository.delete).not.toHaveBeenCalled();
  });

  it('should return an ApplicationError if MemoryItemId.fromString throws ValueError', async () => {
    // This test is more specific for the case where Zod validation passes (e.g. if UUID check was less strict)
    // but MemoryItemId VO creation fails. Given current Zod schema, this is less likely for format,
    // but good to cover the internal try-catch for VO creation.
    // To force this, we'd have to mock MemoryItemId.fromString to throw.
    // For simplicity, we'll rely on Zod to catch format errors as per previous test.
    // If MemoryItemId had other complex validation beyond UUID format, this test would be more critical.
    // For now, let's assume Zod's UUID check is the primary guard for format.
    // If we wanted to test the internal catch block for VO creation, we'd mock MemoryItemId.fromString.
    // For example:
    const failingInput: RemoveMemoryItemUseCaseInput = { memoryItemId: validMemoryItemId }; // Valid format for Zod
    const originalFromString = MemoryItemId.fromString;
    MemoryItemId.fromString = vi.fn().mockImplementationOnce(() => { throw new ValueError("Mocked VO error"); });

    const result = await useCase.execute(failingInput);
    expect(isError(result)).toBe(true);
    if (!isError(result)) throw new Error("Test failed");
    expect(result.error).toBeInstanceOf(ApplicationError);
    expect(result.error.message).toContain("Invalid memory item ID format: Mocked VO error");

    MemoryItemId.fromString = originalFromString; // Restore original
  });


  it('should return an ApplicationError if repository delete operation fails', async () => {
    const input: RemoveMemoryItemUseCaseInput = { memoryItemId: validMemoryItemId };
    const domainError = new DomainError('Repository database connection error');
    (mockMemoryRepository.delete as vi.Mock).mockResolvedValue(resultError(domainError));

    const result = await useCase.execute(input);

    expect(isError(result)).toBe(true);
    if (!isError(result)) throw new Error('Test failed: expected error');
    expect(result.error).toBeInstanceOf(ApplicationError);
    expect(result.error.message).toContain('Failed to delete memory item: Repository database connection error');
    expect(mockLoggerService.error).toHaveBeenCalledWith(
      `RemoveMemoryItemUseCase: Repository failed to delete memory item ${validMemoryItemId}.`,
      domainError,
    );
  });

  it('should return an ApplicationError on unexpected error during VO creation', async () => {
    const input: RemoveMemoryItemUseCaseInput = { memoryItemId: validMemoryItemId };
    const originalFromString = MemoryItemId.fromString;
    const unexpectedError = new Error("Completely unexpected");
    MemoryItemId.fromString = vi.fn().mockImplementationOnce(() => { throw unexpectedError; });

    const result = await useCase.execute(input);

    expect(isError(result)).toBe(true);
    if (!isError(result)) throw new Error("Test failed");
    expect(result.error).toBeInstanceOf(ApplicationError);
    expect(result.error.message).toContain("Unexpected error with memory item ID: Completely unexpected");

    MemoryItemId.fromString = originalFromString; // Restore
  });
});
