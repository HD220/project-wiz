// src_refactored/core/application/use-cases/annotation/remove-annotation.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';
import { RemoveAnnotationUseCase } from './remove-annotation.use-case';
import { RemoveAnnotationUseCaseInput } from './remove-annotation.schema';
import { IAnnotationRepository } from '../../../../domain/annotation/ports/annotation-repository.interface';
import { AnnotationId } from '../../../../domain/annotation/value-objects/annotation-id.vo';
import { ok, error } from '../../../../../shared/result';
import { DomainError, NotFoundError } from '../../../../common/errors'; // Assuming NotFoundError might be used by repo

const mockAnnotationRepository: IAnnotationRepository = {
  delete: vi.fn(),
  save: vi.fn(), findById: vi.fn(), findByAgentId: vi.fn(), findByJobId: vi.fn(), listAll: vi.fn(), search: vi.fn(),
};

describe('RemoveAnnotationUseCase', () => {
  let useCase: RemoveAnnotationUseCase;
  const testAnnotationId = AnnotationId.generate();

  beforeEach(() => {
    vi.resetAllMocks();
    useCase = new RemoveAnnotationUseCase(mockAnnotationRepository);
  });

  it('should successfully indicate removal when repository delete is successful', async () => {
    (mockAnnotationRepository.delete as vi.Mock).mockResolvedValue(ok(undefined));
    const input: RemoveAnnotationUseCaseInput = { annotationId: testAnnotationId.value() };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.success).toBe(true);
      expect(result.value.annotationId).toBe(testAnnotationId.value());
    }
    expect(mockAnnotationRepository.delete).toHaveBeenCalledWith(expect.objectContaining({ _value: testAnnotationId.value() }));
  });

  it('should return success:true even if repository delete implies "not found" by not erroring', async () => {
    // This tests the case where the repository's delete operation is idempotent
    // and doesn't throw an error if the item to be deleted doesn't exist.
    (mockAnnotationRepository.delete as vi.Mock).mockResolvedValue(ok(undefined));
    const nonExistentId = AnnotationId.generate().value();
    const input: RemoveAnnotationUseCaseInput = { annotationId: nonExistentId };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.success).toBe(true); // Success because the state is "it's not there"
      expect(result.value.annotationId).toBe(nonExistentId);
    }
  });

  // If repository's delete *does* return a specific error for "not found", that would be a different test.
  // For example, if it returned error(new NotFoundError(...)), the use case might propagate that.
  // The current use case implementation assumes delete() returns void on success or a DomainError.

  it('should return ZodError for invalid annotationId format', async () => {
    const input: RemoveAnnotationUseCaseInput = { annotationId: 'not-a-uuid' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ZodError);
      expect(result.value.errors[0].message).toBe("Annotation ID must be a valid UUID.");
    }
  });

  it('should return DomainError if repository delete operation fails', async () => {
    const repoError = new DomainError('Database delete error');
    (mockAnnotationRepository.delete as vi.Mock).mockResolvedValue(error(repoError));
    const input: RemoveAnnotationUseCaseInput = { annotationId: testAnnotationId.value() };
    const result = await useCase.execute(input);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(DomainError);
      expect(result.value.message).toContain('Failed to delete annotation');
    }
  });

  it('should return DomainError for unexpected errors during VO creation', async () => {
    const originalFromString = AnnotationId.fromString;
    AnnotationId.fromString = vi.fn().mockImplementation(() => { throw new Error("Mocked VO error"); });

    const input: RemoveAnnotationUseCaseInput = { annotationId: testAnnotationId.value() };
    const result = await useCase.execute(input);

    expect(result.isError()).toBe(true);
    if(result.isError()){
        expect(result.value).toBeInstanceOf(DomainError);
        expect(result.value.message).toContain("Unexpected error removing annotation");
    }
    AnnotationId.fromString = originalFromString; // Restore
  });
});
